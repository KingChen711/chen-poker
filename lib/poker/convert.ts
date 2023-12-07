import { CardValueToBigInt } from '@/constants/deck'
import { CardValue, Hand } from '@/types'

export function handToFirstBitField(hand: Hand) {
  const handValues = hand?.holeCards.map((card) => card?.value)
  const uniqueValuesSet = new Set(handValues.filter(Boolean))
  const uniqueValues = Array.from(uniqueValuesSet)

  let bitFieldValue = BigInt(0)

  for (const value of uniqueValues) {
    if (value) {
      bitFieldValue += BigInt(1) << CardValueToBigInt.get(value)!
    }
  }

  // const formattedBinary = bitFieldValue.toString(2).padStart(15, '0')

  return bitFieldValue
}

export function handToSecondBitField(hand: Hand) {
  const handValues = hand?.holeCards.map((card) => card?.value)
  const cardValueToAmount = new Map<CardValue, number>()

  for (const cardValue of handValues) {
    if (cardValue) {
      const amount = cardValueToAmount.get(cardValue)
      cardValueToAmount.set(cardValue, amount ? amount + 1 : 1)
    }
  }

  let bitFieldValue = BigInt(0)

  for (const [cardValue, amount] of cardValueToAmount) {
    bitFieldValue += BigInt(Math.pow(2, amount!) - 1) << BigInt(CardValueToBigInt.get(cardValue)! * BigInt(4))
  }

  return bitFieldValue
}

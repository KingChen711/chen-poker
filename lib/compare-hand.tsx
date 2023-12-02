import { CardValueToBigInt, RestToRank } from '@/constants'
import { Card, CardValue, Hand, Rank } from '@/types'

export function handToFirstBitField(hand: Hand) {
  const handValues = hand.cards.map((card) => card?.value)
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
  const handValues = hand.cards.map((card) => card?.value)
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

export function checkFlush(hand: Hand) {
  const handSuites = hand.cards.map((card) => card?.suit)
  const uniqueSuitesSet = new Set(handSuites.filter(Boolean))
  const uniqueSuites = Array.from(uniqueSuitesSet)

  return uniqueSuites.length === 1
}

export function checkRoyalFlushOrStraightFlush(hand: Hand) {
  const bitField = handToFirstBitField(hand)
  const formattedBinary = bitField.toString(2).padStart(15, '0')
  const hasStraight5 = formattedBinary.includes('11111')
  if (!hasStraight5) {
    return false
  }
  const hasStraight6 = formattedBinary.includes('111111')
  const hasStraight7 = formattedBinary.includes('1111111')
  const setCards: Card[][] = []
  if (!hasStraight6) {
    
  }
}

export function checkStraight(hand: Hand) {
  const bitField = handToFirstBitField(hand)
  const formattedBinary = bitField.toString(2).padStart(15, '0')

  return formattedBinary.includes('11111')
}

export function getRank(hand: Hand): Rank {
  const firstBitField = handToFirstBitField(hand)
  const secondBitField = handToSecondBitField(hand)
  const isStraight = checkStraight(hand)
  const isFlush = checkFlush(hand)

  if (isFlush && isStraight) {
    return firstBitField.toString(2).padStart(15, '0').startsWith('11111') ? Rank.RoyalFlush : Rank.StraightFlush
  }

  const rest = Number(BigInt(secondBitField % BigInt(15)))
  const rank = RestToRank.get(rest)
  if (rank === Rank.FourOfKind || rank === Rank.FullHouse) {
    return rank
  }
  if (isFlush) {
    return Rank.Flush
  }
  if (isStraight) {
    return Rank.Straight
  }
  return rank!
}

const ToBreakTieValue = (hand: Hand) => {
  const bigInts = hand.cards
    .map((card) => {
      return card?.value!
    })
    .toSorted((card1, card2) => {
      return Number(CardValueToBigInt.get(card2)! - CardValueToBigInt.get(card1)!)
    })
    .map((card) => CardValueToBigInt.get(card)!)

  return (
    (bigInts[0] << BigInt(16)) +
    (bigInts[1] << BigInt(12)) +
    (bigInts[2] << BigInt(8)) +
    (bigInts[3] << BigInt(4)) +
    (bigInts[4] << BigInt(0))
  )
}

export function compareHand(hand1: Hand, hand2: Hand): number {
  if (hand1.rank !== hand2.rank) {
    return hand2.rank! - hand1.rank!
  }

  return Number(ToBreakTieValue(hand2) - ToBreakTieValue(hand1))
}

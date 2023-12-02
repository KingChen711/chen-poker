import { Hand, Rank } from '@/types'
import {  handToSecondBitField } from './convert'
import { compareCard } from './compare'

export function checkFourOfKind(hand: Hand) {
  const bitField = handToSecondBitField(hand)
  const rest = Number(bitField % BigInt(15))

  // *rest = 3,4 (sure four of kind), 7 (maybe four of kind)
  const noValidRest = rest !== 3 && rest !== 4 && rest !== 7
  if (noValidRest) {
    return false
  }

  if (rest === 7) {
    const handValues = hand.handCards.map((card) => card?.value)
    const uniqueValuesSet = new Set(handValues.filter(Boolean))
    const uniqueValues = Array.from(uniqueValuesSet)

    // check is 7 -> every card discriminated
    if (uniqueValues.length === 7) {
      return false
    }
  }
  // now, this hand is sure four of kind, let's find the rank and cards
  const amountOfValue: any = {}
  for (const card of hand.handCards) {
    const key = card.value.valueOf().toString()
    amountOfValue[key] = amountOfValue[key] ? amountOfValue[key] + 1 : 1
  }

  let fourKindValue: number
  for (const [value, amount] of Object.entries(amountOfValue)) {
    if (amount === 4) {
      fourKindValue = Number(value)
      break
    }
  }

  // this line just pick the 4 card, need to pick the last card
  const cardsResult = hand.handCards.filter((card) => card.value.valueOf() === fourKindValue)
  const lastCard = hand.handCards.filter((card) => card.value.valueOf() !== fourKindValue).toSorted(compareCard)[0]

  return {
    pokerCards: [...cardsResult, lastCard],
    rank: Rank.FourOfKind
  }
}

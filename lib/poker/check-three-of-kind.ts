import { Hand, Rank } from '@/types'
import { handToSecondBitField } from './convert'
import { compareCard } from './compare'

export function checkThreeOfKind(hand: Hand) {
  const bitField = handToSecondBitField(hand)
  const rest = Number(bitField % BigInt(15))

  // *rest = 11 (sure three of kind)
  const noValidRest = rest !== 11
  if (noValidRest) {
    return false
  }

  // now, this hand is sure three of kind, let's find the rank and cards
  const amountOfValue: any = {}
  for (const card of hand.handCards) {
    const key = card.value.valueOf().toString()
    amountOfValue[key] = amountOfValue[key] ? amountOfValue[key] + 1 : 1
  }

  let threeKindValue: number
  for (const [value, amount] of Object.entries(amountOfValue)) {
    if (amount === 3) {
      threeKindValue = Number(value)
      break
    }
  }

  // this line just pick the 3 card, need to pick the 2 last card
  const cardsResult = hand.handCards.filter((card) => card.value.valueOf() === threeKindValue)
  const lastCards = hand.handCards
    .filter((card) => card.value.valueOf() !== threeKindValue)
    .toSorted(compareCard)
    .slice(0, 2)

  return {
    pokerCards: [...cardsResult, ...lastCards],
    rank: Rank.ThreeOfKind
  }
}

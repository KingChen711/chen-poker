import { Hand, Rank } from '@/types'
import { handToSecondBitField } from './convert'
import { compareCard } from './compare'

type AmountOfValue = {
  [key: string]: number
}

export function checkTwoPair(hand: Hand) {
  const bitField = handToSecondBitField(hand)
  const rest = Number(bitField % BigInt(15))

  // *rest = 9,10 (sure 2 pair)
  const noValidRest = rest !== 9 && rest !== 10
  if (noValidRest) {
    return false
  }

  // now, this hand is sure 2 pair, let's find the rank and cards
  const amountOfValue: AmountOfValue = {}
  for (const card of hand.handCards) {
    const key = card.value.valueOf().toString()
    amountOfValue[key] = amountOfValue[key] ? amountOfValue[key] + 1 : 1
  }

  let firstPairValue = 0
  let secondPairValue = 0
  for (const [value, amount] of Object.entries(amountOfValue).toSorted((a, b) => {
    return Number(b[0]) - Number(a[0])
  })) {
    if (amount === 2) {
      if (!firstPairValue) {
        firstPairValue = Number(value)
        continue
      }
      secondPairValue = Number(value)
      break
    }
  }

  const firstPairCards = hand.handCards.filter((card) => card.value.valueOf() === firstPairValue)
  const secondPairCards = hand.handCards.filter((card) => card.value.valueOf() === secondPairValue)
  const lastCard = hand.handCards
    .filter((card) => card.value.valueOf() !== firstPairValue && card.value.valueOf() !== secondPairValue)
    .toSorted(compareCard)[0]

  return {
    pokerCards: [...firstPairCards, ...secondPairCards, lastCard],
    rank: Rank.TwoPair
  }
}

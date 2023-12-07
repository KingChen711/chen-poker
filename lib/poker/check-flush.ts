import { CardSuit, Hand, Rank } from '@/types'
import { compareCard } from './compare'

export function checkFlush(hand: Hand) {
  const amountOfSuit = {
    [CardSuit.Spade]: 0,
    [CardSuit.Club]: 0,
    [CardSuit.Diamond]: 0,
    [CardSuit.Heart]: 0
  }

  for (const card of hand?.holeCards) {
    amountOfSuit[card.suit]++
  }
  for (const [suit, amount] of Object.entries(amountOfSuit)) {
    if (amount >= 5) {
      return {
        pokerCards: hand?.holeCards
          .filter((card) => card.suit.valueOf().toString() === suit)
          .toSorted(compareCard)
          .slice(0, 5),
        rank: Rank.Flush
      }
    }
  }
  return false
}

import { Hand, Rank } from '@/types'
import { compareCard } from './compare'

export function checkHighCard(hand: Hand) {
  return {
    pokerCards: hand.handCards.toSorted(compareCard).slice(0, 5),
    rank: Rank.HighCard
  }
}

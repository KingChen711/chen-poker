import { Card, Hand } from '@/types'
import { checkRoyalFlushOrStraightFlush } from './check-royal-or-straight-flush'
import { checkFourOfKind } from './check-four-of-kind'
import { checkFlush } from './check-flush'
import { checkStraight } from './check-straight'
import { checkFullHouse } from './check-full-house'
import { checkThreeOfKind } from './check-three-of-kind'
import { checkTwoPair } from './check-two-pair'
import { checkOnePair } from './check-one-pair'
import { checkHighCard } from './check-high-card'

export function assignRankHand(hand: Hand, boardCards: Card[]): Hand {
  const cloneHandLHand: Hand = {
    ...hand,
    handCards: [...hand.handCards, ...boardCards]
  }
  const checkRFOrSF = checkRoyalFlushOrStraightFlush(cloneHandLHand)
  if (checkRFOrSF) {
    return { ...checkRFOrSF, handCards: hand.handCards }
  }

  const checkFourKind = checkFourOfKind(cloneHandLHand)
  if (checkFourKind) {
    return { ...checkFourKind, handCards: hand.handCards }
  }

  const checkFullHouseResult = checkFullHouse(cloneHandLHand)
  if (checkFullHouseResult) {
    return { ...checkFullHouseResult, handCards: hand.handCards }
  }

  const checkFlushResult = checkFlush(cloneHandLHand)
  if (checkFlushResult) {
    return { ...checkFlushResult, handCards: hand.handCards }
  }

  const checkStraightResult = checkStraight(cloneHandLHand)
  if (checkStraightResult) {
    return { ...checkStraightResult, handCards: hand.handCards }
  }

  const checkThreeKind = checkThreeOfKind(cloneHandLHand)
  if (checkThreeKind) {
    return { ...checkThreeKind, handCards: hand.handCards }
  }

  const checkTwoPairResult = checkTwoPair(cloneHandLHand)
  if (checkTwoPairResult) {
    return { ...checkTwoPairResult, handCards: hand.handCards }
  }

  const checkOnePairResult = checkOnePair(cloneHandLHand)
  if (checkOnePairResult) {
    return { ...checkOnePairResult, handCards: hand.handCards }
  }

  return { ...checkHighCard(cloneHandLHand), handCards: hand.handCards }
}

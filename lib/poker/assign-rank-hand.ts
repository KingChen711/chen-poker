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

export function assignRankHand(hand: Hand, communityCards: Card[]): Hand {
  const cloneHandLHand: Hand = {
    ...hand,
    holeCards: [...hand?.holeCards, ...communityCards]
  }
  const checkRFOrSF = checkRoyalFlushOrStraightFlush(cloneHandLHand)
  if (checkRFOrSF) {
    return { ...checkRFOrSF, holeCards: hand?.holeCards }
  }

  const checkFourKind = checkFourOfKind(cloneHandLHand)
  if (checkFourKind) {
    return { ...checkFourKind, holeCards: hand?.holeCards }
  }

  const checkFullHouseResult = checkFullHouse(cloneHandLHand)
  if (checkFullHouseResult) {
    return { ...checkFullHouseResult, holeCards: hand?.holeCards }
  }

  const checkFlushResult = checkFlush(cloneHandLHand)
  if (checkFlushResult) {
    return { ...checkFlushResult, holeCards: hand?.holeCards }
  }

  const checkStraightResult = checkStraight(cloneHandLHand)
  if (checkStraightResult) {
    return { ...checkStraightResult, holeCards: hand?.holeCards }
  }

  const checkThreeKind = checkThreeOfKind(cloneHandLHand)
  if (checkThreeKind) {
    return { ...checkThreeKind, holeCards: hand?.holeCards }
  }

  const checkTwoPairResult = checkTwoPair(cloneHandLHand)
  if (checkTwoPairResult) {
    return { ...checkTwoPairResult, holeCards: hand?.holeCards }
  }

  const checkOnePairResult = checkOnePair(cloneHandLHand)
  if (checkOnePairResult) {
    return { ...checkOnePairResult, holeCards: hand?.holeCards }
  }

  return { ...checkHighCard(cloneHandLHand), holeCards: hand?.holeCards }
}

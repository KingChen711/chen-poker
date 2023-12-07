import { Card, CardSuit, Hand, Rank } from '@/types'
import { handToFirstBitField } from './convert'

type CheckSetCardParams = {
  max: number
  min: number
  cards: Card[]
}

function checkSetCard({ cards, min, max }: CheckSetCardParams) {
  const amountOfSuit = {
    [CardSuit.Spade]: 0,
    [CardSuit.Club]: 0,
    [CardSuit.Diamond]: 0,
    [CardSuit.Heart]: 0
  }
  const setCard = []
  for (const card of cards) {
    if (card.value.valueOf() <= max && card.value.valueOf() >= min) {
      setCard.push(card)
    }
  }
  for (const card of setCard) {
    amountOfSuit[card.suit]++
  }
  for (const [suit, amount] of Object.entries(amountOfSuit)) {
    if (amount >= 5) {
      const resultCard = setCard.filter((card) => String(card.suit.valueOf()) === suit)
      if (max === 14) {
        return {
          pokerCards: resultCard,
          rank: Rank.RoyalFlush
        }
      }
      return {
        pokerCards: resultCard,
        rank: Rank.StraightFlush
      }
    }
  }
  return false
}

export function checkRoyalFlushOrStraightFlush(hand: Hand) {
  const cards = hand?.holeCards as Card[]
  const bitField = handToFirstBitField(hand)
  const formattedBinary = bitField.toString(2).padStart(15, '0')

  const hasStraight5 = formattedBinary.includes('11111')
  if (!hasStraight5) {
    return false
  }

  const biggestValue = 14 - formattedBinary.indexOf('11111')

  let checkResult = checkSetCard({ cards, max: biggestValue, min: biggestValue - 4 })
  if (checkResult) {
    return checkResult
  }

  const hasStraight6 = formattedBinary.includes('111111')
  if (!hasStraight6) {
    return false
  }

  checkResult = checkSetCard({ cards, max: biggestValue - 1, min: biggestValue - 5 })
  if (checkResult) {
    return checkResult
  }

  const hasStraight7 = formattedBinary.includes('1111111')
  if (!hasStraight7) {
    return false
  }

  checkResult = checkSetCard({ cards, max: biggestValue - 2, min: biggestValue - 6 })
  if (checkResult) {
    return checkResult
  }

  return false
}

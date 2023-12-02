import { CardValue, Rank } from '@/types'

export const CardValueToBigInt = new Map<CardValue, bigint>([
  [CardValue.Two, BigInt(2)],
  [CardValue.Three, BigInt(3)],
  [CardValue.Four, BigInt(4)],
  [CardValue.Five, BigInt(5)],
  [CardValue.Six, BigInt(6)],
  [CardValue.Seven, BigInt(7)],
  [CardValue.Eight, BigInt(8)],
  [CardValue.Nine, BigInt(9)],
  [CardValue.Ten, BigInt(10)],
  [CardValue.Jack, BigInt(11)],
  [CardValue.King, BigInt(12)],
  [CardValue.Queen, BigInt(13)],
  [CardValue.Ace, BigInt(14)]
])

export const RestToRank = new Map<number, Rank>([
  [1, Rank.FourOfKind],
  [10, Rank.FullHouse],
  [9, Rank.ThreeOfKind],
  [7, Rank.TwoPair],
  [6, Rank.OnePair],
  [5, Rank.HighCard]
])

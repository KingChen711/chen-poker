import { CardValue, Rank } from '@/types'

export const CardValueToBigInt = new Map<CardValue, bigint>([
  ['2', BigInt(2)],
  ['3', BigInt(3)],
  ['4', BigInt(4)],
  ['5', BigInt(5)],
  ['6', BigInt(6)],
  ['7', BigInt(7)],
  ['8', BigInt(8)],
  ['9', BigInt(9)],
  ['10', BigInt(10)],
  ['J', BigInt(11)],
  ['Q', BigInt(12)],
  ['K', BigInt(13)],
  ['A', BigInt(14)]
])

export const RestToRank = new Map<number, Rank>([
  [1, Rank.FourOfKind],
  [10, Rank.FullHouse],
  [9, Rank.ThreeOfKind],
  [7, Rank.TwoPair],
  [6, Rank.OnePair],
  [5, Rank.HighCard]
])

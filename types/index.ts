export enum CardValue {
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
  Jack = 11,
  Queen = 12,
  King = 13,
  Ace = 14
}
export enum CardSuit {
  Spade,
  Club,
  Diamond,
  Heart
}

export type Card = {
  value: CardValue
  suit: CardSuit
}

export enum Rank {
  HighCard,
  OnePair,
  TwoPair,
  ThreeOfKind,
  Straight,
  Flush,
  FullHouse,
  FourOfKind,
  StraightFlush,
  RoyalFlush
}

export type User = {
  id: string
  clerkId: string
  picture: string
  email: string
  username: string
  name: string
  createdAt: string
}

export type Hand = { handCards: Card[]; rank?: Rank; pokerCards?: Card[] }

export type Player = {
  id: string
  user: User
  hand: Hand
}

export type Room = {
  id: string
  roomCode: string
  smallHouse: number
  players: Player[]
  boardCards: Card[]
  folded: string[]
}

export type CardValue = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
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

type User = {
  id: string
  picture: string
  email: string
  username: string
  name: string
  createdAt: string
}

export type Hand = { cards: (Card | null)[]; rank?: Rank }

export type Player = {
  id: string
  user: User
  hand: Hand
}

export type Room = {
  id: string
  roomCode: string
  players: Player[]
  boardCards: [Card | null, Card | null, Card | null]
}

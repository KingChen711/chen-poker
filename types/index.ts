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
  Fold = -1,
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
  currentRoom?: string // room id
}

export type Hand = { handCards: Card[]; rank?: Rank; pokerCards?: Card[] }

// just use in room
export type Player = {
  userId: string
  user: User
  hand: Hand
  balance: number // init 10000
  bet: number
}

// small value = 100, big value = 200

export type Room = {
  id: string
  roomCode: string
  roomOwner: string // user id
  players: Player[]
  inGame: boolean

  turn: number
  checkValue: number
  dealerIndex: number
  deck: Card[]
  dealer: string // user id
  smallHouse: string // user id
  bigHouse: string // user id
  foldPlayers: string[] // user id
  boardCards: Card[]
  checkingPlayers: string[]
  readyPlayers: string[] // ready for next match not to start game
  winner: string | null // user id
  status: 'pre-flop' | 'the-flop' | 'the-turn' | 'the-river' | 'showdown'
}

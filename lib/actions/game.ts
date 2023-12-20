import { updateData } from '@/firebase/services'
import {
  AllInBetParams,
  CallBetParams,
  CheckBetParams,
  CleanUpInGameRoomParams,
  FoldBetParams,
  RaisePetParams,
  ShowDownFoldParams,
  StartGameParams
} from '../params'
import { getRoomById } from './room'
import { getUserById } from './user'
import { BalanceValue, BigBlindValue, SmallBlindValue, deck } from '@/constants/deck'
import { drawCard } from '../utils'
import { Rank, Room, User } from '@/types'
import { assignRankHand } from '../poker/assign-rank-hand'
import { compareHand } from '../poker/compare'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

export async function startGame({ roomId }: StartGameParams) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room!')
  }

  if (room.players.length < 2) {
    throw new Error('At least 2 players to start a game!')
  }

  room.status = 'pre-flop'
  const gameObj = {
    dealerIndex: 0,
    turn: 3, // turn of the player next to the big house
    callingValue: BigBlindValue,
    dealer: room.players[0 % room.players.length].userId,
    smallBlind: room.players[1 % room.players.length].userId,
    bigBlind: room.players[2 % room.players.length].userId,
    communityCards: [],
    deck: [...deck],
    allInPlayers: [],
    checkingPlayers: [],
    foldPlayers: [],
    readyPlayers: [],
    winner: null
  }
  room.gameObj = gameObj
  room.players?.forEach((p) => {
    p.hand = { holeCards: drawCard(gameObj.deck, 2), pokerCards: [], rank: null }
    if (p.userId === gameObj.smallBlind) {
      p.balance = BalanceValue - SmallBlindValue
      p.bet = SmallBlindValue
      return
    }
    if (p.userId === gameObj.bigBlind) {
      p.balance = BalanceValue - BigBlindValue
      p.bet = BigBlindValue
      return
    }
    p.balance = BalanceValue
    p.bet = 0
  })

  await updateData({ collectionName: 'rooms', data: room })
}

export function nextPlayerIndex(room: Room) {
  let turnInCreaseAmount = 1
  const gameObj = room.gameObj!
  while (1) {
    const index = (gameObj.turn + turnInCreaseAmount) % room.players.length
    const nextPlayer = room.players[index].userId

    const isValidNextUser = !gameObj.foldPlayers.includes(nextPlayer) && !gameObj.allInPlayers.includes(nextPlayer)
    if (!isValidNextUser) {
      turnInCreaseAmount++
      continue
    }
    break
  }
  return turnInCreaseAmount + gameObj.turn
}

export async function toNextRound(room: Room) {
  if (room.status === 'pre-flop') {
    return await toTheFlop({ roomId: room.id })
  }

  if (room.status === 'the-flop' || room.status === 'the-turn') {
    return await toTheTurnOrTheRiver({ roomId: room.id })
  }

  if (room.status === 'the-river') {
    return await toShowDown({ roomId: room.id })
  }
}

export async function callBet({ roomId, userId }: CallBetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  const player = room.players.find((p) => p.userId === user.id)

  if (!player) {
    throw new Error('Not found player')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  const diffBet = gameObj.callingValue - player.bet
  player.balance = player.balance - diffBet
  player.bet = gameObj.callingValue

  gameObj.turn = nextPlayerIndex(room)
  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of rouse
  const playerWhoNeedToCall = room.players.find(
    (p) =>
      p.bet < gameObj.callingValue &&
      !gameObj.foldPlayers.includes(p.userId) &&
      !gameObj.allInPlayers.includes(p.userId)
  )
  if (playerWhoNeedToCall) {
    return
  }

  // need to go to next round
  await toNextRound(room)
}

export async function checkBet({ roomId, userId }: CheckBetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  gameObj.checkingPlayers.push(userId)
  gameObj.turn = nextPlayerIndex(room)
  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of rouse
  const conditionEndRound =
    gameObj.checkingPlayers.length + gameObj.foldPlayers.length + gameObj.allInPlayers.length === room.players?.length

  if (!conditionEndRound) {
    return
  }

  await toNextRound(room)
}

export async function raiseBet({ roomId, userId, raiseValue }: RaisePetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  const player = room.players.find((p) => p.userId === user.id)

  if (!player) {
    throw new Error('Not found player')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  const diffBet = gameObj.callingValue - player.bet + raiseValue
  player.balance = player.balance - diffBet
  gameObj.callingValue += raiseValue
  player.bet = gameObj.callingValue
  gameObj.checkingPlayers = []
  gameObj.turn = nextPlayerIndex(room)

  await updateData({ collectionName: 'rooms', data: room })
}

export async function foldBet({ roomId, userId }: FoldBetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  if (room.players.length - gameObj.foldPlayers.length === 2) {
    // it mean that the actor fold when only rest 2 player
    return await showDownFold({ roomId: room.id, lastFoldPlayer: userId })
  }

  gameObj.foldPlayers.push(userId)
  gameObj.turn = nextPlayerIndex(room)

  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of round
  const conditionEndRound =
    gameObj.checkingPlayers.length + gameObj.foldPlayers.length + gameObj.allInPlayers.length === room.players?.length

  if (!conditionEndRound) {
    return
  }

  await toNextRound(room)
}

export async function allInBet({ roomId, userId }: AllInBetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  const player = room.players.find((p) => p.userId === user.id)

  if (!player) {
    throw new Error('Not found player')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  player.bet += player.balance
  player.balance = 0
  gameObj.allInPlayers.push(userId)
  gameObj.turn = nextPlayerIndex(room)

  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of round
  const playerWhoNeedToCall = room.players.find(
    (p) =>
      p.bet < gameObj.callingValue &&
      !gameObj.foldPlayers.includes(p.userId) &&
      !gameObj.allInPlayers.includes(p.userId)
  )
  if (playerWhoNeedToCall) {
    return
  }

  await toNextRound(room)
}

export async function toTheFlop({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  gameObj.turn = gameObj.dealerIndex // set current turn is for dealer
  gameObj.turn = nextPlayerIndex(room) // small blind is the first player of round

  gameObj.checkingPlayers = []
  room.status = 'the-flop'
  gameObj.communityCards = drawCard(gameObj.deck, 3)
  await updateData({ collectionName: 'rooms', data: room })
}

export async function toTheTurnOrTheRiver({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  if (room.status === 'the-flop') {
    room.status = 'the-turn'
  } else if (room.status === 'the-turn') {
    room.status = 'the-river'
  } else {
    throw new Error('Something went wrong!')
  }

  gameObj.turn = gameObj.dealerIndex // set current turn is for dealer
  gameObj.turn = nextPlayerIndex(room) // small blind is the first player of round
  gameObj.checkingPlayers = []
  gameObj.communityCards = [...gameObj.communityCards, ...drawCard(gameObj.deck, 1)]
  await updateData({ collectionName: 'rooms', data: room })
}

export async function toShowDown({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  let pot = 0
  room.status = 'showdown'
  room.players = room.players.map((p) => {
    p.hand = assignRankHand(p.hand, gameObj.communityCards)
    if (gameObj.foldPlayers.includes(p.userId)) {
      p.hand.rank = Rank.Fold
    }
    pot += p.bet
    p.bet = 0
    return p
  })

  gameObj.checkingPlayers = []
  gameObj.winner = [...room.players].sort((p1, p2) => {
    return compareHand(p1.hand, p2.hand)
  })[0].userId

  const winner = room.players.find((p) => p.userId === gameObj.winner)!
  winner.balance += pot

  await updateData({ collectionName: 'rooms', data: room })
}

export async function showDownFold({ roomId, lastFoldPlayer }: ShowDownFoldParams) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  gameObj.foldPlayers.push(lastFoldPlayer)
  gameObj.winner = room.players.find((p) => !gameObj.foldPlayers?.includes(p.userId))!.userId
  gameObj.checkingPlayers = []
  const amountNeedDrawMore = 5 - gameObj.communityCards.length
  gameObj.communityCards = [...gameObj.communityCards, ...drawCard(gameObj.deck, amountNeedDrawMore)]

  let pot = 0
  room.status = 'showdown'
  room.players = room.players.map((p) => {
    if (p.userId !== gameObj.winner) {
      p.hand.rank = Rank.Fold
    } else {
      p.hand = assignRankHand(p.hand, gameObj.communityCards)
    }
    pot += p.bet
    p.bet = 0
    return p
  })

  const winner = room.players.find((p) => p.userId === gameObj.winner)!
  winner.balance += pot

  await updateData({ collectionName: 'rooms', data: room })
}

export async function readyNextMatch({ roomId, userId }: CallBetParams) {
  const user = await getUserById(userId)
  const room = await getRoomById(roomId)

  if (!user || !room) {
    throw new Error('Not found room or user')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  gameObj.readyPlayers.push(userId)

  await updateData({ collectionName: 'rooms', data: room })

  if (gameObj.readyPlayers.length !== room.players.length) {
    return
  }

  await toNextMatch({ roomId: room.id })
}

export async function toNextMatch({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room!')
  }

  const gameObj = room.gameObj

  if (!gameObj) {
    throw new Error('Not found game object')
  }

  room.status = 'pre-flop'

  const dealerIndex = gameObj.dealerIndex + 1
  const numberOfPlayers = room.players.length
  gameObj.dealerIndex = dealerIndex
  gameObj.callingValue = BigBlindValue
  gameObj.turn = dealerIndex + 3
  gameObj.dealer = room.players[dealerIndex % numberOfPlayers].userId
  gameObj.smallBlind = room.players[(dealerIndex + 1) % numberOfPlayers].userId
  gameObj.bigBlind = room.players[(dealerIndex + 2) % numberOfPlayers].userId
  gameObj.deck = [...deck]
  gameObj.foldPlayers = []
  gameObj.allInPlayers = []
  gameObj.communityCards = []
  gameObj.checkingPlayers = []
  gameObj.readyPlayers = []
  gameObj.winner = null

  const eliminatedPlayers = room.players.filter((p) => p.balance === 0)
  if (eliminatedPlayers.length > 0) {
    const q = query(collection(db, 'users'), where('id', 'in', eliminatedPlayers))
    const querySnapshot = await getDocs(q)
    const updateQuery: Promise<void>[] = []
    querySnapshot.forEach((doc) => {
      const player = { ...doc.data(), id: doc.id } as User
      player.currentRoom = null
      updateQuery.push(updateData({ collectionName: 'users', data: player }))
    })
    await Promise.all(updateQuery)
  }

  room.players = room.players.filter((p) => p.balance !== 0)
  room.players.forEach((p) => {
    p.hand = { holeCards: drawCard(gameObj.deck, 2), pokerCards: [], rank: null }
    if (p.userId === gameObj.smallBlind) {
      p.balance -= SmallBlindValue
      p.bet = SmallBlindValue
      return
    }
    if (p.userId === gameObj.bigBlind) {
      p.balance -= BigBlindValue
      p.bet = BigBlindValue
      return
    }
    p.bet = 0
  })

  await updateData({ collectionName: 'rooms', data: room })
}

export async function cleanUpInGameRoom({ roomId, userId }: CleanUpInGameRoomParams) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room!')
  }

  if (room.status === 'pre-game') {
    return
  }

  room.players = room.players.filter((p) => p.userId !== userId)
  room.gameObj.allInPlayers = room.gameObj.allInPlayers.filter((p) => p !== userId)
  room.gameObj.checkingPlayers = room.gameObj.checkingPlayers.filter((p) => p !== userId)
  room.gameObj.foldPlayers = room.gameObj.foldPlayers.filter((p) => p !== userId)
  room.gameObj.readyPlayers = room.gameObj.readyPlayers.filter((p) => p !== userId)

  let callingValue = Number.MIN_SAFE_INTEGER
  room.players.forEach((p) => {
    callingValue = Math.max(callingValue, p.bet)
  })
  room.gameObj.callingValue = callingValue

  // re-mark role
  const dealerIndex = room.gameObj.dealerIndex
  const numberOfPlayers = room.players.length
  room.gameObj.dealer = room.players[dealerIndex % numberOfPlayers].userId
  room.gameObj.smallBlind = room.players[(dealerIndex + 1) % numberOfPlayers].userId
  room.gameObj.bigBlind = room.players[(dealerIndex + 2) % numberOfPlayers].userId

  await updateData({ collectionName: 'rooms', data: room })

  const playerWhoNeedToCall = room.players.find(
    (p) =>
      p.bet < room.gameObj.callingValue &&
      !room.gameObj.foldPlayers.includes(p.userId) &&
      !room.gameObj.allInPlayers.includes(p.userId)
  )
  const isAllUserDone =
    room.gameObj.checkingPlayers.length + room.gameObj.foldPlayers.length + room.gameObj.allInPlayers.length ===
    room.players?.length
  const isShowdownStage = room.status === 'showdown'

  if (!playerWhoNeedToCall && isAllUserDone && !isShowdownStage) {
    return await toNextRound(room)
  }

  if (isShowdownStage && room.gameObj.readyPlayers.length === room.players.length) {
    return await toNextMatch({ roomId: room.id })
  }
}

import { addData, deleteData, getById, readData, updateData } from '@/firebase/services'
import { drawCard, generateRoomCode } from '../utils'
import { Player, Rank, Room, User } from '@/types'
import { getUserById, updateUser } from './user'
import { BalanceValue, BigBlindValue, SmallBlindValue, deck } from '@/constants/deck'
import { assignRankHand } from '../poker/assign-rank-hand'
import { compareHand } from '../poker/compare'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

type CreateRoomParams = {
  userId: string // room owner
}

export async function createRoom({ userId }: CreateRoomParams) {
  const user = await getUserById(userId)

  if (!user) {
    throw new Error('Not found user!')
  }

  if (user.currentRoom) {
    throw new Error('You are already in a room!')
  }

  const roomId = await addData({
    collectionName: 'rooms',
    data: {
      roomCode: generateRoomCode(),
      roomOwner: userId,
      players: [{ userId: user.id }],
      dealer: null,
      smallBlind: null,
      bigBlind: null,
      foldPlayers: [],
      allInPlayers: [],
      boardCards: []
    }
  })

  await updateUser({ ...user, currentRoom: roomId })

  return { roomId }
}

export async function getCurrentRoom({ userId }: { userId: string }) {
  const user = await getUserById(userId)

  if (!user) {
    throw new Error('Not found user!')
  }

  if (!user.currentRoom) {
    throw new Error('Not found your current room!')
  }

  return { roomId: user.currentRoom }
}

type LeaveRoomParams = { userId: string }

export async function leaveRoom({ userId }: LeaveRoomParams) {
  const user = await getUserById(userId)

  if (!user) {
    throw new Error('Not found user!')
  }

  const roomId = user.currentRoom
  if (!roomId) {
    throw new Error('Not found current room!')
  }

  // handle user
  await updateData({ collectionName: 'users', data: { ...user, currentRoom: null } })

  // handle room
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room!')
  }

  room.players = room.players?.filter((p) => p.userId !== userId)
  if (room.players?.length === 0) {
    await deleteData({ collectionName: 'rooms', id: roomId })
    return
  }

  if (room.roomOwner === userId) {
    // need to change roomOwner
    room.roomOwner = room.players?.[0].userId
  }

  await updateData({ collectionName: 'rooms', data: room })
}

export const getRoomByCode = async (roomCode: string) => {
  const rooms = (await readData({ collectionName: 'rooms' })) as Room[]

  return rooms.find((r) => r.roomCode === roomCode)
}

type JoinRoomParams = { userId: string; roomCode: string }

export async function joinRoom({ userId, roomCode }: JoinRoomParams) {
  const user = (await getUserById(userId)) as User

  if (!user) {
    throw new Error('Not found user!')
  }

  const room = await getRoomByCode(roomCode)

  if (!room) {
    throw new Error('Not found room!')
  }

  if (user.currentRoom === room.id) {
    return room.id
  }

  if (user.currentRoom && user.currentRoom !== room.id) {
    throw new Error('You are already in a room!')
  }

  if (room.inGame) {
    throw new Error('You cannot join a room in game!')
  }

  // handle user
  user.currentRoom = room.id

  await updateData({ collectionName: 'users', data: user })

  // handle room
  // @ts-ignore
  room.players.push({ userId: user.id })
  await updateData({ collectionName: 'rooms', data: room })

  return room.id
}

export async function getRoomById(roomId: string) {
  const room = (await getById({ collectionName: 'rooms', id: roomId })) as Room | null
  return { ...room, id: roomId }
}

type CallBetParams = { roomId: string; userId: string }

export async function callBet({ roomId, userId }: CallBetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  const player = room.players?.find((p) => p.userId === user.id)!

  const diffBet = (room?.checkValue || 0) - player.bet
  player.balance -= diffBet
  player.bet = room?.checkValue || 0

  let turnInCreaseAmount = 1
  while (1) {
    const nextPlayer = room.players?.find((p, index) => {
      return index === (room.turn! + turnInCreaseAmount) % room.players!.length
    })?.userId

    if (nextPlayer && (room.foldPlayers?.includes(nextPlayer) || room.allInPlayers?.includes(nextPlayer))) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  room.turn = (room?.turn || 0) + turnInCreaseAmount
  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of rouse
  const unCallAndNotFoldPlayer = room.players?.find(
    (p) =>
      p.bet < (room.checkValue || 0) && !room.foldPlayers?.includes(p.userId) && !room.allInPlayers?.includes(p.userId)
  )
  if (unCallAndNotFoldPlayer) {
    return
  }

  // need to go to next round
  if (room.status === 'pre-flop') {
    await toTheFlop({ roomId: room.id })
    return
  }

  if (room.status === 'the-flop') {
    await toTheTurn({ roomId: room.id })
    return
  }

  if (room.status === 'the-turn') {
    await toTheRiver({ roomId: room.id })
    return
  }

  if (room.status === 'the-river') {
    await toShowDown({ roomId: room.id })
  }
}

export async function toTheFlop({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  room.turn = room.dealerIndex! + 1
  let turnInCreaseAmount = 0
  while (1) {
    const nextPlayer = room.players?.find((p, index) => {
      return index === (room.turn! + turnInCreaseAmount) % room.players!.length
    })?.userId

    if (nextPlayer && (room.foldPlayers?.includes(nextPlayer) || room.allInPlayers?.includes(nextPlayer))) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  if (turnInCreaseAmount > 0) {
    room.turn = (room.turn || 0) + turnInCreaseAmount
  }

  room.checkingPlayers = []
  room.status = 'the-flop'
  room.boardCards = drawCard(room.deck!, 3)
  await updateData({ collectionName: 'rooms', data: room })
}

type StartGameParams = {
  roomId: string
}

export async function startGame({ roomId }: StartGameParams) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room!')
  }

  if (room.players!.length < 3) {
    throw new Error('At least 3 players to start a game!')
  }

  room.status = 'pre-flop'
  room.checkValue = 200
  room.turn = 3 // turn of the player next to the big house
  room.dealer = room.players?.[0].userId
  room.smallBlind = room.players?.[1].userId
  room.bigBlind = room.players?.[2].userId
  room.dealerIndex = 0
  room.inGame = true
  room.boardCards = []
  room.deck = [...deck]
  room.players?.forEach((p) => {
    p.hand = { handCards: drawCard(room.deck!, 2) }
    if (p.userId === room.smallBlind) {
      p.balance = BalanceValue - SmallBlindValue
      p.bet = SmallBlindValue
      return
    }
    if (p.userId === room.bigBlind) {
      p.balance = BalanceValue - BigBlindValue
      p.bet = BigBlindValue
      return
    }
    p.balance = BalanceValue
    p.bet = 0
  })

  await updateData({ collectionName: 'rooms', data: room })
}

export async function checkBet({ roomId, userId }: CallBetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  room.checkingPlayers?.push(userId)

  let turnInCreaseAmount = 1
  while (1) {
    const nextPlayer = room.players?.find((p, index) => {
      return index === (room.turn! + turnInCreaseAmount) % room.players!.length
    })?.userId

    if (nextPlayer && (room.foldPlayers?.includes(nextPlayer) || room.allInPlayers?.includes(nextPlayer))) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  room.turn = (room?.turn || 0) + turnInCreaseAmount
  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of rouse
  const conditionEndRound =
    (room.checkingPlayers?.length || 0) + (room.foldPlayers?.length || 0) + (room.allInPlayers?.length || 0) ===
    room.players?.length

  if (!conditionEndRound) {
    return
  }

  if (room.status === 'the-flop') {
    await toTheTurn({ roomId: room.id })
    return
  }

  if (room.status === 'the-turn') {
    await toTheRiver({ roomId: room.id })
    return
  }

  if (room.status === 'the-river') {
    await toShowDown({ roomId: room.id })
  }
}

export async function allInBet({ roomId, userId }: CallBetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  const player = room.players?.find((p) => p.userId === user.id)!

  player.bet = player.bet + player.balance
  player.balance = 0
  room.allInPlayers = room.allInPlayers ? [...room.allInPlayers, player.userId] : [player.userId]

  let turnInCreaseAmount = 1
  while (1) {
    const nextPlayer = room.players?.find((p, index) => {
      return index === (room.turn! + turnInCreaseAmount) % room.players!.length
    })?.userId

    if (nextPlayer && (room.foldPlayers?.includes(nextPlayer) || room.allInPlayers?.includes(nextPlayer))) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  room.turn = (room?.turn || 0) + turnInCreaseAmount
  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of rouse
  const unCallAndNotFoldPlayer = room.players?.find(
    (p) =>
      p.bet < (room.checkValue || 0) && !room.foldPlayers?.includes(p.userId) && !room.allInPlayers?.includes(p.userId)
  )
  if (unCallAndNotFoldPlayer) {
    return
  }

  // need to go to next round
  if (room.status === 'pre-flop') {
    await toTheFlop({ roomId: room.id })
    return
  }

  if (room.status === 'the-flop') {
    await toTheTurn({ roomId: room.id })
    return
  }

  if (room.status === 'the-turn') {
    await toTheRiver({ roomId: room.id })
    return
  }

  if (room.status === 'the-river') {
    await toShowDown({ roomId: room.id })
  }
}

type RaisePetParams = {
  roomId: string
  userId: string
  raiseValue: number
}

export async function raiseBet({ roomId, userId, raiseValue }: RaisePetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  const player = room.players?.find((p) => p.userId === user.id)!

  const diffBet = (room?.checkValue || 0) - player.bet + (raiseValue || 0)

  player.balance -= diffBet
  room.checkValue = (room.checkValue || 0) + (raiseValue || 0)
  player.bet = room?.checkValue
  room.checkingPlayers = []

  let turnInCreaseAmount = 1
  while (1) {
    const nextPlayer = room.players?.find((p, index) => {
      return index === (room.turn! + turnInCreaseAmount) % room.players!.length
    })?.userId

    if (nextPlayer && (room.foldPlayers?.includes(nextPlayer) || room.allInPlayers?.includes(nextPlayer))) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  room.turn = (room?.turn || 0) + turnInCreaseAmount
  await updateData({ collectionName: 'rooms', data: room })
}

export async function toTheTurn({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  room.turn = room.dealerIndex! + 1
  let turnInCreaseAmount = 0
  while (1) {
    const nextPlayer = room.players?.find((p, index) => {
      return index === (room.turn! + turnInCreaseAmount) % room.players!.length
    })?.userId

    if (nextPlayer && (room.foldPlayers?.includes(nextPlayer) || room.allInPlayers?.includes(nextPlayer))) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  if (turnInCreaseAmount > 0) {
    room.turn = (room.turn || 0) + turnInCreaseAmount
  }

  room.checkingPlayers = []
  room.status = 'the-turn'
  room.boardCards = [...room.boardCards!, ...drawCard(room.deck!, 1)]
  await updateData({ collectionName: 'rooms', data: room })
}

export async function toTheRiver({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  room.turn = room.dealerIndex! + 1
  let turnInCreaseAmount = 0
  while (1) {
    const nextPlayer = room.players?.find((p, index) => {
      return index === (room.turn! + turnInCreaseAmount) % room.players!.length
    })?.userId

    if (nextPlayer && (room.foldPlayers?.includes(nextPlayer) || room.allInPlayers?.includes(nextPlayer))) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  if (turnInCreaseAmount > 0) {
    room.turn = (room.turn || 0) + turnInCreaseAmount
  }

  room.checkingPlayers = []
  room.status = 'the-river'
  room.boardCards = [...room.boardCards!, ...drawCard(room.deck!, 1)]
  await updateData({ collectionName: 'rooms', data: room })
}

export async function toShowDown({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  let pot = 0
  room.status = 'showdown'
  room.players = room.players?.map((p) => {
    p.hand = assignRankHand(p.hand, room.boardCards!)
    if (room.foldPlayers?.includes(p.userId)) {
      p.hand.rank = Rank.Fold
    }
    pot += p.bet
    p.bet = 0
    return p
  })

  const winners = [...room.players!].sort((p1, p2) => {
    return compareHand(p1.hand, p2.hand)
  })

  room.checkingPlayers = []
  room.winner = winners[0].userId

  const winner = room.players?.find((p) => p.userId === room.winner)!
  winner.balance = (winner?.balance || 0) + pot

  await updateData({ collectionName: 'rooms', data: room })
}

export async function readyNextMatch({ roomId, userId }: CallBetParams) {
  const user = await getUserById(userId)
  const room = await getRoomById(roomId)

  if (!user || !room) {
    throw new Error('Not found room or user')
  }

  room.readyPlayers = room.readyPlayers ? [...room.readyPlayers, userId] : [userId]

  await updateData({ collectionName: 'rooms', data: room })

  if (room.readyPlayers.length !== room.players?.length) {
    return
  }

  await toNextMatch({ roomId: room.id })
}

export async function toNextMatch({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room!')
  }

  const dealerIndex = room.dealerIndex! + 1
  const numberOfPlayers = room.players?.length!
  room.dealerIndex = dealerIndex
  room.status = 'pre-flop'
  room.checkValue = 200
  room.turn = dealerIndex + 3
  room.dealer = room.players?.[dealerIndex % numberOfPlayers].userId
  room.smallBlind = room.players?.[(dealerIndex + 1) % numberOfPlayers].userId
  room.bigBlind = room.players?.[(dealerIndex + 2) % numberOfPlayers].userId
  room.deck = [...deck]
  room.foldPlayers = []
  room.allInPlayers = []
  room.boardCards = []
  room.checkingPlayers = []
  room.readyPlayers = []
  room.winner = null

  const eliminatedPlayers = room.players?.filter((p) => p.balance === 0)
  const q = query(collection(db, 'users'), where('id', 'in', eliminatedPlayers))
  const querySnapshot = await getDocs(q)
  const updateQuery: Promise<void>[] = []
  querySnapshot.forEach((doc) => {
    const player = { ...doc.data(), id: doc.id }
    // @ts-ignore
    player.currentRoom = null
    updateQuery.push(updateData({ collectionName: 'users', data: player }))
  })
  await Promise.all(updateQuery)

  room.players = room.players?.filter((p) => p.balance !== 0)
  room.players?.forEach((p) => {
    p.hand = { handCards: drawCard(room.deck!, 2) }
    if (p.userId === room.smallBlind) {
      p.balance = p.balance - SmallBlindValue
      p.bet = SmallBlindValue
      return
    }
    if (p.userId === room.bigBlind) {
      p.balance = p.balance - BigBlindValue
      p.bet = BigBlindValue
      return
    }
    p.bet = 0
  })

  await updateData({ collectionName: 'rooms', data: room })
}

export async function foldBet({ roomId, userId }: CallBetParams) {
  const room = await getRoomById(roomId)
  const user = await getUserById(userId)

  if (!room || !user) {
    throw new Error('Not found user or room')
  }

  if (room.players?.length! - room.foldPlayers?.length! === 2) {
    await showDownFold({ roomId: room.id, lastFoldPlayer: userId })
    return
  }

  room.foldPlayers?.push(userId)

  let turnInCreaseAmount = 1
  while (1) {
    const nextPlayer = room.players?.find((p, index) => {
      return index === (room.turn! + turnInCreaseAmount) % room.players!.length
    })?.userId

    if (nextPlayer && (room.foldPlayers?.includes(nextPlayer) || room.allInPlayers?.includes(nextPlayer))) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  room.turn = (room?.turn || 0) + turnInCreaseAmount
  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of rouse
  const conditionEndRound =
    (room.checkingPlayers?.length || 0) + (room.foldPlayers?.length || 0) + (room.allInPlayers?.length || 0) ===
    room.players?.length

  if (!conditionEndRound) {
    return
  }

  if (room.status === 'the-flop') {
    await toTheTurn({ roomId: room.id })
    return
  }

  if (room.status === 'the-turn') {
    await toTheRiver({ roomId: room.id })
    return
  }

  if (room.status === 'the-river') {
    await toShowDown({ roomId: room.id })
  }
}

type ShowDownFoldParams = {
  roomId: string
  lastFoldPlayer: string
}
export async function showDownFold({ roomId, lastFoldPlayer }: ShowDownFoldParams) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  room.foldPlayers?.push(lastFoldPlayer)
  room.winner = room.players?.find((p) => !room.foldPlayers?.includes(p.userId))?.userId
  room.checkingPlayers = []
  const amountNeedDrawMore = 5 - (room.boardCards?.length || 0)
  room.boardCards = [...room.boardCards!, ...drawCard(room.deck!, amountNeedDrawMore)]

  let pot = 0
  room.status = 'showdown'
  room.players = room.players?.map((p) => {
    if (p.userId !== room.winner) {
      p.hand.rank = Rank.Fold
    } else {
      p.hand = assignRankHand(p.hand, room.boardCards!)
    }
    pot += p.bet
    p.bet = 0
    return p
  })

  const winner = room.players?.find((p) => p.userId === room.winner)!
  winner.balance = (winner?.balance || 0) + pot

  await updateData({ collectionName: 'rooms', data: room })
}

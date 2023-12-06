import { addData, deleteData, getById, readData, updateData } from '@/firebase/services'
import { drawCard, generateRoomCode } from '../utils'
import { Room, User } from '@/types'
import { getUserById, updateUser } from './user'
import { BalanceValue, BigHouseValue, SmallHouseValue, deck } from '@/constants/deck'
import { assignRankHand } from '../poker/assign-rank-hand'
import { compareHand } from '../poker/compare'

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
      smallHouse: null,
      bigHouse: null,
      foldedPlayers: [],
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
  console.log('join room')

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

    if (nextPlayer && room.foldPlayers?.includes(nextPlayer)) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  room.turn = (room?.turn || 0) + turnInCreaseAmount
  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of rouse
  const unCallPlayer = room.players?.find((p) => p.bet < (room.checkValue || 0))
  if (unCallPlayer) {
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

    if (nextPlayer && room.foldPlayers?.includes(nextPlayer)) {
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
  room.smallHouse = room.players?.[1].userId
  room.bigHouse = room.players?.[2].userId
  room.dealerIndex = 0
  room.inGame = true
  room.deck = [...deck]
  room.players?.forEach((p) => {
    p.hand = { handCards: drawCard(room.deck!, 2) }
    if (p.userId === room.smallHouse) {
      p.balance = BalanceValue - SmallHouseValue
      p.bet = SmallHouseValue
      return
    }
    if (p.userId === room.bigHouse) {
      p.balance = BalanceValue - BigHouseValue
      p.bet = BigHouseValue
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

    if (nextPlayer && room.foldPlayers?.includes(nextPlayer)) {
      turnInCreaseAmount++
      continue
    }

    break
  }

  room.turn = (room?.turn || 0) + turnInCreaseAmount
  await updateData({ collectionName: 'rooms', data: room })

  // handle case end of rouse
  const conditionEndRound =
    (room.checkingPlayers?.length || 0) + (room.foldPlayers?.length || 0) === room.players?.length

  if (!conditionEndRound) {
    console.log('wtf1')
    return
  }
  console.log('wtf2')

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

    if (nextPlayer && room.foldPlayers?.includes(nextPlayer)) {
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

    if (nextPlayer && room.foldPlayers?.includes(nextPlayer)) {
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

    if (nextPlayer && room.foldPlayers?.includes(nextPlayer)) {
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
  console.log('Show Down')

  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Not found room')
  }

  let pot = 0
  room.status = 'showdown'
  room.players = room.players?.map((p) => {
    p.hand = assignRankHand(p.hand, room.boardCards!)
    pot += p.bet
    p.bet = 0
    return p
  })

  const winners = [...room.players!].sort((p1, p2) => {
    return compareHand(p1.hand, p2.hand)
  })

  console.log({ winners })

  room.checkingPlayers = []
  room.winner = winners[0].userId

  const winner = room.players?.find((p) => p.userId === room.winner)!
  winner.balance = (winner?.balance || 0) + pot

  await updateData({ collectionName: 'rooms', data: room })
}

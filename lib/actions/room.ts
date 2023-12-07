import { addData, deleteData, getById, readData, updateData } from '@/firebase/services'
import { drawCard, generateRoomCode } from '../utils'
import { Rank, Room } from '@/types'
import { getUserById, updateUser } from './user'
import { BalanceValue, BigBlindValue, SmallBlindValue, deck } from '@/constants/deck'
import { assignRankHand } from '../poker/assign-rank-hand'
import { compareHand } from '../poker/compare'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'
import {
  CallBetParams,
  CreateRoomParams,
  GetCurrentRoomParams,
  JoinRoomParams,
  LeaveRoomParams,
  StartGameParams
} from '../params'

export async function createRoom({ userId }: CreateRoomParams) {
  const user = await getUserById(userId)

  if (!user) {
    throw new Error('Not found user!')
  }

  if (user.currentRoom) {
    throw new Error('You are already in a room!')
  }

  const newRoom: Omit<Room, 'id'> = {
    roomCode: generateRoomCode(),
    status: 'pre-game',
    roomOwner: userId,
    players: [
      {
        userId: user.id,
        balance: BalanceValue,
        bet: 0,
        hand: {
          holeCards: [],
          pokerCards: [],
          rank: null
        },
        user: null
      }
    ],
    gameObj: null
  }

  const roomId = await addData({
    collectionName: 'rooms',
    data: newRoom
  })

  await updateUser({ ...user, currentRoom: roomId })

  return { roomId }
}

export async function getCurrentRoom({ userId }: GetCurrentRoomParams) {
  const user = await getUserById(userId)

  if (!user) {
    throw new Error('Not found user!')
  }

  if (!user.currentRoom) {
    throw new Error('Not found your current room!')
  }

  return { roomId: user.currentRoom }
}

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

  room.players = room.players.filter((p) => p.userId !== userId)
  if (room.players.length === 0) {
    await deleteData({ collectionName: 'rooms', id: roomId })
    return
  }

  if (room.roomOwner === userId) {
    // need to change roomOwner
    room.roomOwner = room.players[0].userId
  }

  await updateData({ collectionName: 'rooms', data: room })
}

export const getRoomByCode = async (roomCode: string) => {
  const rooms = (await readData({ collectionName: 'rooms' })) as Room[]
  return rooms.find((r) => r.roomCode === roomCode)
}

export async function joinRoom({ userId, roomCode }: JoinRoomParams) {
  const user = await getUserById(userId)

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
    throw new Error('You are already in another room!')
  }

  if (room.status !== 'pre-game') {
    throw new Error('You cannot join a room is in game!')
  }

  // handle user
  user.currentRoom = room.id

  await updateData({ collectionName: 'users', data: user })

  // handle room
  room.players.push({
    userId: user.id,
    balance: BalanceValue,
    bet: 0,
    hand: {
      holeCards: [],
      pokerCards: [],
      rank: null
    },
    user: null
  })
  await updateData({ collectionName: 'rooms', data: room })

  return room.id
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const room = (await getById({ collectionName: 'rooms', id: roomId })) as Room | null
  if (!room) return null
  return { ...room, id: roomId }
}

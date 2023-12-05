import { addData, deleteData, getById, readData, updateData } from '@/firebase/services'
import { generateRoomCode } from '../utils'
import { getUserByClerkId, updateUser } from './user'
import { Room, User } from '@/types'

type CreateRoomParams = {
  clerkId: string // room owner
}

export async function createRoom({ clerkId }: CreateRoomParams) {
  const user = await getUserByClerkId(clerkId)

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
      roomOwner: user.id,
      players: [{ user }],
      dealer: null,
      smallHouse: null,
      bigHouse: null,
      readyPlayers: [],
      foldedPlayers: [],
      boardCards: []
    }
  })

  await updateUser({ ...user, currentRoom: roomId })

  return { roomId }
}

export async function getCurrentRoom({ clerkId }: { clerkId: string }) {
  const user = await getUserByClerkId(clerkId)

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
  try {
    const user = (await getById({ collectionName: 'users', id: userId })) as User | null

    if (!user) {
      throw new Error('Not found user!')
    }

    console.log({ user })

    const roomId = user.currentRoom
    if (!roomId) {
      throw new Error('Not found current room!')
    }

    // handle user
    await updateData({ collectionName: 'users', data: { ...user, currentRoom: null } })

    // handle room
    const room = (await getById({ collectionName: 'rooms', id: roomId })) as Room | null
    console.log('1')
    if (!room) {
      console.log('2')
      throw new Error('Not found room!')
    }
    console.log('3')
    room.players = room.players.filter((p) => p.user.id !== userId)
    if (room.players.length === 0) {
      console.log('Empty room')
      console.log({ room })
      await deleteData({ collectionName: 'rooms', id: roomId })
      return
    }

    room.readyPlayers = room.readyPlayers.filter((p) => p !== userId)
    if (room.roomOwner === userId) {
      // need to change roomOwner
      room.roomOwner = room.players[0].user.id
    }

    console.log('123', { room })

    await updateData({ collectionName: 'rooms', data: room })
  } catch (error) {
    console.log(error)
  }
}

export const getRoomByCode = async (roomCode: string) => {
  const rooms = (await readData({ collectionName: 'rooms' })) as Room[]

  return rooms.find((r) => r.roomCode === roomCode)
}

type JoinRoomParams = { userId: string; roomCode: string }

export async function joinRoom({ userId, roomCode }: JoinRoomParams) {
  try {
    const user = (await getById({ collectionName: 'users', id: userId })) as User | null

    if (!user) {
      throw new Error('Not found user!')
    }

    const room = await getRoomByCode(roomCode)

    if (!room) {
      throw new Error('Not found room!')
    }

    console.log({ room, user })
  } catch (error) {
    console.log(error)
  }
}

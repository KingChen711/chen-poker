import { addData, deleteData, getById, readData, updateData } from '@/firebase/services'
import { generateRoomCode } from '../utils'
import { Room, User } from '@/types'
import { getUserById, updateUser } from './user'

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
      readyPlayers: [],
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
  try {
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

    room.readyPlayers = room.readyPlayers?.filter((p) => p !== userId)
    if (room.roomOwner === userId) {
      // need to change roomOwner
      room.roomOwner = room.players?.[0].userId
    }

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
    const user = (await getUserById(userId)) as User

    if (!user) {
      throw new Error('Not found user!')
    }

    if (user.currentRoom) {
      throw new Error('You are already in a room!')
    }

    const room = await getRoomByCode(roomCode)

    if (!room) {
      throw new Error('Not found room!')
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
  } catch (error) {
    console.log(error)
  }
}

export async function getRoomById(roomId: string) {
  const room = (await getById({ collectionName: 'rooms', id: roomId })) as Room | null
  return { ...room, id: roomId }
}

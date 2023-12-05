import { addData } from '@/firebase/services'
import { generateRoomCode } from '../utils'
import { getUserByClerkId, updateUser } from './user'

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

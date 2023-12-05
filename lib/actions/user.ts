import { addData, deleteData, getById, readData, updateData } from '@/firebase/services'
import { Room, User } from '@/types'

type CreateUserParams = {
  clerkId: string
  email: string
  name: string
  picture: string
  username: string
}

type UpdateUserParams = {
  clerkId: string
  email: string
  name: string
  picture: string
  username: string
} & {
  currentRoom?: string
}

export async function createUser(params: CreateUserParams) {
  await addData({ collectionName: 'users', data: params })
}

export async function getUserByClerkId(clerkId: string) {
  const users = (await readData({ collectionName: 'users' })) as User[]
  return users.find((user) => user.clerkId === clerkId)
}

export async function updateUser(params: UpdateUserParams) {
  const { clerkId } = params
  const user = await getUserByClerkId(clerkId)

  if (user) {
    await updateData({ collectionName: 'users', data: { ...params, id: user.id } })
  }
}

export async function deleteUser(params: { clerkId: string }) {
  const { clerkId } = params
  const user = await getUserByClerkId(clerkId)

  if (user) {
    await deleteData({ collectionName: 'users', id: user.id })
  }
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
      console.log('Emtpty room')

      await deleteData({ collectionName: 'rooms', id: room.id })
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

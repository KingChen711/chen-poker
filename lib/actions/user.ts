import { addData, deleteData, readData, updateData } from '@/firebase/services'
import { User } from '@/types'

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

import { addData, deleteData, readData, updateData } from '@/firebase/services'
import { User } from '@/types'

type CreateUserParams = {
  clerkId: string
  email: string
  name: string
  picture: string
  username: string
}
export async function createUser(params: CreateUserParams) {
  await addData({ collectionName: 'users', data: params })
}

export async function updateUser(params: CreateUserParams) {
  const { clerkId } = params
  const users = (await readData({ collectionName: 'users' })) as User[]

  const user = users.find((user) => user.clerkId === clerkId)

  if (user) {
    await updateData({ collectionName: 'users', data: { ...params, id: user.id } })
  }
}

export async function deleteUser(params: { clerkId: string }) {
  const { clerkId } = params
  const users = (await readData({ collectionName: 'users' })) as User[]
  const user = users.find((user) => user.clerkId === clerkId)

  if (user) {
    await deleteData({ collectionName: 'users', id: user.id })
  }
}

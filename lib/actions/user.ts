import { addData, deleteData, getById, readData, updateData } from '@/firebase/services'
import { User } from '@/types'

type CreateUserParams = {
  clerkId: string
  email: string
  name: string
  picture: string
  username: string
}

type UpdateUserParams = Partial<User>

export async function createUser(params: CreateUserParams) {
  await addData({ collectionName: 'users', data: params })
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = (await getById({ collectionName: 'users', id: userId })) as User | null
  if (!user) return null
  return { ...user, id: userId }
}

export async function getUserByClerkId(clerkId: string) {
  const users = (await readData({ collectionName: 'users' })) as User[]
  return users.find((user) => user.clerkId === clerkId)
}

export async function updateUser(params: UpdateUserParams) {
  const { clerkId } = params
  if (!clerkId) {
    throw new Error('not found clerkID')
  }
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

// export async function getUserByIds(userIds: string[]) {
//   const user = (await getById({ collectionName: 'users', id: userId })) as User | null
//   return { ...user, id: userId }
// }

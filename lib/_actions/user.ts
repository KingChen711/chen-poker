import { addData } from '@/firebase/services'

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

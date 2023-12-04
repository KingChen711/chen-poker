import { getUserByClerkId } from '@/lib/_actions/user'
import { User } from '@/types'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export function useCurrentUser() {
  const { userId: clerkId } = useAuth()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkId) {
        return
      }
      const user = await getUserByClerkId(clerkId)
      setUser(user || null)
    }

    fetchUser()
  }, [clerkId])

  return user
}

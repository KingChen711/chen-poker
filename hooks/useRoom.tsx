import { db } from '@/firebase'
import { Room } from '@/types'
import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null)

  useEffect(() => {
    if (typeof roomId !== 'string') return
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (doc) => {
      const room = doc.data()
      if (room) {
        setRoom(room as Room)
      }
    })

    return unsubscribe
  }, [roomId])

  return room
}

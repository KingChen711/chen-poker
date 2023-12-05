import { db } from '@/firebase'
import { Hand, Player, Room, User } from '@/types'
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])

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

  useEffect(() => {
    const fetchPlayers = async () => {
      const players: Player[] = room?.players || []
      if (players.length === 0) return
      const q = query(collection(db, 'users'), where('id', 'in', room?.players.map((p) => p.userId)))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((doc) => {
        const player = players.find((p) => p.userId === doc.id)
        const user = doc.data() as User
        if (player) {
          player.user = user
        }
      })

      setPlayers(players)
    }

    fetchPlayers()
  }, [room])

  return { room, players }
}

import { db } from '@/firebase'
import { Player, Room, User } from '@/types'
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useCurrentUser } from './useCurrentUser'

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [playingPerson, setPlayingPerson] = useState<string | null>(null)
  const [pot, setPot] = useState(0)
  const user = useCurrentUser()
  const [currentUser, setCurrentUser] = useState<Player | null>(null)
  const [winner, setWinner] = useState<Player | null>(null)

  useEffect(() => {
    if (room?.winner) {
      setWinner(players.find((p) => p.userId === room.winner) || null)
    }
  }, [room, players])

  useEffect(() => {
    const currentUser = players.find((p) => p.userId === user?.id)
    setCurrentUser(currentUser || null)
  }, [players, user])

  useEffect(() => {
    if (!room) {
      return
    }
    const index = room.turn % room?.players.length
    setPlayingPerson(room.players[index].userId)
  }, [room])

  useEffect(() => {
    let pot = 0
    players.forEach((p) => {
      pot += p.bet
    })
    setPot(pot)
  }, [players])

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

  return { room, players, playingPerson, pot, currentUser, winner }
}

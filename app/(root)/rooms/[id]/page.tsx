'use client'

import InGameBoard from '@/components/room/InGameBoard'
import Loader from '@/components/shared/Loader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { CardImage, CardRank } from '@/constants/deck'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useRoom } from '@/hooks/useRoom'
import { callBet, checkBet, foldBet, leaveRoom, raiseBet, readyNextMatch, startGame } from '@/lib/actions/room'
import { cn, getCardImage, isWinnerCard } from '@/lib/utils'
import { CardSuit, CardValue } from '@/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Props = {
  params: {
    id: string
  }
}

function RoomDetailPage({ params }: Props) {
  const router = useRouter()
  const { room, players, playingPerson, pot, currentUser, winner } = useRoom(params.id)
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)

  const handleLeaveRoom = async () => {
    setIsLeavingRoom(true)
    try {
      if (!room || !currentUser) {
        return
      }
      await leaveRoom({ userId: currentUser.userId })
      router.push('/')
    } catch (error) {
      console.log(error)
    } finally {
      setIsLeavingRoom(false)
    }
  }

  const handleStartGame = async () => {
    try {
      if (!room) {
        return
      }

      await startGame({ roomId: params.id })
    } catch (error) {
      // @ts-ignore
      if (error.message === 'At least 3 players to start a game!') {
        toast({
          variant: 'destructive',
          title: 'Số người chơi quá ít!',
          description: 'Cần ít nhất 3 người chơi để bắt đầu, hãy chia sẽ mã phòng cho bạn bè của bạn'
        })
      }
      console.log(error)
    }
  }

  const handleReadyNextMatch = async () => {
    try {
      if (!room || !currentUser) {
        return
      }
      await readyNextMatch({ roomId: room.id, userId: currentUser.userId })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='flex min-h-screen flex-col pt-24'>
      <div className='flex justify-between gap-6'>
        <div>
          <div className='text-xl font-medium'>Mã phòng: {room?.roomCode}</div>
        </div>

        <div className='flex gap-3'>
          {room?.roomOwner === currentUser?.userId && !room?.inGame && (
            <Button onClick={handleStartGame}>Bắt đầu {isLeavingRoom && <Loader />}</Button>
          )}
          {!room?.inGame && (
            <Button disabled={isLeavingRoom} onClick={handleLeaveRoom} variant='secondary'>
              Rời phòng {isLeavingRoom && <Loader />}
            </Button>
          )}
        </div>
      </div>

      {!room?.inGame && (
        <div className='mt-4 flex flex-wrap gap-8'>
          {players.map((p) => {
            return (
              <div key={p.userId} className='flex items-center gap-2'>
                <Image src={p.user.picture} alt='player avatar' width={32} height={32} className='rounded-full' />
                <div className='font-medium'>
                  {p.user.username}
                  {room?.roomOwner === p.userId && '(chủ phòng)'}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {room?.inGame && (
        <InGameBoard
          room={room}
          currentUser={currentUser}
          players={players}
          playingPerson={playingPerson}
          pot={pot}
          winner={winner}
        />
      )}
    </div>
  )
}

export default RoomDetailPage

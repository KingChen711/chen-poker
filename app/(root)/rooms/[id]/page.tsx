'use client'

import Loader from '@/components/shared/Loader'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useRoom } from '@/hooks/useRoom'
import { leaveRoom, toggleReady } from '@/lib/actions/room'
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
  const user = useCurrentUser()
  const { room, players, isReady } = useRoom(params.id)
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)

  const handleLeaveRoom = async () => {
    setIsLeavingRoom(true)
    try {
      if (!room || !user) {
        return
      }
      await leaveRoom({ userId: user.id })
      router.push('/')
    } catch (error) {
      console.log(error)
    } finally {
      setIsLeavingRoom(false)
    }
  }

  const handleReady = async () => {
    try {
      if (!room || !user || isReady === undefined) {
        return
      }

      await toggleReady({ userId: user.id, roomId: room.id, isReady })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='mt-8 flex flex-col'>
      <div className='flex justify-between gap-6'>
        <div>
          <div>ID phòng: {params.id}</div>
          <div>Mã phòng: {room?.roomCode}</div>
        </div>

        <div className='flex gap-3'>
          <Button disabled={isLeavingRoom} onClick={handleReady}>
            {!isReady ? 'Sẵn sàng' : 'Hủy sẵn sàng'} {isLeavingRoom && <Loader />}
          </Button>
          {!isReady && (
            <Button disabled={isLeavingRoom} onClick={handleLeaveRoom} variant='secondary'>
              Rời phòng {isLeavingRoom && <Loader />}
            </Button>
          )}
        </div>
      </div>

      <div className='mt-8 flex flex-col gap-4'>
        {players?.map((p) => {
          return (
            <div key={p.userId}>
              {p.user && (
                <div className='flex items-center gap-2'>
                  <Image src={p.user.picture} alt='player avatar' width={20} height={20} className='rounded-full' />
                  <div className='font-medium'>{p.user.username}</div>
                  {room?.readyPlayers.includes(p.userId) && (
                    <div className='font-medium text-green-500'>Đã sẵn sàng</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RoomDetailPage

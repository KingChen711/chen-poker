'use client'

import Loader from '@/components/shared/Loader'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useRoom } from '@/hooks/useRoom'
import { leaveRoom } from '@/lib/actions/user'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  params: {
    id: string
  }
}

function RoomDetailPage({ params }: Props) {
  const router = useRouter()
  const user = useCurrentUser()
  const room = useRoom(params.id)
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)

  console.log({ room })

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

  return (
    <div className='flex flex-col'>
      This is room: {params.id}
      <div className='mt-4'>
        <Button disabled={isLeavingRoom} onClick={handleLeaveRoom}>
          Rời phòng {isLeavingRoom && <Loader />}
        </Button>
      </div>
    </div>
  )
}

export default RoomDetailPage

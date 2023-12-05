'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { createRoom, getCurrentRoom, joinRoom } from '@/lib/actions/room'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function Home() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const user = useCurrentUser()

  const handleCreateNewRoom = async () => {
    if (!user) {
      return
    }
    try {
      const response = await createRoom({ userId: user.id })
      router.push(`/rooms/${response?.roomId}`)
    } catch (error) {
      console.log(error)

      // @ts-ignore
      if (error.message === 'You are already in a room!') {
        toast({
          variant: 'destructive',
          title: 'Bạn đang ở trong một phòng khác!',
          description: 'Hãy vào phòng hiện tại đó, và rời khỏi phòng nếu bạn muốn tạo phòng mới'
        })
      }
    }
  }

  const handleJoinCurrentRoom = async () => {
    if (!user) {
      return
    }
    try {
      const response = await getCurrentRoom({ userId: user.id })
      router.push(`/rooms/${response.roomId}`)
    } catch (error) {
      // @ts-ignore
      if (error.message === 'Not found your current room!') {
        toast({
          variant: 'destructive',
          title: 'Không tìm thấy phòng hiện tại của bạn!',
          description: 'Hãy tham gia hoặc tạo phòng mới'
        })
      }
    }
  }

  const handleJoinRoom = async () => {
    if (!user || !roomCode) {
      return
    }

    try {
      const roomId = await joinRoom({ roomCode, userId: user.id })
      router.push(`/rooms/${roomId}`)
    } catch (error) {
      // @ts-ignore
      if (error.message === 'Not found your current room!') {
        toast({
          variant: 'destructive',
          title: 'Không tìm thấy phòng hiện tại của bạn!',
          description: 'Hãy tham gia hoặc tạo phòng mới'
        })
      }
      // @ts-ignore
      if (error.message === 'You are already in a room!') {
        toast({
          variant: 'destructive',
          title: 'Bạn đang ở trong một phòng khác!',
          description: 'Hãy vào phòng hiện tại đó, và rời khỏi phòng nếu bạn muốn tạo phòng mới'
        })
      }
      // @ts-ignore
      if (error.message === 'Not found room!') {
        toast({
          variant: 'destructive',
          title: 'Không tìm thấy phòng!',
          description: 'Hãy kiểm tra lại mã phòng của bạn'
        })
      }
    }
  }

  return (
    <main className='mt-8 grid grid-cols-12'>
      <div className='col-span-6'>
        <div className='mb-4 flex gap-4'>
          <Button onClick={handleJoinCurrentRoom}>Vào phòng hiện tại của bạn</Button>
          <Button onClick={handleCreateNewRoom}>Tạo phòng mới</Button>
        </div>
        <div className='flex items-center'>
          <Input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className='max-w-xs'
            placeholder='Nhập mã phòng tại đây'
          />
          <Button onClick={handleJoinRoom} disabled={!roomCode} variant='link'>
            Tham gia
          </Button>
        </div>
      </div>

      <div className='col-span-6'></div>
    </main>
  )
}

export default Home

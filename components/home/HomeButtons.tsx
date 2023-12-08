'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from '../ui/use-toast'
import { createRoom, getCurrentRoom, joinRoom } from '@/lib/actions/room'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'

function HomeButtons() {
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
    <>
      <div className='mb-4 flex flex-wrap gap-4'>
        <Button onClick={handleJoinCurrentRoom}>Vào phòng hiện tại của bạn</Button>
        <Button onClick={handleCreateNewRoom}>Tạo phòng mới</Button>
      </div>
      <div className='flex items-center'>
        <Input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className=''
          placeholder='Nhập mã phòng tại đây'
        />
        <Button onClick={handleJoinRoom} disabled={!roomCode} variant='link'>
          Tham gia
        </Button>
      </div>
    </>
  )
}

export default HomeButtons

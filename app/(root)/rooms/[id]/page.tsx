'use client'

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
import { CardImage } from '@/constants/deck'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useRoom } from '@/hooks/useRoom'
import { callBet, checkBet, leaveRoom, raiseBet, startGame } from '@/lib/actions/room'
import { cn, getCardImage } from '@/lib/utils'
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
  const { room, players, playingPerson, pot, currentUser } = useRoom(params.id)
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)
  const [raiseValue, setRaiseValue] = useState<number | null>(null)

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
      await startGame({ roomId: room.id })
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

  const handleCall = async () => {
    try {
      if (!room || !currentUser) {
        return
      }
      await callBet({ roomId: room.id, userId: currentUser.userId })
    } catch (error) {
      console.log(error)
    }
  }

  const handleCheck = async () => {
    try {
      if (!room || !currentUser) {
        return
      }
      await checkBet({ roomId: room.id, userId: currentUser.userId })
    } catch (error) {
      console.log(error)
    }
  }

  const handleRaise = async () => {
    try {
      if (!room || !currentUser || !raiseValue) {
        return
      }
      await raiseBet({ roomId: room.id, userId: currentUser.userId, raiseValue })
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
      <div className='mt-8 flex flex-wrap gap-8'>
        {players?.map((p) => {
          return (
            <div
              key={p.userId}
              className={cn('p-4 rounded-md border-2 shadow', playingPerson === p.userId && 'border-primary')}
            >
              {p.user && (
                <div className='flex flex-col'>
                  <div className='flex items-center gap-2'>
                    <Image src={p.user.picture} alt='player avatar' width={32} height={32} className='rounded-full' />
                    <div className='font-medium'>
                      {p.user.username}
                      {room?.roomOwner === p.userId && '(chủ phòng)'}
                    </div>
                  </div>

                  <div className='flex gap-4'>
                    <div className='flex items-center gap-1 font-medium'>
                      Tài khoản: <div className='text-lg text-primary'>{p.balance}$</div>
                    </div>
                    <div className='flex items-center gap-1 font-medium'>
                      Cược: <div className='text-xl font-bold text-primary'>{p.bet}$</div>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    {currentUser?.userId === p.userId ? (
                      <>
                        <Image
                          src={getCardImage(p.hand.handCards[0]) || ''}
                          alt='first card'
                          width={120}
                          height={175}
                        />
                        <Image
                          src={getCardImage(p.hand.handCards[1]) || ''}
                          alt='second card'
                          width={120}
                          height={175}
                        />
                      </>
                    ) : (
                      <>
                        <Image
                          className='rounded-md object-contain'
                          src='/assets/cards/back-card.jpg'
                          alt='second card'
                          width={120}
                          height={175}
                        />
                        <Image
                          className='rounded-md object-contain'
                          src='/assets/cards/back-card.jpg'
                          alt='second card'
                          width={120}
                          height={175}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {room?.boardCards && room.boardCards.length > 0 && (
        <div className='mx-auto mt-8 grid w-fit grid-cols-5 gap-4 rounded-md border-2 p-6'>
          {room?.boardCards.map((card) => {
            return (
              <Image
                key={`${card.suit}-${card.value}`}
                className='col-span-1'
                src={getCardImage(card) || ''}
                alt='first card'
                width={120}
                height={175}
              />
            )
          })}
        </div>
      )}

      {playingPerson === currentUser?.userId && (
        <div className='mt-8 flex flex-col items-center gap-4'>
          <div className='flex items-center gap-1 font-medium'>
            Tổng tiền cược: <div className='text-2xl font-bold text-primary'>{pot}$</div>
          </div>
          <div className='flex items-center justify-center gap-4'>
            {(currentUser?.bet || 0) < (room?.checkValue || 0) && <Button onClick={handleCall}>Theo cược</Button>}
            {(currentUser?.bet || 0) === (room?.checkValue || 0) && <Button onClick={handleCheck}>Check</Button>}
            <Dialog>
              <DialogTrigger>
                <Button>Cược thêm</Button>
              </DialogTrigger>
              <DialogContent className='w-[400px]'>
                <DialogHeader>
                  <DialogTitle>Cược thêm</DialogTitle>
                  <DialogDescription>
                    <div className='flex items-center gap-1 font-medium'>
                      Tài khoản của bạn: <div className='text-lg text-primary'>{currentUser.balance}$</div>
                    </div>
                    <div className='flex items-center gap-1 font-medium'>
                      Số tiền cần bỏ thêm:{' '}
                      <div className='text-lg text-primary'>
                        {(room?.checkValue || 0) - currentUser.bet + (raiseValue || 0)}$
                      </div>
                    </div>

                    <Input
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (!isNaN(value)) {
                          setRaiseValue(value)
                        }
                      }}
                      value={raiseValue || ''}
                      type='number'
                      placeholder='Nhập số tiền cược thêm'
                      className='mt-2'
                    />

                    <div className='flex justify-end gap-3'>
                      <DialogClose asChild>
                        <Button className='mt-4' variant='secondary'>
                          Thôi
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={handleRaise}
                        disabled={(room?.checkValue || 0) - currentUser.bet + (raiseValue || 0) > currentUser.balance}
                        className='mt-4'
                      >
                        Cược
                      </Button>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button>Bỏ bài</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomDetailPage

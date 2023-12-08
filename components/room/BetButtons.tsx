import { Player, Room } from '@/types'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { allInBet, callBet, checkBet, foldBet, raiseBet } from '@/lib/actions/game'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Input } from '../ui/input'

type Props = {
  winner: Player | null
  playingPerson: string | null
  currentUser: Player
  room: Room & { status: 'pre-flop' | 'the-flop' | 'the-turn' | 'the-river' | 'showdown' }
  pot: number
}

function BetButtons({ winner, playingPerson, currentUser, room, pot }: Props) {
  const [raiseValue, setRaiseValue] = useState<number | null>(null)
  const handleCall = async () => {
    try {
      if (room && currentUser) {
        await callBet({ roomId: room.id, userId: currentUser.userId })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleCheck = async () => {
    try {
      if (room && currentUser) {
        await checkBet({ roomId: room.id, userId: currentUser.userId })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleRaise = async () => {
    try {
      if (room && currentUser && raiseValue) {
        await raiseBet({ roomId: room.id, userId: currentUser.userId, raiseValue })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleFold = async () => {
    try {
      if (room && currentUser) {
        await foldBet({ roomId: room.id, userId: currentUser.userId })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleAllIn = async () => {
    try {
      if (room && currentUser) {
        await allInBet({ roomId: room.id, userId: currentUser.userId })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div
      style={{ containerType: 'size' }}
      className='absolute left-1/2 top-0 flex w-2/3 -translate-x-1/2 flex-col items-center'
    >
      {!winner && <div className='text-[8cqw] font-bold text-foreground'>${pot}</div>}

      {playingPerson === currentUser?.userId && !winner && (
        <div className='flex w-full items-center justify-center gap-[2%]'>
          {currentUser.bet < room.gameObj.callingValue &&
            currentUser.balance + currentUser.bet > room.gameObj.callingValue && (
              <button
                className='rounded-sm bg-primary px-[2.5%] py-[1.5%] text-[2.5cqw] font-medium leading-none text-primary-foreground'
                onClick={handleCall}
              >
                Theo cược
              </button>
            )}

          {currentUser.balance + currentUser.bet <= room.gameObj.callingValue && (
            <button
              className='rounded-sm bg-primary px-[2.5%] py-[1.5%] text-[2.5cqw] font-medium leading-none text-primary-foreground'
              onClick={handleAllIn}
            >
              All in
            </button>
          )}

          {currentUser.bet === room.gameObj.callingValue && (
            <button
              className='rounded-sm bg-primary px-[2.5%] py-[1.5%] text-[2.5cqw] font-medium leading-none text-primary-foreground'
              onClick={handleCheck}
            >
              Check
            </button>
          )}

          {currentUser.bet < room.gameObj.callingValue && (
            <button
              className='rounded-sm bg-primary px-[2.5%] py-[1.5%] text-[2.5cqw] font-medium leading-none text-primary-foreground'
              onClick={handleFold}
            >
              Bỏ bài
            </button>
          )}

          {currentUser.balance + currentUser.bet > room.gameObj.callingValue && (
            <Dialog>
              <DialogTrigger className='rounded-sm bg-primary px-[2.5%] py-[1.5%] text-[2.5cqw] font-medium leading-none text-primary-foreground'>
                Cược thêm
              </DialogTrigger>
              <DialogContent className='w-[400px]'>
                <DialogHeader>
                  <DialogTitle className='mt-2'>Cược thêm</DialogTitle>
                  <DialogDescription>
                    <div className='flex items-center gap-1 font-medium'>
                      Tài khoản của bạn: <div className='text-lg text-primary'>{currentUser?.balance || 0}$</div>
                    </div>
                    <div className='flex items-center gap-1 font-medium'>
                      Số tiền cần bỏ thêm:{' '}
                      <div className='text-lg text-primary'>
                        {room.gameObj.callingValue - currentUser.bet + (raiseValue || 0)}$
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
                        disabled={room.gameObj.callingValue - currentUser.bet + (raiseValue || 0) > currentUser.balance}
                        className='mt-4'
                      >
                        Cược
                      </Button>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  )
}

export default BetButtons

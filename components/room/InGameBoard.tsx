import { useRoom } from '@/hooks/useRoom'
import { cn, getCardImage, isWinnerCard } from '@/lib/utils'
import Image from 'next/image'
import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { callBet, checkBet, foldBet, raiseBet, readyNextMatch } from '@/lib/actions/room'
import { Player, Room } from '@/types'
import { CardRank } from '@/constants/deck'
import HoleCard from '../HoleCard'
import { positionPlayer } from '@/constants'

type Props = {
  room: Room
  players: Player[]
  playingPerson: string | null
  pot: number
  currentUser: Player | null
  winner: Player | null
}

function InGameBoard({ room, currentUser, players, playingPerson, pot, winner }: Props) {
  const [raiseValue, setRaiseValue] = useState<number | null>(null)

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

  const handleFold = async () => {
    try {
      if (!room || !currentUser) {
        return
      }
      await foldBet({ roomId: room.id, userId: currentUser.userId })
    } catch (error) {
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
    <>
      {winner && room?.readyPlayers?.includes(currentUser?.userId || '') && (
        <div className='text-center text-xl font-medium'>Đang chờ người chơi khác tiếp tục...</div>
      )}
      {winner && !room?.readyPlayers?.includes(currentUser?.userId || '') && (
        <div className='fixed inset-0 z-10 flex flex-col bg-black/60'>
          <div className='mt-6 flex items-center justify-center text-3xl font-medium text-white'>
            Chúc Mừng <p className='ml-3 text-4xl font-bold text-primary'>{winner.user.username}</p>
          </div>
          <div className='mt-6 flex items-center justify-center text-3xl font-medium text-white'>
            Hạng bài: <p className='ml-3 text-4xl font-bold text-primary'>{CardRank.get(winner.hand.rank!)}</p>
          </div>

          <Button onClick={handleReadyNextMatch} size='lg' className='absolute bottom-4 right-4'>
            Tiếp tục
          </Button>
        </div>
      )}

      {players?.map((p, index) => {
        return (
          <div
            key={p.userId}
            className={cn('absolute flex w-[20%] aspect-square flex-col border', positionPlayer[String(index)])}
          >
            {/* <div className='absolute z-[4] flex items-center gap-2'>
              <Image src={p.user.picture} alt='player avatar' width={32} height={32} className='rounded-full' />
              <div className='font-medium'>
                {p.user.username}
                {room?.roomOwner === p.userId && '(chủ phòng)'}
              </div>
            </div> */}

            <div className='absolute bottom-0 z-[3] flex flex-col gap-4'>
              <div className='rounded-md border-2 border-muted bg-primary text-[1.2cqw] font-medium'>${p.bet}</div>
              <div className='text-lg text-primary'>${p.balance}</div>
            </div>

            <HoleCard
              className='absolute'
              winner={winner || undefined}
              firstCard={p.hand.handCards[0]}
              secondCard={p.hand.handCards[1]}
              hidden={currentUser?.userId !== p.userId && !winner}
            />
          </div>
        )
      })}

      {room?.boardCards && room.boardCards.length > 0 && (
        <div className='mx-auto mt-8 grid w-fit grid-cols-5 gap-4 rounded-md border-2 p-6'>
          {room?.boardCards.map((card) => {
            return (
              <Image
                key={`${card.suit}-${card.value}`}
                className={cn('col-span-1', winner && isWinnerCard(winner, card) && 'z-20')}
                src={getCardImage(card) || ''}
                alt='first card'
                width={120}
                height={175}
              />
            )
          })}
        </div>
      )}

      {playingPerson === currentUser?.userId && !winner && (
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
            {(currentUser?.bet || 0) < (room?.checkValue || 0) && <Button onClick={handleFold}>Bỏ bài</Button>}
          </div>
        </div>
      )}
    </>
  )
}

export default InGameBoard

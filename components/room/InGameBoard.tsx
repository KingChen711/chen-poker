import { useRoom } from '@/hooks/useRoom'
import { cn, getCardImage, getPlayerPosition, isWinnerCard } from '@/lib/utils'
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
import HoleCard from './HoleCard'
import PlayerBox from './PlayerBox'

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
    <div
      style={{
        containerType: 'size'
      }}
      className='relative aspect-[22/9] w-full min-w-[600px] rounded-[50%]'
    >
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
        const { x, y } = getPlayerPosition(index + 1, players.length + 1)
        return (
          <PlayerBox
            showStand={p.userId === playingPerson}
            posX={x}
            posY={y}
            key={p.userId}
            currentUser={currentUser}
            player={p}
            winner={winner}
          />
        )
      })}

      {room?.boardCards && room.boardCards.length > 0 && (
        <div className='absolute left-1/2 top-1/2 flex w-[45%] -translate-x-1/2 -translate-y-1/2 border-4'>
          {room?.boardCards.map((card) => {
            return (
              <div key={`${card.suit}-${card.value}`} className='relative z-[1] aspect-[0.6857] w-[20%]'>
                <Image
                  fill
                  src={getCardImage(card) || ''}
                  alt='board card'
                  className={cn(winner && isWinnerCard(winner, card) && 'z-20')}
                />
              </div>
            )
          })}
        </div>
      )}

      {playingPerson === currentUser?.userId && !winner && (
        <div
          style={{
            left: '50%',
            top: '0%'
          }}
          className='absolute mt-[3%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4'
        >
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
    </div>
  )
}

export default InGameBoard

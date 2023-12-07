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
import { allInBet, callBet, checkBet, foldBet, raiseBet, readyNextMatch } from '@/lib/actions/game'
import { Player, Room } from '@/types'
import { CardRank } from '@/constants/deck'
import HoleCard from './HoleCard'
import PlayerBox from './PlayerBox'

type Props = {
  room: Room & { status: 'pre-flop' | 'the-flop' | 'the-turn' | 'the-river' | 'showdown' }
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
  const handleReadyNextMatch = async () => {
    try {
      if (room && currentUser) {
        await readyNextMatch({ roomId: room.id, userId: currentUser.userId })
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

  if (!currentUser) {
    return null
  }

  return (
    <div
      style={{
        background: 'url("/assets/images/table.png")'
      }}
      className='relative mt-[1%] aspect-[20/9] w-full min-w-[600px] !bg-cover !bg-center'
    >
      {winner &&
        (room.gameObj.readyPlayers.includes(currentUser.userId) ? (
          <div className='text-center text-xl font-medium'>Đang chờ người chơi khác tiếp tục...</div>
        ) : (
          <div className='fixed inset-0 z-10 flex flex-col bg-black/50 font-merriweather font-black'>
            <div className='mt-[3%] flex items-center justify-center text-[3cqw] font-medium text-white'>
              <p className='capitalize text-primary'>{winner.user?.username} Thắng!</p>
            </div>
            <div className='flex items-center justify-center text-[3cqw] font-medium italic text-primary'>
              {CardRank.get(winner.hand.rank!)}
            </div>

            {players.map((p) => p.userId).includes(currentUser.userId) && (
              <Button
                onClick={handleReadyNextMatch}
                size='lg'
                className='absolute bottom-[3%] right-[2%] h-[4.5%] w-[8%] text-[1cqw] font-bold'
              >
                Tiếp tục
              </Button>
            )}
          </div>
        ))}

      {players.map((p, index) => {
        // spent one more position for the buttons actions
        const { x, y } = getPlayerPosition(index + 1, players.length + 1)
        return (
          <PlayerBox
            key={p.userId}
            showBigBlind={room.gameObj.bigBlind === p.userId}
            showDealer={room.gameObj.dealer === p.userId}
            showSmallBlind={room.gameObj.smallBlind === p.userId}
            showStand={p.userId === playingPerson}
            posX={x}
            posY={y}
            currentUser={currentUser}
            player={p}
            winner={winner}
          />
        )
      })}

      <div className='absolute left-1/2 top-1/2 z-20 mx-auto flex w-[45%] -translate-x-1/2 -translate-y-1/2 gap-3'>
        {room.gameObj.communityCards.map((card) => {
          return (
            <div key={`${card.suit}-${card.value}`} className={cn('relative aspect-[0.6857] w-[20%]')}>
              {winner && <div className='absolute inset-0 z-30 rounded-lg bg-black/50'></div>}
              <Image
                fill
                src={getCardImage(card)!}
                alt='board card'
                className={cn('rounded-lg', winner && isWinnerCard(winner, card) && 'z-30')}
              />
            </div>
          )
        })}
      </div>

      <div
        style={{
          left: '50%',
          top: '0%'
        }}
        className='absolute mt-[3%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4'
      >
        {!winner && (
          <div className='flex items-center gap-1 text-[2cqw] font-medium'>
            Tổng tiền cược: <div className='text-[2.5cqw] font-bold text-primary'>{pot}$</div>
          </div>
        )}
        {playingPerson === currentUser?.userId && !winner && (
          <div className='flex items-center justify-center gap-4'>
            {currentUser.bet < room.gameObj.callingValue &&
              currentUser.balance + currentUser.bet > room.gameObj.callingValue && (
                <Button onClick={handleCall}>Theo cược</Button>
              )}
            {currentUser.balance + currentUser.bet <= room.gameObj.callingValue && (
              <Button onClick={handleAllIn}>All in</Button>
            )}
            {currentUser.bet === room.gameObj.callingValue && <Button onClick={handleCheck}>Check</Button>}
            <Dialog>
              <DialogTrigger>
                {currentUser.balance + currentUser.bet > room.gameObj.callingValue && <Button>Cược thêm</Button>}
              </DialogTrigger>
              <DialogContent className='w-[400px]'>
                <DialogHeader>
                  <DialogTitle>Cược thêm</DialogTitle>
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
            {currentUser.bet < room.gameObj.callingValue && <Button onClick={handleFold}>Bỏ bài</Button>}
          </div>
        )}
      </div>
    </div>
  )
}

export default InGameBoard

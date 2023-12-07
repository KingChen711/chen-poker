import { cn } from '@/lib/utils'
import { Player } from '@/types'
import Image from 'next/image'
import React from 'react'
import HoleCard from './HoleCard'

type Props = {
  player: Player
  winner: Player | null
  currentUser: Player | null
  posX: number
  posY: number
  showStand?: boolean
  showDealer?: boolean
  showSmallBlind?: boolean
  showBigBlind?: boolean
}

function PlayerBox({
  player,
  winner,
  currentUser,
  posX,
  posY,
  showStand,
  showBigBlind,
  showDealer,
  showSmallBlind
}: Props) {
  console.log({ hand: player.hand })
  return (
    <div
      key={player.userId}
      style={{
        left: `${posX}%`,
        top: `${posY}%`
      }}
      className={cn(
        'absolute flex aspect-[1.08/1] w-[15%] -translate-x-1/2 -translate-y-1/2 flex-col',
        winner?.userId === player.userId && 'z-20'
      )}
    >
      <div className='absolute bottom-[15%] left-1/2 z-10 flex w-[75%] -translate-x-1/2 flex-col'>
        <div className='flex justify-center rounded-md border-2 border-black bg-primary text-[1.3cqw] font-medium text-primary-foreground max-md:text-[2.3cqw] max-sm:text-[2.7cqw]'>
          ${player.bet}
        </div>
        <div className='mx-auto flex w-[87%] justify-center rounded-md border-2 border-black bg-accent text-[1.1cqw] text-primary max-md:text-[2cqw] max-sm:text-[2.5cqw]'>
          ${player.balance}
        </div>
      </div>

      <div className='absolute bottom-0 z-10 flex w-full items-center justify-center'>
        <div className='relative mr-1 aspect-square w-[13%]'>
          <Image fill src={player.user?.picture || ''} alt='avatar' className='rounded-full' />
        </div>
        <div className='text-[1.2cqw] font-medium max-md:text-[2.0cqw] max-sm:text-[2.5cqw]'>
          {player.user?.username || ''}
        </div>
      </div>

      <HoleCard
        className=''
        winner={winner || undefined}
        firstCard={player.hand?.holeCards[0]}
        secondCard={player.hand?.holeCards[1]}
        hidden={currentUser?.userId !== player.userId && !winner}
      />

      {showDealer && (
        <div className='absolute right-0 top-[61%] z-10 mr-1 aspect-square w-[25%]'>
          <Image fill src='/assets/icons/dealer.jpg' alt='dealer' className='rounded-full' />
        </div>
      )}
      {showBigBlind && (
        <div className='absolute right-0 top-[61%] z-10 mr-1 aspect-square w-[25%]'>
          <Image fill src='/assets/icons/big-blind.jpg' alt='big-blind' className='rounded-full' />
        </div>
      )}
      {showSmallBlind && (
        <div className='absolute right-0 top-[61%] z-10 mr-1 aspect-square w-[25%]'>
          <Image fill src='/assets/icons/small-blind.jpg' alt='small-blind' className='rounded-full' />
        </div>
      )}

      {showStand && !winner && (
        <div className='stand-player'>
          <div className='absolute inset-[2%] -z-50 rounded-[50%] bg-background'></div>
        </div>
      )}
    </div>
  )
}

export default PlayerBox

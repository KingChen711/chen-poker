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
}

function PlayerBox({ player, winner, currentUser, posX, posY, showStand }: Props) {
  return (
    <div
      key={player.userId}
      style={{
        left: `${posX}%`,
        top: `${posY}%`
      }}
      className={cn(
        'absolute flex aspect-[1.08/1] w-[17%] -translate-x-1/2 -translate-y-1/2 flex-col',
        winner?.userId === player.userId && 'z-20'
      )}
    >
      <div className='absolute bottom-[15%] left-1/2 z-10 flex w-[75%] -translate-x-1/2 flex-col'>
        <div className='flex justify-center rounded-md border-2 border-black bg-primary text-[1.7cqw] font-medium text-primary-foreground max-md:text-[2.3cqw] max-sm:text-[2.7cqw]'>
          ${player.bet}
        </div>
        <div className='mx-auto flex w-[87%] justify-center rounded-md border-2 border-black bg-accent text-[1.4cqw] text-primary max-md:text-[2cqw] max-sm:text-[2.5cqw]'>
          ${player.balance}
        </div>
      </div>

      <div className='absolute bottom-0 z-10 flex w-full items-center justify-center'>
        <div className='relative mr-1 aspect-square w-[10%]'>
          <Image fill src={player.user.picture} alt='avatar' className='rounded-full' />
        </div>
        <div className='text-[1.4cqw] font-medium max-md:text-[2.0cqw] max-sm:text-[2.5cqw]'>
          {player.user.username}
        </div>
      </div>

      <HoleCard
        className=''
        winner={winner || undefined}
        firstCard={player.hand.handCards[0]}
        secondCard={player.hand.handCards[1]}
        hidden={currentUser?.userId !== player.userId && !winner}
      />

      {showStand && !winner && (
        <div className='stand-player'>
          <div className='absolute inset-[1%] -z-50 rounded-[50%] bg-background'></div>
        </div>
      )}
    </div>
  )
}

export default PlayerBox

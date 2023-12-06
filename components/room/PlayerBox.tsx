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
      className='absolute flex aspect-[1.08/1] w-[17%] -translate-x-1/2 -translate-y-1/2 flex-col'
    >
      <div className='absolute bottom-[15%] left-1/2 z-[3] flex w-[75%] -translate-x-1/2 flex-col'>
        <div className='flex justify-center rounded-md border-2 border-black bg-primary text-[1.7cqw] font-medium text-primary-foreground'>
          ${player.bet}
        </div>
        <div className='mx-auto flex w-[87%] justify-center rounded-md border-2 border-black bg-accent text-[1.4cqw] text-primary'>
          ${player.balance}
        </div>
      </div>

      <div className='absolute bottom-0 z-[3] flex w-full items-center justify-center'>
        <div className='relative mr-1 aspect-square w-[10%]'>
          <Image fill src={player.user.picture} alt='avatar' className='rounded-full' />
        </div>
        <div className='text-[1.4cqw] font-medium'>{player.user.username}</div>
      </div>

      <HoleCard
        className='absolute'
        winner={winner || undefined}
        firstCard={player.hand.handCards[0]}
        secondCard={player.hand.handCards[1]}
        hidden={currentUser?.userId !== player.userId && !winner}
      />

      {showStand && (
        <div className='stand-player'>
          <div className='absolute inset-[1%] rounded-[50%] bg-background'></div>
        </div>
      )}
    </div>
  )
}

export default PlayerBox

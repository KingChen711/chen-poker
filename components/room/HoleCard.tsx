import { cn, getCardImage, isWinnerCard } from '@/lib/utils'
import { Card, Player } from '@/types'
import Image from 'next/image'
import React from 'react'

type Props = {
  winner: Player | null
  firstCard: Card
  secondCard: Card
  hidden?: boolean
  className?: string
}

function HoleCard({ winner, firstCard, secondCard, hidden = false, className }: Props) {
  return (
    <div className={cn('w-full h-full -z-20', className)}>
      <div className='absolute left-1/2 z-[5] aspect-[0.6857] w-[50%] -translate-x-2/3'>
        {winner && <div className='absolute inset-0 z-30 translate-x-[30%] rotate-12 rounded-md bg-black/50'></div>}
        <Image
          fill
          src={hidden ? '/assets/cards/back-card.jpg' : firstCard && getCardImage(firstCard)!}
          alt='first card'
          className={cn(
            'rounded-md absolute translate-x-[30%] rotate-12',
            winner && isWinnerCard(winner, firstCard!) && 'z-50'
          )}
        />
      </div>
      <div className='absolute left-1/2 aspect-[0.6857] w-[50%] -translate-x-2/3 rounded-md'>
        {winner && <div className='absolute inset-0 z-30 -rotate-12 bg-black/50'></div>}
        <Image
          fill
          src={hidden ? '/assets/cards/back-card.jpg' : secondCard && getCardImage(secondCard)!}
          alt='second card'
          className={cn('rounded-md absolute -rotate-12', winner && isWinnerCard(winner, secondCard!) && 'z-50')}
        />
      </div>
    </div>
  )
}

export default HoleCard

import { cn, getCardImage, isWinnerCard } from '@/lib/utils'
import { Card, Player } from '@/types'
import Image from 'next/image'
import React from 'react'

type Props = { winner?: Player; firstCard?: Card; secondCard?: Card; hidden?: boolean; className?: string }

function HoleCard({ winner, firstCard, secondCard, hidden = false, className }: Props) {
  return (
    <div className={cn('w-full h-full', className)}>
      <div className='absolute left-1/2 z-[2] aspect-[0.6857] w-[50%] -translate-x-2/3'>
        <Image
          fill
          src={hidden ? '/assets/cards/back-card.jpg' : getCardImage(firstCard!) || ''}
          alt='first card'
          className={cn('absolute rotate-12 translate-x-[30%]', winner && isWinnerCard(winner, firstCard!) && 'z-[22]')}
        />
      </div>
      <div className='absolute left-1/2 z-[1] aspect-[0.6857] w-[50%] -translate-x-2/3'>
        <Image
          fill
          src={hidden ? '/assets/cards/back-card.jpg' : getCardImage(secondCard!) || ''}
          alt='second card'
          className={cn('absolute -rotate-12', winner && isWinnerCard(winner, secondCard!) && 'z-[21]')}
        />
      </div>
    </div>
  )
}

export default HoleCard

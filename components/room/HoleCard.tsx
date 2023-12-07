import { cn, getCardImage, isWinnerCard } from '@/lib/utils'
import { Card, Player } from '@/types'
import Image from 'next/image'
import React from 'react'

type Props = { winner?: Player; firstCard?: Card; secondCard?: Card; hidden?: boolean; className?: string }

function HoleCard({ winner, firstCard, secondCard, hidden = false, className }: Props) {
  return (
    <div className={cn('w-full h-full', className)}>
      <div
        className={cn(
          'absolute left-1/2 z-[5] aspect-[0.6857] w-[50%] -translate-x-2/3',
          winner && isWinnerCard(winner, firstCard!) && 'z-[60]'
        )}
      >
        <Image
          fill
          src={hidden ? '/assets/cards/back-card.jpg' : getCardImage(firstCard!) || ''}
          alt='first card'
          className='absolute translate-x-[30%] rotate-12'
        />
      </div>
      <div
        className={cn(
          'absolute left-1/2 aspect-[0.6857] w-[50%] -translate-x-2/3',
          winner && isWinnerCard(winner, firstCard!) && 'z-50'
        )}
      >
        <Image
          fill
          src={hidden ? '/assets/cards/back-card.jpg' : getCardImage(secondCard!) || ''}
          alt='second card'
          className='absolute -rotate-12'
        />
      </div>
    </div>
  )
}

export default HoleCard

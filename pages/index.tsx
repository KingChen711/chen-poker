import { assignRankHand } from '@/lib/poker/assign-rank-hand'
import { compareHand } from '@/lib/poker/compare'
import { Card, CardSuit, CardValue, Hand } from '@/types'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

let hand1: Hand = {
  handCards: [
    {
      suit: CardSuit.Diamond,
      value: CardValue.Four
    },
    {
      suit: CardSuit.Spade,
      value: CardValue.Six
    }
  ]
}

let hand2: Hand = {
  handCards: [
    {
      suit: CardSuit.Diamond,
      value: CardValue.Ace
    },
    {
      suit: CardSuit.Spade,
      value: CardValue.Eight
    }
  ]
}

const boardCards: Card[] = [
  {
    suit: CardSuit.Diamond,
    value: CardValue.King
  },
  {
    suit: CardSuit.Spade,
    value: CardValue.Three
  },
  {
    suit: CardSuit.Diamond,
    value: CardValue.Seven
  },
  {
    suit: CardSuit.Spade,
    value: CardValue.Five
  },
  {
    suit: CardSuit.Diamond,
    value: CardValue.Jack
  }
]
export default function Home() {
  useEffect(() => {
    hand1 = assignRankHand(hand1, boardCards)
    hand2 = assignRankHand(hand2, boardCards)

    compareHand(hand1, hand2)
    compareHand(hand1, hand2)
    compareHand(hand1, hand2)
    compareHand(hand1, hand2)

    const result = compareHand(hand1, hand2)
    if (result > 0) {
      console.log('Hand2 win')
    } else {
      console.log('Hand1 win')
    }
    console.log('after', { hand1, hand2 })
  }, [])

  return (
    <main className={`${inter.className}`}>
      <div className='text-red-500'>Hello world</div>
    </main>
  )
}

// "0000 0000 0000 0000 0000 0111 0000 0000 0000 0011 0000 0000 0000 0000 0000"

import { compareHand, getRank, handToSecondBitField } from '@/lib/compare-hand'
import { CardSuit, Hand } from '@/types'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

const hand1: Hand = {
  cards: [
    {
      suit: CardSuit.Heart,
      value: '2'
    },
    {
      suit: CardSuit.Heart,
      value: '2'
    },
    {
      suit: CardSuit.Heart,
      value: '2'
    },
    {
      suit: CardSuit.Heart,
      value: '2'
    },
    {
      suit: CardSuit.Heart,
      value: '3'
    },
    {
      suit: CardSuit.Heart,
      value: '3'
    },
    {
      suit: CardSuit.Heart,
      value: '3'
    }
  ]
}
const hand2: Hand = {
  cards: [
    {
      suit: CardSuit.Heart,
      value: '9'
    },
    {
      suit: CardSuit.Heart,
      value: '8'
    },
    {
      suit: CardSuit.Club,
      value: '7'
    },
    {
      suit: CardSuit.Heart,
      value: 'J'
    },
    {
      suit: CardSuit.Heart,
      value: '10'
    }
  ]
}

export default function Home() {
  useEffect(() => {
    hand1.rank = getRank(hand1)
    hand2.rank = getRank(hand2)

    const rest = Number(handToSecondBitField(hand1) % BigInt(15))

    console.log({ rest })

    // const result = compareHand(hand1, hand2)
    // if (result > 0) {
    //   console.log('Hand2 win')
    // } else {
    //   console.log('Hand1 win')
    // }
  }, [])

  return (
    <main className={`${inter.className}`}>
      <div className='text-red-500'>Hello world</div>
    </main>
  )
}

// "0000 0000 0000 0000 0000 0111 0000 0000 0000 0011 0000 0000 0000 0000 0000"

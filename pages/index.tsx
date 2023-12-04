import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { createRoom, getCurrentRoom } from '@/lib/_actions/room'
import { UserButton, useAuth } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

// let hand1: Hand = {
//   handCards: [
//     {
//       suit: CardSuit.Diamond,
//       value: CardValue.Four
//     },
//     {
//       suit: CardSuit.Spade,
//       value: CardValue.Six
//     }
//   ]
// }

// let hand2: Hand = {
//   handCards: [
//     {
//       suit: CardSuit.Diamond,
//       value: CardValue.Ace
//     },
//     {
//       suit: CardSuit.Spade,
//       value: CardValue.Eight
//     }
//   ]
// }

// const boardCards: Card[] = [
//   {
//     suit: CardSuit.Diamond,
//     value: CardValue.King
//   },
//   {
//     suit: CardSuit.Spade,
//     value: CardValue.Three
//   },
//   {
//     suit: CardSuit.Diamond,
//     value: CardValue.Seven
//   },
//   {
//     suit: CardSuit.Spade,
//     value: CardValue.Five
//   },
//   {
//     suit: CardSuit.Diamond,
//     value: CardValue.Jack
//   }
// ]

export default function Home() {
  const { userId: clerkId } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  // useEffect(() => {
  //   hand1 = assignRankHand(hand1, boardCards)
  //   hand2 = assignRankHand(hand2, boardCards)

  //   compareHand(hand1, hand2)
  //   compareHand(hand1, hand2)
  //   compareHand(hand1, hand2)
  //   compareHand(hand1, hand2)

  //   const result = compareHand(hand1, hand2)
  //   if (result > 0) {
  //     console.log('Hand2 win')
  //   } else {
  //     console.log('Hand1 win')
  //   }
  //   console.log('after', { hand1, hand2 })
  // }, [])

  const handleCreateNewRoom = async () => {
    if (!clerkId) {
      return
    }
    try {
      const response = await createRoom({ clerkId })
      router.push(`/rooms/${response?.roomId}`)
    } catch (error) {
      // @ts-ignore
      if (error.message === 'You are already in a room!') {
        toast({
          variant: 'destructive',
          title: 'You are already in a room!',
          description: 'Try rejoin your current room and click leave that room if you want to create a new room!'
        })
      }
    }
  }

  const handleJoinCurrentRoom = async () => {
    if (!clerkId) {
      return
    }
    try {
      const response = await getCurrentRoom({ clerkId })
      router.push(`/rooms/${response.roomId}`)
    } catch (error) {
      // @ts-ignore
      if (error.message === 'Not found your current room!') {
        toast({
          variant: 'destructive',
          title: 'Not found your current room!',
          description: 'Try join a room by code or create a new room'
        })
      }
    }
  }

  return (
    <div className={`${inter}`}>
      <header>
        <UserButton afterSignOutUrl='/' />
      </header>
      <main>
        <Button onClick={handleJoinCurrentRoom}>Join your current room</Button>
        <Button onClick={handleCreateNewRoom}>Create a room</Button>
      </main>
    </div>
  )
}

// "0000 0000 0000 0000 0000 0111 0000 0000 0000 0011 0000 0000 0000 0000 0000"

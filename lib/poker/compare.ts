import { Card, Hand } from '@/types'

// const ToBreakTieValue = (hand: Hand) => {
//   const bigInts = hand.handCards
//     .map((card) => {
//       return card?.value!
//     })
//     .toSorted((card1, card2) => {
//       return Number(CardValueToBigInt.get(card2)! - CardValueToBigInt.get(card1)!)
//     })
//     .map((card) => CardValueToBigInt.get(card)!)

//   return (
//     (bigInts[0] << BigInt(16)) +
//     (bigInts[1] << BigInt(12)) +
//     (bigInts[2] << BigInt(8)) +
//     (bigInts[3] << BigInt(4)) +
//     (bigInts[4] << BigInt(0))
//   )
// }

export function compareHand(hand1: Hand, hand2: Hand) {
  if (hand1.rank !== hand2.rank) {
    return hand2.rank! - hand1.rank!
  }

  const pokerCards1 = hand1.pokerCards as Card[]
  const pokerCards2 = hand2.pokerCards as Card[]

  for (let i = 0; i < 5; ++i) {
    if (pokerCards1[i] !== pokerCards2[i]) {
      return compareCard(pokerCards1[i], pokerCards2[i])
    }
  }

  return 0
}

export function compareCard(card1: Card, card2: Card): number {
  if (card1 === card2) {
    return 0
  }
  if (card1.value !== card2.value) {
    return card2.value.valueOf() - card1.value.valueOf()
  }
  return card2.suit.valueOf() - card1.suit.valueOf()
}

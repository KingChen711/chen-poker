'use client'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import useFirestore from '@/hooks/useFirestore'
import { useRoom } from '@/hooks/useRoom'
import { getUserByClerkId } from '@/lib/actions/user'
import { User } from '@/types'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type Props = {
  params: {
    id: string
  }
}

function RoomDetailPage({ params }: Props) {
  const router = useRouter()

  const user = useCurrentUser()
  // const room = useRoom(roomId)

  // console.log({ room })

  return <div>This is room: {params.id}</div>
}

export default RoomDetailPage

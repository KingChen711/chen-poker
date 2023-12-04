'use client'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import useFirestore from '@/hooks/useFirestore'
import { useRoom } from '@/hooks/useRoom'
import { getUserByClerkId } from '@/lib/actions/user'
import { User } from '@/types'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

function RoomDetailPage() {
  const router = useRouter()
  const roomId = router.query.id as string

  const user = useCurrentUser()
  const room = useRoom(roomId)

  console.log({ room })

  return <div>This is room: {roomId}</div>
}

export default RoomDetailPage

import { cleanUp } from '@/lib/actions/room'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await req.json()
  await cleanUp(userId)
  return NextResponse.json({ message: 'OK' })
}

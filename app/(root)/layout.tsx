import Header from '@/components/shared/Header'
import { Toaster } from '@/components/ui/toaster'
import { getUserByClerkId } from '@/lib/actions/user'
import { auth } from '@clerk/nextjs'
import { redirect, usePathname } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const { userId: clerkId } = auth()

  return (
    <main className='relative'>
      <Header />
      <div className='mx-auto w-full max-w-7xl'>{children}</div>
      <Toaster />
    </main>
  )
}

export default Layout

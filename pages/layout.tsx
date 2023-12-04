import { UserButton } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className={`${inter}`}>
      <header>
        <UserButton afterSignOutUrl='/' />
      </header>
      <main>{children}</main>
    </div>
  )
}

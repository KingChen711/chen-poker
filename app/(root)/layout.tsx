import Header from '@/components/shared/Header'
import { Toaster } from '@/components/ui/toaster'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  return (
    <main className='relative pb-12'>
      <Header />
      <div className='mx-auto w-11/12 max-w-7xl'>{children}</div>
      <Toaster />
    </main>
  )
}

export default Layout

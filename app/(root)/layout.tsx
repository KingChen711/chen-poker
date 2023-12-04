import { Toaster } from '@/components/ui/toaster'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <main className='relative'>
      {/* <Navbar /> */}
      <div className='flex'>
        {/* <LeftSidebar /> */}
        <section className='flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14'>
          <div className='mx-auto w-full max-w-5xl'>{children}</div>
        </section>
        {/* <RightSidebar /> */}
      </div>
      <Toaster />
    </main>
  )
}

export default Layout

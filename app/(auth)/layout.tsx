import React from 'react'

type Props = {
  children: React.ReactNode
}

function Layout({ children }: Props) {
  return (
    <main className='relative flex min-h-screen w-full items-center justify-center bg-[url("/assets/images/bg-auth.jpeg")] bg-cover bg-no-repeat'>
      <div className='absolute inset-0 bg-black/70' />
      {children}
    </main>
  )
}

export default Layout

import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ModeToggle } from './ModeToggle'

function Header() {
  return (
    <header className='border-b shadow'>
      <div className='mx-auto flex w-11/12 max-w-7xl items-center justify-between py-6'>
        <Link className='flex items-center gap-1' href='/'>
          <Image alt='Chen Poker Logo' src='/assets/images/chip.png' width={26} height={26} />
          <div className='font-spaceGrotesk text-3xl font-bold max-sm:hidden'>
            Chen<span className='text-primary'>Poker</span>
          </div>
        </Link>
        <div className='flex items-center gap-3'>
          <ModeToggle />
          <UserButton
            afterSignOutUrl='/'
            appearance={{
              elements: {
                avatarBox: 'h-10 w-10'
              },
              variables: {
                colorPrimary: '#E11D48'
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}

export default Header

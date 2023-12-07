import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'
import { Inter, Space_Grotesk as SpaceGrotesk, Merriweather } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { viVN } from '@clerk/localizations'
import { dark } from '@clerk/themes'

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter'
})

const spaceGrotesk = SpaceGrotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-spaceGrotesk'
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather'
})

export const metadata: Metadata = {
  title: 'Chen Poker',
  description:
    'Discover the best in online poker at Chen Poker. Enjoy seamless game play, diverse variants, and a vibrant community. Join us for an immersive experience with optimized metadata for easy searchability. Your journey to poker excellence starts here!',
  icons: {
    icon: '/assets/images/chip.png'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={viVN}
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: 'primary-gradient',
          footerActionLink: 'primary-text-gradient hover:text-primary'
        }
      }}
    >
      <html lang='en'>
        <body className={`${inter.variable} ${spaceGrotesk.variable} ${merriweather.variable}`}>
          <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

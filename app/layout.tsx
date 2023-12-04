import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'
// eslint-disable-next-line camelcase
import { Inter, Space_Grotesk } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/contexts/ThemeProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter'
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-spaceGrotesk'
})

export const metadata: Metadata = {
  title: 'Chen Poker',
  description:
    'Discover the best in online poker at Chen Poker. Enjoy seamless gameplay, diverse variants, and a vibrant community. Join us for an immersive experience with optimized metadata for easy searchability. Your journey to poker excellence starts here!',
  icons: {
    icon: '/assets/images/site-logo.svg'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'primary-gradient',
          footerActionLink: 'primary-text-gradient hover:text-primary-500'
        }
      }}
    >
      <ThemeProvider>
        <html lang='en'>
          <body className={`${inter.variable} ${spaceGrotesk.variable}`}>{children}</body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  )
}

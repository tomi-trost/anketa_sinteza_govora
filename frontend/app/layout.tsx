import type { Metadata } from 'next'
import './globals.css'
import { Open_Sans, Montserrat } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Razločevanje med naravnim in sintetiziranim govorom',
  description: '',
  generator: '',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  }
  
}

const montserrat = Montserrat({
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sl" suppressHydrationWarning>
      <body suppressHydrationWarning className={montserrat.className}>{children}</body>
    </html>
  )
}

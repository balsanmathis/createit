import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import SessionRefresher from '@/components/SessionRefresher'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CreateIt — Générateur de sites web par IA',
  description: 'Créez des sites web professionnels en quelques secondes grâce à l\'IA. Décrivez votre site, l\'IA le génère instantanément.',
  keywords: ['générateur site web', 'IA', 'intelligence artificielle', 'site web', 'Claude AI'],
  openGraph: {
    title: 'CreateIt — Générateur de sites web par IA',
    description: 'Créez des sites web professionnels en quelques secondes grâce à l\'IA.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <SessionRefresher />
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(13,13,26,0.9)',
              border: '1px solid rgba(124,109,250,0.25)',
              backdropFilter: 'blur(12px)',
              color: 'white',
            },
          }}
        />
      </body>
    </html>
  )
}

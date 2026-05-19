import type { Metadata } from 'next'
import { Geist, Geist_Mono, Syne, DM_Sans, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import SessionRefresher from '@/components/SessionRefresher'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
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
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${dmSans.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Analytics />
        <SessionRefresher />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster
          theme="light"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
          }}
        />
      </body>
    </html>
  )
}

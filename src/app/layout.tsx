import type { Metadata } from 'next'
import { Geist_Mono, Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import SessionRefresher from '@/components/SessionRefresher'
import ErrorBoundary from '@/components/ErrorBoundary'
import { LanguageProvider } from '@/contexts/language'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CreateIt — Générez votre site web en quelques secondes',
  description:
    'Décrivez votre projet en français, CreateIt génère un site web professionnel complet en moins de 30 secondes. Éditez, exportez en ZIP, hébergez où vous voulez.',
  keywords: [
    'générateur site web',
    'créer site internet',
    'site web IA',
    'générateur HTML',
    'site web automatique',
  ],
  openGraph: {
    title: 'CreateIt — Générez votre site web en quelques secondes',
    description:
      'Décrivez votre projet, obtenez un site professionnel en 30 secondes. Exportez le code, hébergez où vous voulez.',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
          <Analytics />
          <SessionRefresher />
          <ErrorBoundary>{children}</ErrorBoundary>
          <Toaster
            theme="system"
            toastOptions={{
              style: {
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
                boxShadow: 'var(--shadow)',
              },
            }}
          />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

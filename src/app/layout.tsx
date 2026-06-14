import type { Metadata } from 'next'
import { Geist_Mono, Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import SessionRefresher from '@/components/SessionRefresher'
import ErrorBoundary from '@/components/ErrorBoundary'
import { LanguageProvider } from '@/contexts/language'
import HomeButton from '@/components/ui/HomeButton'
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
  metadataBase: new URL('https://www.create-it.app'),
  title: {
    default: 'CreateIt — Créez votre site web en 30 secondes avec l\'IA',
    template: '%s | CreateIt',
  },
  description:
    'Décrivez votre projet en quelques mots, CreateIt génère un site web professionnel complet en moins de 30 secondes. Éditez, exportez en ZIP, hébergez où vous voulez.',
  keywords: [
    'créateur site web IA',
    'générateur site internet',
    'créer site web rapide',
    'IA création site',
    'site web automatique',
    'générateur HTML',
  ],
  authors: [{ name: 'CreateIt' }],
  creator: 'CreateIt',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.create-it.app',
    siteName: 'CreateIt',
    title: 'CreateIt — Créez votre site web en 30 secondes avec l\'IA',
    description:
      'Décrivez votre projet en quelques mots, l\'IA le crée pour vous. Sites professionnels, exportables en ZIP, prêts en 30 secondes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreateIt — Créez votre site web en 30 secondes avec l\'IA',
    description:
      'Décrivez votre projet en quelques mots, l\'IA le crée pour vous.',
  },
  alternates: {
    canonical: 'https://www.create-it.app',
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
          <HomeButton />
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

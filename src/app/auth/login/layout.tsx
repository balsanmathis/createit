import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion — CreateIt',
  description: 'Connectez-vous à votre compte CreateIt pour accéder à votre espace de création de sites web.',
  alternates: { canonical: 'https://www.create-it.app/auth/login' },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

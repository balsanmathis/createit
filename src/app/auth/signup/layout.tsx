import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte — CreateIt',
  description: 'Créez votre compte CreateIt gratuitement et commencez à générer des sites web professionnels avec l\'IA en 30 secondes.',
  alternates: { canonical: 'https://www.create-it.app/auth/signup' },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

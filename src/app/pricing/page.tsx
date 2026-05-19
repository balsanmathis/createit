import { cookies } from 'next/headers'
import PricingSection from '@/components/landing/PricingSection'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

interface Props {
  searchParams: Promise<{ promo?: string }>
}

export default async function PricingPage({ searchParams }: Props) {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value === 'en' ? 'en' : 'fr') as 'fr' | 'en'
  const { promo } = await searchParams

  return (
    <main className="min-h-screen" style={{ background: '#f8fafc' }}>
      <Navbar locale={locale} />
      <div style={{ paddingTop: 56 }}>
        <PricingSection locale={locale} initialPromoCode={promo} />
      </div>
      <Footer locale={locale} />
    </main>
  )
}

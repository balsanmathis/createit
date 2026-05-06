import { cookies } from 'next/headers'
import PricingSection from '@/components/landing/PricingSection'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default async function PricingPage() {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value === 'en' ? 'en' : 'fr') as 'fr' | 'en'

  return (
    <main className="min-h-screen bg-[#080810] text-white">
      <Navbar locale={locale} />
      <div className="pt-20">
        <PricingSection locale={locale} />
      </div>
      <Footer locale={locale} />
    </main>
  )
}

import { cookies } from 'next/headers'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import PricingSection from '@/components/landing/PricingSection'
import CtaSection from '@/components/landing/CtaSection'
import Footer from '@/components/landing/Footer'

export default async function HomePage() {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('locale')?.value
  const locale = (localeCookie === 'en' ? 'en' : 'fr') as 'fr' | 'en'

  return (
    <main className="min-h-screen bg-[#080810] text-white">
      <Navbar locale={locale} />
      <HeroSection locale={locale} />
      <FeaturesSection locale={locale} />
      <HowItWorksSection locale={locale} />
      <PricingSection locale={locale} />
      <CtaSection locale={locale} />
      <Footer locale={locale} />
    </main>
  )
}

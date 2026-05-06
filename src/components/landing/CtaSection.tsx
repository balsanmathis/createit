'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface CtaSectionProps {
  locale?: 'fr' | 'en'
}

export default function CtaSection({ locale = 'fr' }: CtaSectionProps) {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-12 sm:p-16 text-center border border-violet-500/20 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-transparent rounded-3xl" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl mb-6"
            >
              🚀
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
              {locale === 'fr' ? (
                <>Prêt à créer votre<br /><span className="gradient-text">premier site ?</span></>
              ) : (
                <>Ready to build your<br /><span className="gradient-text">first website?</span></>
              )}
            </h2>
            <p className="text-xl text-white/50 mb-10 max-w-xl mx-auto">
              {locale === 'fr'
                ? 'Rejoignez des milliers de créateurs qui utilisent CreateIt pour bâtir leurs projets web en quelques secondes.'
                : 'Join thousands of creators using CreateIt to build their web projects in seconds.'}
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-200 shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {locale === 'fr' ? 'Commencer gratuitement' : 'Start for free'}
              <span>→</span>
            </Link>
            <p className="mt-4 text-sm text-white/30">
              {locale === 'fr'
                ? 'Sans carte bancaire requise · Annulation à tout moment'
                : 'No credit card required · Cancel anytime'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

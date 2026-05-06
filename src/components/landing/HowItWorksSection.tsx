'use client'

import { motion } from 'framer-motion'

const STEPS_FR = [
  {
    num: '01',
    title: 'Décrivez votre site',
    description: 'Écrivez une description en langage naturel de votre site idéal. Soyez précis ou laissez libre cours à l\'IA.',
    detail: 'Ex: "Un site portfolio pour un designer UX avec une galerie de projets animée et un formulaire de contact"',
  },
  {
    num: '02',
    title: 'L\'IA génère',
    description: 'Claude analyse votre description et génère un site web complet avec HTML, CSS et JavaScript en quelques secondes.',
    detail: 'Design responsive, animations modernes, accessibilité — tout est pris en charge automatiquement.',
  },
  {
    num: '03',
    title: 'Éditez et exportez',
    description: 'Utilisez l\'éditeur visuel pour personnaliser les textes et images, puis exportez votre site en ZIP.',
    detail: 'Hébergez sur Vercel, Netlify, GitHub Pages ou n\'importe quel hébergeur en moins de 2 minutes.',
  },
]

const STEPS_EN = [
  {
    num: '01',
    title: 'Describe your site',
    description: 'Write a natural language description of your ideal site. Be specific or let the AI run wild.',
    detail: 'E.g., "A portfolio site for a UX designer with an animated project gallery and contact form"',
  },
  {
    num: '02',
    title: 'AI generates',
    description: 'Claude analyzes your description and generates a complete website with HTML, CSS and JavaScript in seconds.',
    detail: 'Responsive design, modern animations, accessibility — everything is handled automatically.',
  },
  {
    num: '03',
    title: 'Edit and export',
    description: 'Use the visual editor to customize texts and images, then export your site as ZIP.',
    detail: 'Host on Vercel, Netlify, GitHub Pages or any host in under 2 minutes.',
  },
]

interface HowItWorksSectionProps {
  locale?: 'fr' | 'en'
}

export default function HowItWorksSection({ locale = 'fr' }: HowItWorksSectionProps) {
  const steps = locale === 'fr' ? STEPS_FR : STEPS_EN

  return (
    <section id="how-it-works" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(99,102,241,0.06)_0%,transparent_60%)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 border border-violet-500/20">
            <span className="text-sm text-violet-300 font-medium">
              {locale === 'fr' ? 'Comment ça marche' : 'How it works'}
            </span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-6">
            {locale === 'fr' ? '3 étapes vers' : '3 steps to your'}<br />
            <span className="gradient-text">{locale === 'fr' ? 'votre site parfait' : 'perfect site'}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-violet-500/30 via-indigo-500/30 to-violet-500/30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="glass rounded-2xl p-8 border border-white/5 hover:border-violet-500/20 transition-all duration-300 h-full">
                {/* Number */}
                <div className="text-6xl font-black text-violet-500/20 font-mono mb-6 leading-none">
                  {step.num}
                </div>
                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/25">
                    {i + 1}
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/60 mb-4 leading-relaxed">{step.description}</p>
                <p className="text-sm text-violet-300/60 italic border-l-2 border-violet-500/30 pl-3">
                  {step.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

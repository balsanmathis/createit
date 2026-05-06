'use client'

import { motion } from 'framer-motion'

const FEATURES_FR = [
  {
    icon: '✦',
    title: 'IA Avancée (Claude)',
    description: 'Claude Sonnet génère des sites web professionnels complets à partir d\'une simple description textuelle en langage naturel.',
    color: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/20',
  },
  {
    icon: '◈',
    title: 'Éditeur Visuel',
    description: 'Cliquez sur n\'importe quel texte ou image pour les modifier directement dans votre navigateur. Aucun code requis.',
    color: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20',
  },
  {
    icon: '⬡',
    title: 'Export ZIP',
    description: 'Téléchargez votre site en un clic. Fichiers HTML/CSS/JS propres, prêts à être hébergés n\'importe où.',
    color: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/20',
  },
  {
    icon: '⬢',
    title: 'Templates 21st.dev',
    description: 'Importez des composants UI premium depuis la bibliothèque 21st.dev Magic MCP pour enrichir vos sites.',
    color: 'from-fuchsia-500/20 to-fuchsia-600/5',
    border: 'border-fuchsia-500/20',
  },
  {
    icon: '◉',
    title: 'Bilingue FR / EN',
    description: 'Interface complète et génération de sites disponibles en français et en anglais selon votre préférence.',
    color: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/20',
  },
  {
    icon: '◎',
    title: 'Historique complet',
    description: 'Retrouvez, modifiez et re-téléchargez tous vos sites précédemment créés depuis votre dashboard personnel.',
    color: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20',
  },
]

const FEATURES_EN = [
  {
    icon: '✦',
    title: 'Advanced AI (Claude)',
    description: 'Claude Sonnet generates complete professional websites from a simple natural language text description.',
    color: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/20',
  },
  {
    icon: '◈',
    title: 'Visual Editor',
    description: 'Click on any text or image to edit them directly in your browser. No code required.',
    color: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20',
  },
  {
    icon: '⬡',
    title: 'ZIP Export',
    description: 'Download your site in one click. Clean HTML/CSS/JS files, ready to be hosted anywhere.',
    color: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/20',
  },
  {
    icon: '⬢',
    title: '21st.dev Templates',
    description: 'Import premium UI components from the 21st.dev Magic MCP library to enrich your sites.',
    color: 'from-fuchsia-500/20 to-fuchsia-600/5',
    border: 'border-fuchsia-500/20',
  },
  {
    icon: '◉',
    title: 'Bilingual FR / EN',
    description: 'Full interface and site generation available in French and English according to your preference.',
    color: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/20',
  },
  {
    icon: '◎',
    title: 'Full history',
    description: 'Find, edit and re-download all your previously created sites from your personal dashboard.',
    color: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20',
  },
]

interface FeaturesSectionProps {
  locale?: 'fr' | 'en'
}

export default function FeaturesSection({ locale = 'fr' }: FeaturesSectionProps) {
  const features = locale === 'fr' ? FEATURES_FR : FEATURES_EN

  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,109,250,0.08)_0%,transparent_60%)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 border border-violet-500/20">
            <span className="text-sm text-violet-300 font-medium">
              {locale === 'fr' ? 'Fonctionnalités' : 'Features'}
            </span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-6">
            {locale === 'fr' ? 'Tout ce dont vous' : 'Everything you'}<br />
            <span className="gradient-text">{locale === 'fr' ? 'avez besoin' : 'need'}</span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Des outils puissants pour créer, modifier et déployer vos sites web en un instant.'
              : 'Powerful tools to create, edit and deploy your websites in an instant.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group glass rounded-2xl p-6 border ${feature.border} bg-gradient-to-br ${feature.color} hover:border-violet-400/30 transition-all duration-300 cursor-default`}
            >
              <div className="text-2xl mb-4 text-violet-400 font-mono">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import AuroraBackground from '@/components/ui/AuroraBackground'
import GlassCard from '@/components/ui/GlassCard'

interface Article {
  tag: string
  title: string
  date: string
  readTime: string
  paragraphs: { heading?: string; text: string; list?: string[] }[]
}

const ARTICLES: Record<string, Article> = {
  'creer-site-web-ia-30-secondes': {
    tag: 'Guide',
    title: "Comment créer un site web professionnel en 30 secondes avec l'IA",
    date: '12 mai 2025',
    readTime: '4 min',
    paragraphs: [
      { text: "Créer un site web a longtemps rimé avec semaines de développement, milliers d'euros d'agence ou heures passées sur des constructeurs limités. CreateIt change la donne : en décrivant votre projet en une phrase, vous obtenez un site complet — structure, contenu, design — en moins de 30 secondes." },
      { heading: "1. Décrivez votre projet en une phrase", text: "La clé : être précis sans être exhaustif. « Un restaurant gastronomique à Paris avec menu dégustation et réservation en ligne » est un bon prompt. « Un site » ne l'est pas. Plus vous donnez de contexte (secteur, ton, fonctionnalités clés), plus le résultat sera pertinent." },
      { heading: "2. Laissez l'IA travailler", text: "En coulisses, le modèle génère simultanément la structure de la page, le contenu rédactionnel adapté à votre secteur et un design cohérent. Tout ça en quelques secondes." },
      { heading: "3. Finalisez avec l'éditeur visuel", text: "Le site généré est un point de départ, pas une fin. L'éditeur intégré vous permet de modifier textes, images et couleurs directement sur la page, sans toucher au code. Quand vous êtes satisfait, exportez en HTML/CSS/JS propre." },
      { heading: "Résultat", text: "Un site professionnel, exportable, hébergeable partout — en moins de temps qu'il n'en faut pour envoyer un email à une agence." },
    ],
  },
  'freelance-multiplier-projets-ia': {
    tag: 'Freelance',
    title: "Freelance : multipliez vos projets grâce à la génération de sites par IA",
    date: '5 mai 2025',
    readTime: '6 min',
    paragraphs: [
      { text: "En tant que freelance, votre temps est votre ressource la plus précieuse. Chaque heure passée à coder un header générique est une heure que vous ne passez pas à conseiller votre client ou à prospecter." },
      { heading: "Le problème du freelance web", text: "Un projet de site vitrine classique prend en moyenne 2 à 3 semaines : brief, maquette, développement, recettes, corrections. Pour chaque projet, vous repartez de zéro — même pour des sections identiques d'un client à l'autre." },
      { heading: "La méthode CreateIt", text: "Générez le premier draft complet en 30 secondes à partir du brief client. Passez ensuite votre temps sur ce qui apporte de la valeur : personnalisation, conseil, optimisation." },
      { heading: "En chiffres", text: "Ce que ça change concrètement :", list: ["Draft initial : 30 secondes vs 3-5 heures", "Contenu rédactionnel : inclus dans la génération", "Corrections client : sur l'éditeur visuel, en direct"] },
      { text: "Résultat : certains freelances livrent 3× plus de projets par mois, sans travailler plus." },
    ],
  },
  'prompt-parfait-site-web': {
    tag: 'Tutoriel',
    title: 'Écrire le prompt parfait pour générer votre site web idéal',
    date: '28 avril 2025',
    readTime: '5 min',
    paragraphs: [
      { text: "La qualité du site généré dépend directement de la qualité de votre description. Voici les formules qui donnent systématiquement les meilleurs résultats." },
      { heading: "La structure d'un bon prompt", text: "[Type de site] + [secteur/activité] + [localisation si pertinente] + [fonctionnalités clés] + [ton souhaité]" },
      { heading: "Exemples concrets", text: "Ce qui fonctionne bien :", list: ["Un cabinet d'architecte parisien avec galerie de projets, présentation de l'équipe et formulaire de contact", "Une landing page SaaS pour un outil de gestion de projet, ton moderne, avec pricing et FAQ"] },
      { heading: "Ce qu'il faut éviter", text: "Les prompts trop vagues donnent des résultats génériques. Les prompts trop longs diluent les informations importantes. Visez 1 à 3 phrases bien construites." },
    ],
  },
  'agence-web-ia-workflow': {
    tag: 'Agence',
    title: "Comment les agences web intègrent l'IA dans leur workflow de production",
    date: '20 avril 2025',
    readTime: '7 min',
    paragraphs: [
      { text: "La génération de sites par IA ne remplace pas les agences — elle leur permet de faire plus, plus vite, avec la même équipe." },
      { heading: "Phase de pitch : impressionnez en réunion", text: "Générez 3 directions créatives différentes pour un même client, en direct pendant la réunion de brief. Là où une agence traditionnelle revient une semaine plus tard avec des maquettes Figma, vous montrez du concret immédiatement." },
      { heading: "Phase de production : le draft instantané", text: "Le brief client devient un prompt. Le premier draft sort en 30 secondes. L'équipe passe son énergie sur la personnalisation fine, les animations, l'optimisation SEO, l'intégration CMS." },
      { heading: "Résultats observés", text: "Ce que les agences constatent :", list: ["Temps de production réduit de 40 à 60 %", "Capacité à prendre plus de projets simultanément", "Satisfaction client en hausse (livraison plus rapide)"] },
    ],
  },
  'exporter-site-heberger-partout': {
    tag: 'Guide',
    title: "Exporter son site CreateIt et l'héberger n'importe où",
    date: '14 avril 2025',
    readTime: '5 min',
    paragraphs: [
      { text: "Le code généré par CreateIt vous appartient à 100 %. Pas de lock-in, pas de plateforme propriétaire obligatoire." },
      { heading: "Exporter votre site", text: "Depuis votre dashboard, cliquez sur « Exporter » sur n'importe quel site. Vous téléchargez un ZIP contenant des fichiers HTML, CSS et JS propres, sans dépendances propriétaires." },
      { heading: "Options d'hébergement", text: "Les solutions disponibles :", list: ["Netlify — glissez-déposez le dossier, en ligne en 10 secondes", "Vercel — connectez votre repo Git, déploiement automatique", "GitHub Pages — gratuit, idéal pour les portfolios", "Votre propre serveur — copiez les fichiers via FTP/SFTP"] },
      { heading: "Modifier le code après export", text: "Le code est lisible et bien structuré. Ouvrez-le dans VS Code, modifiez ce que vous voulez. C'est du HTML/CSS/JS standard." },
    ],
  },
  'entrepreneur-landing-page-rapide': {
    tag: 'Entrepreneur',
    title: "Lancer une landing page en une heure : le guide de l'entrepreneur pressé",
    date: '7 avril 2025',
    readTime: '4 min',
    paragraphs: [
      { text: "Vous avez une idée. Vous voulez valider avant d'investir. Voici comment avoir une landing page professionnelle en ligne en moins d'une heure, sans dev et sans agence." },
      { heading: "Étape 1 — Le prompt (5 minutes)", text: "Décrivez votre produit ou service en 2-3 phrases. Précisez le problème que vous résolvez, pour qui, et ce que vous proposez. Ce brief devient votre prompt de génération." },
      { heading: "Étape 2 — Générer et affiner (15 minutes)", text: "Lancez la génération. Parcourez le résultat et affinez les textes directement dans l'éditeur. Remplacez les images placeholder par vos photos." },
      { heading: "Étape 3 — Mettre en ligne (20 minutes)", text: "Exportez le site, créez un compte Netlify gratuit, glissez-déposez le dossier. Votre site est en ligne sur une URL en *.netlify.app. Pointez ensuite votre domaine si vous en avez un." },
      { heading: "Étape 4 — Mesurer", text: "Ajoutez un formulaire de capture email ou un bouton « Rejoindre la bêta ». Mesurez les conversions avant d'investir dans la V2." },
    ],
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(ARTICLES).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = ARTICLES[slug]
  if (!article) return { title: 'Blog — CreateIt' }
  return {
    title: `${article.title} — CreateIt Blog`,
    description: `Lisez l'article : ${article.title}`,
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const article = ARTICLES[slug]
  if (!article) notFound()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />

      <AuroraBackground intensity="subtle" className="pt-[60px]">
        <section className="max-w-2xl mx-auto px-5 py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
            style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Retour au blog
          </Link>

          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block mb-4"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            {article.tag}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--fg)' }}>
            {article.title}
          </h1>
          <p className="text-sm" style={{ color: 'var(--fg-subtle)' }}>
            {article.date} · {article.readTime} de lecture
          </p>
        </section>
      </AuroraBackground>

      <section className="max-w-2xl mx-auto px-5 pb-20">
        <GlassCard className="p-8 sm:p-10">
          <div className="flex flex-col gap-6" style={{ color: 'var(--fg-muted)', fontSize: '1rem', lineHeight: '1.75' }}>
            {article.paragraphs.map((block, i) => (
              <div key={i}>
                {block.heading && (
                  <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>{block.heading}</h2>
                )}
                <p>{block.text}</p>
                {block.list && (
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {block.list.map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <PublicFooter />
    </div>
  )
}

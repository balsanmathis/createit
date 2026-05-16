import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWebsiteStreaming } from '@/lib/claude'
import { TOKEN_COST_GENERATE, PLAN_TOKEN_LIMITS } from '@/types'

export const maxDuration = 300

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

const ULTRA_SYSTEM_PROMPT = `RÈGLE NUMÉRO 1 ABSOLUE : Tu DOIS terminer par </body></html>. Si tu manques de place, raccourcis CHAQUE section mais termine TOUJOURS le fichier HTML. Un fichier incomplet est un ÉCHEC total.

Tu es un développeur web senior freelance français avec 12 ans d'expérience. Pour cette mission, le client veut un site EXCEPTIONNEL — qualité maximale digne d'une agence haut de gamme parisienne. Tu mets le paquet : animations CSS élaborées, micro-interactions sur chaque élément interactif, contenu ultra-détaillé et réaliste, sections très développées. C'est ta plus belle réalisation.

COMPORTEMENT HUMAIN DANS LE CODE :
- Utilise des commentaires naturels et courts comme un vrai dev : /* Hero section */, // smooth scroll, /* Mobile nav */
- Varie légèrement les approches (parfois padding, parfois margin, pas de pattern robotique identique partout)
- Quelques petites imperfections volontaires : une variable CSS nommée différemment, un commentaire en anglais au milieu du français
- Utilise des vraies valeurs CSS comme un humain : 47px au lieu de 50px, #1a1a2e au lieu de #000000
- Mélange légèrement les conventions : parfois camelCase, parfois kebab-case dans les classes CSS

DESIGN QUI PARAÎT HUMAIN :
- Chaque site doit avoir une identité UNIQUE et reconnaissable
- Choisis une direction artistique forte selon le secteur :
  * Restaurant haut de gamme : noir profond, or, serif élégant, beaucoup d'espace
  * Tech startup : très sombre, néons, grid, monospace
  * Artisan local : chaleureux, couleurs terre, photos en pleine page
  * Cabinet médical : blanc épuré, bleu confiance, minimalisme
  * Coach sportif : énergie, noir/orange, typographie impactante
- Les couleurs doivent être choisies avec intention, pas au hasard
- La typographie doit être cohérente et avoir du caractère

NIVEAU ESTHÉTIQUE SUPÉRIEUR :

Typographie avancée :
- Utilise clamp() pour les font-sizes fluides : clamp(2rem, 5vw, 4rem)
- Letter-spacing négatif sur les grands titres : letter-spacing: -0.03em
- Line-height serré sur les titres display : line-height: 1.05
- Contraste fort entre taille des titres et du body
- Hiérarchie visuelle claire : titre display très grand, sous-titre moyen, body petit

Espacement premium :
- Sections avec padding vertical généreux : min 100px desktop, 60px mobile
- Grilles asymétriques quand c'est pertinent (60/40 au lieu de 50/50)
- Utilise des gaps importants entre les éléments : gap: 48px minimum sur les grids
- Beaucoup d'espace négatif — ne pas remplir tous les espaces

Détails visuels qui font la différence :
- Bordures subtiles : 1px solid rgba(0,0,0,0.08) ou rgba(255,255,255,0.08)
- Box-shadows douces et réalistes : 0 4px 24px rgba(0,0,0,0.08), jamais de shadows dures
- Border-radius cohérent sur tout le site : choisir 4px, 8px, 12px ou 16px et s'y tenir
- Gradients subtils sur les fonds de sections : pas criards, juste une légère variation
- Overlays sur les images placeholder : gradient du bas vers le haut pour lisibilité du texte

Animations qui impressionnent sans être lourdes :
- Reveal au scroll : opacity 0 → 1 + translateY(24px) → 0, duration 0.5s ease-out
- Stagger sur les cards : chaque card avec un délai de 0.1s supplémentaire
- Hover sur les boutons CTA : background-position change sur un gradient (shimmer effect)
- Underline animé sur les liens nav : pseudo-element width 0 → 100% au hover
- Cards avec très légère rotation au hover : rotate(0.5deg) + translateY(-4px)

Placeholders image premium :
- Jamais de rectangle gris uni — toujours un dégradé avec direction et couleurs cohérentes avec la palette
- Ajoute des formes géométriques CSS dans les placeholders (cercles, lignes diagonales) pour simuler une composition
- Les ratios d'image doivent être cohérents : 16/9 pour les héros, 4/3 pour les cards, 1/1 pour les avatars
- Ajoute un overlay semi-transparent avec le nom du projet/produit centré

Section hero premium :
- Toujours une accroche en 2 lignes maximum, très impactante
- Un sous-titre court et précis (max 15 mots)
- 1 ou 2 boutons CTA maximum
- Une stat ou social proof discrète en dessous : "Trusted by 200+ clients" ou "Note 4.9/5"
- Un élément décoratif CSS subtil : ligne, forme géométrique, ou pattern en fond

Navbar premium :
- Logo avec un détail qui le rend unique (point coloré, underscore, slash)
- Liens avec espacement généreux : gap: 40px minimum
- Bouton CTA dans la navbar avec style distinct du reste
- Scroll indicator : fine ligne de progression en haut de page qui suit le scroll

Footer premium :
- Toujours sombre même si le site est clair (contraste fort)
- Tagline du business en grande typographie
- Séparation claire entre colonnes de liens
- Copyright discret en très petit

CONTENU QUI PARAÎT RÉEL :
- Invente des vrais noms français naturels (pas "Jean Dupont" mais "Marc Vidal", "Sophie Renard")
- Des vraies adresses dans la bonne ville (vérifie que la rue existe approximativement)
- Des prix réalistes selon le marché français 2024
- Des témoignages qui sonnent vrai, avec des détails spécifiques
- Des descriptions de services précises et professionnelles, pas génériques
- Des horaires qui ont du sens selon le type de business

TECHNIQUE QUI PARAÎT HUMAIN :
- Zero framework, zero CDN — du CSS et JS vanilla pur
- System fonts : -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Variables CSS au début : :root { --primary: ...; --text: ...; }
- Animations CSS subtiles et bien dosées — pas trop, pas trop peu
- Le JS doit être simple, direct, sans over-engineering
- Responsive naturel avec quelques media queries bien placées
- Les transitions doivent être à 0.2s-0.3s, pas toutes pareilles

QUALITÉ FINALE :
- Le site doit pouvoir être montré à un client sans que personne ne devine qu'une machine l'a fait
- Chaque site doit sembler avoir été designé spécifiquement pour CE client
- Un développeur humain qui verrait le code devrait dire 'c'est propre'
- TOUJOURS terminer par </body></html>
- Si manque de place : raccourcir le contenu mais garder TOUTES les sections
- JAMAIS de lorem ipsum`

const QUALITY_CONFIG: Record<string, { maxTokens: number; tokenCost: number; systemPrompt?: string }> = {
  rapide:   { maxTokens: 4_000,  tokenCost: 1 * TOKEN_COST_GENERATE },
  standard: { maxTokens: 8_000,  tokenCost: 2 * TOKEN_COST_GENERATE },
  premium:  { maxTokens: 16_000, tokenCost: 4 * TOKEN_COST_GENERATE },
  ultra:    { maxTokens: 32_000, tokenCost: 8 * TOKEN_COST_GENERATE, systemPrompt: ULTRA_SYSTEM_PROMPT },
}

export async function POST(request: Request) {
  // Auth check first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Parse body early (quality affects token cost check)
  const body = await request.json()
  const { prompt, name, quality = 'standard' } = body

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 })
  }

  const qualityConfig = QUALITY_CONFIG[quality] ?? QUALITY_CONFIG['standard']
  const isAdmin = user.email === ADMIN_EMAIL

  if (!isAdmin) {
    const { data: profile } = await supabase
      .from('users')
      .select('tokens_used, tokens_limit, plan')
      .eq('id', user.id)
      .single()

    const tokensUsed  = profile?.tokens_used  ?? 0
    const tokensLimit = profile?.tokens_limit ?? PLAN_TOKEN_LIMITS.free
    const plan        = profile?.plan         ?? 'free'

    if (tokensUsed + qualityConfig.tokenCost > tokensLimit) {
      const isPaidPlan = plan !== 'free' && plan !== null
      const error = isPaidPlan
        ? `Tokens insuffisants. Vous avez utilisé ${tokensUsed.toLocaleString()}/${tokensLimit.toLocaleString()} tokens ce mois.`
        : 'Vous avez épuisé vos tokens gratuits. Choisissez un plan pour continuer.'
      return NextResponse.json({ error, needsUpgrade: true }, { status: 403 })
    }
  }

  const userId   = user.id
  const siteName = name || `Site ${new Date().toLocaleDateString('fr-FR')}`

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch { /* client disconnected */ }
      }

      try {
        // 1. Generate HTML
        const htmlContent = await generateWebsiteStreaming(prompt.trim(), (chars) => {
          emit({ type: 'progress', chars })
        }, {
          maxTokens: qualityConfig.maxTokens,
          systemPrompt: qualityConfig.systemPrompt,
        })

        console.log(`[generate] HTML ready — ${htmlContent.length} chars, quality=${quality}, saving…`)

        // 2. Save to Supabase
        const { data: site, error: siteError } = await supabase
          .from('sites')
          .insert({
            user_id: userId,
            name: siteName,
            prompt: prompt.trim(),
            html_content: htmlContent,
          })
          .select('id')
          .single()

        if (siteError) {
          console.error('[generate] Supabase insert error:', siteError)
          emit({ type: 'error', message: 'Erreur lors de la sauvegarde du site.' })
          controller.close()
          return
        }

        console.log(`[generate] Site saved — id=${site.id}`)

        // 3. Deduct tokens
        if (!isAdmin) {
          const { error: rpcError } = await supabase.rpc('increment_tokens_used', {
            user_id: userId,
            amount: qualityConfig.tokenCost,
          })
          if (rpcError) {
            const { data: current } = await supabase
              .from('users')
              .select('tokens_used')
              .eq('id', userId)
              .single()
            await supabase
              .from('users')
              .update({ tokens_used: (current?.tokens_used ?? 0) + qualityConfig.tokenCost })
              .eq('id', userId)
          }
        }

        emit({ type: 'done', siteId: site.id })
        controller.close()
      } catch (err) {
        console.error('[generate] Unexpected error:', err)
        emit({ type: 'error', message: 'Erreur lors de la génération.' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWebsiteStreaming } from '@/lib/claude'
import { TOKEN_COST_GENERATE, PLAN_TOKEN_LIMITS } from '@/types'

export const maxDuration = 300

// In-process rate limiter — per-instance (use Redis for distributed production)
const rlMap = new Map<string, number[]>()
function isRateLimited(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now()
  const prev = (rlMap.get(ip) ?? []).filter(t => now - t < windowMs)
  if (prev.length >= limit) return true
  rlMap.set(ip, [...prev, now])
  return false
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

const ULTRA_SYSTEM_PROMPT = `RÈGLE NUMÉRO 1 ABSOLUE : Tu DOIS terminer par </body></html>. Si tu manques de place, raccourcis CHAQUE section mais termine TOUJOURS le fichier HTML. Un fichier incomplet est un ÉCHEC total.

Tu es un développeur web senior freelance français avec 12 ans d'expérience. Pour cette mission, le client veut un site EXCEPTIONNEL — qualité maximale digne d'une agence haut de gamme parisienne. Tu livres des sites photo-first, immersifs, avec du texte directement sur les images.

APPROCHE PHOTO-FIRST OBLIGATOIRE :
Le principe central : les images sont des FONDS DE SECTIONS, pas des éléments dans des cards sur fond blanc. Le texte est posé DIRECTEMENT sur la photo avec un overlay coloré. C'est ainsi que fonctionnent tous les grands sites professionnels.

PATTERN CSS OBLIGATOIRE — hero (à utiliser systématiquement) :
.hero {
  position: relative;
  min-height: 100vh;
  background: url('IMAGE_URL') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.52); /* adapter selon secteur */
}
.hero-content {
  position: relative;
  z-index: 1;
  color: #fff;
  text-align: center;
  max-width: 800px;
  padding: 0 24px;
}

PATTERN CSS — section avec image de fond :
.section-photo {
  position: relative;
  padding: 120px 0;
  background: url('IMAGE_URL') center/cover no-repeat;
}
.section-photo::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%);
}
.section-photo .inner {
  position: relative;
  z-index: 1;
  color: #fff;
}

OVERLAY PAR SECTEUR — choisis selon le prompt :
- Restaurant gastronomique : rgba(8,5,2,0.62) ou linear-gradient(160deg,rgba(8,5,2,.72),rgba(8,5,2,.48))
- Restaurant/pizzeria casual : rgba(18,5,5,0.72), accent rouge #C53030
- Architecture/design : rgba(15,15,15,0.38) — très léger, laisser voir la photo
- Agence digitale/marketing : linear-gradient(135deg,rgba(76,29,149,.85),rgba(30,64,175,.82))
- Startup tech/SaaS : rgba(10,12,20,0.80), accent cyan #22D3EE
- Boutique artisanale : rgba(58,28,8,0.60), tons beige chauds
- Bijoux/luxe : rgba(5,3,1,0.88), accents dorés #C69B3C
- Photographe/portfolio créatif : rgba(0,0,0,0.18) — quasi transparent
- Cabinet médical/santé : rgba(3,53,100,0.76), bleu confiance
- Coach sportif/fitness : rgba(5,5,5,0.70), accent vert #16A34A
- Blog/voyage/lifestyle : rgba(0,0,0,0.30) léger

STRUCTURE ATTENDUE — au moins 4 sections avec images en fond :
1. Navbar fixe : fond transparent par-dessus l'image hero, devient semi-opaque au scroll
2. Hero (100vh) : background-image + overlay + titre accrocheur centré + CTA + social proof discrète
3. Section services ou à propos : autre image en fond, overlay différent, texte par-dessus
4. Section témoignages/stats : fond sombre uni (contraste avec sections photo)
5. Section CTA finale : encore une image en fond, overlay fort
6. Footer : fond très sombre #0a0a0a, tagline large, colonnes liens

NAVBAR PHOTO-FIRST :
- Position fixed, z-index 1000
- Fond au départ transparent (par-dessus l'image hero)
- Au scroll : fond semi-opaque rgba(0,0,0,0.85) ou couleur sombre de la palette
- Texte et liens en blanc
- Transition smooth 0.3s
- Logo avec un détail unique (point coloré, underscore, slash)
- Bouton CTA dans la navbar avec style distinct

IMAGES RÉELLES OBLIGATOIRES — background-image CSS :
Utilise TOUJOURS background-image CSS avec ces URLs Unsplash selon le secteur :
- Restaurant gastronomique : background-image: url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80')
- Sushi/japonais : background-image: url('https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1400&q=80')
- Nourriture générale : background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=80')
- Intérieur restaurant : background-image: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80')
- Bureau/agence : background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80')
- Architecture/immobilier : background-image: url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80')
- Fitness/sport : background-image: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80')
- Médecin/santé : background-image: url('https://images.unsplash.com/photo-1551076805-e1869033e561?w=1400&q=80')
- Avocat/cabinet : background-image: url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80')
- Coiffeur/beauté : background-image: url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80')
- Tech/startup/code : background-image: url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&q=80')
- Café/barista : background-image: url('https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1400&q=80')
- Boutique/retail : background-image: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80')
- Voyage/hôtel : background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80')

Pour les avatars témoignages : https://i.pravatar.cc/150?img=[1-70]
JAMAIS de div CSS comme placeholder — TOUJOURS background-image CSS

NIVEAU ESTHÉTIQUE SUPÉRIEUR :

Typographie avancée :
- clamp() pour les font-sizes fluides : clamp(2rem, 5vw, 4rem)
- Letter-spacing négatif sur les grands titres : letter-spacing: -0.03em
- Line-height serré sur les titres display : line-height: 1.05
- Hiérarchie visuelle claire : titre display très grand, sous-titre moyen, body petit

Animations qui impressionnent :
- Reveal au scroll : opacity 0 → 1 + translateY(24px) → 0, duration 0.5s ease-out
- Stagger sur les cards : chaque card avec un délai de 0.1s supplémentaire
- Hover sur les boutons CTA : shimmer effect ou légère transformation
- Cards avec très légère rotation au hover : rotate(0.5deg) + translateY(-4px)

COMPORTEMENT HUMAIN DANS LE CODE :
- Commentaires courts et naturels : /* Hero */, // scroll reveal, /* CTA section */
- Valeurs CSS humaines : 47px, #1a1a2e, gap: 38px
- Variables CSS en début de fichier : :root { --accent: ...; --dark: ...; }

DESIGN PAR SECTEUR — direction artistique forte :
- Restaurant gastronomique : typo serif Georgia/Times, lettre-spacing négatif, or
- Startup tech : monospace pour accents, grid, dégradés sombres bleu/violet
- Artisan local : chaleureux, fonts system, espaces généreux, brun/beige
- Cabinet médical : propre, lisible, bleu, sans-serif
- Coach sportif : bold 900, impact typographique, dark + accent coloré

CONTENU RÉEL :
- Vrais noms français (Marc Vidal, Sophie Renard, pas Jean Dupont)
- Vraies adresses plausibles dans la ville
- Prix réalistes marché 2024
- Témoignages spécifiques, pas génériques
- Horaires logiques selon le business

TECHNIQUE :
- Zero framework, CSS + JS vanilla pur
- System fonts sauf si serif nécessaire (Georgia pour luxe)
- Animations reveal scroll : opacity 0→1 + translateY(20px)→0
- Responsive : un seul breakpoint 768px suffit
- JAMAIS de lorem ipsum
- JAMAIS de div comme image placeholder — TOUJOURS background-image CSS

QUALITÉ FINALE :
- Le site doit faire WOW dès le premier scroll
- Un dev humain qui verrait le code dirait "c'est propre et professionnel"
- Le site doit pouvoir être montré à un client sans que personne ne devine qu'une machine l'a fait
- TOUJOURS terminer par </body></html>`

const QUALITY_CONFIG: Record<string, { maxTokens: number; tokenCost: number; systemPrompt?: string }> = {
  rapide:   { maxTokens: 4_000,  tokenCost: 1 * TOKEN_COST_GENERATE },
  standard: { maxTokens: 8_000,  tokenCost: 2 * TOKEN_COST_GENERATE },
  premium:  { maxTokens: 16_000, tokenCost: 4 * TOKEN_COST_GENERATE },
  ultra:    { maxTokens: 32_000, tokenCost: 8 * TOKEN_COST_GENERATE, systemPrompt: ULTRA_SYSTEM_PROMPT },
}

export async function POST(request: Request) {
  // Rate limiting
  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans une minute.' }, { status: 429 })
  }

  // Auth check first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Parse + validate body
  const body = await request.json()
  const { prompt, name, quality = 'standard' } = body

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 })
  }
  if (typeof prompt !== 'string' || prompt.trim().length > 2000) {
    return NextResponse.json({ error: 'Le prompt ne peut pas dépasser 2000 caractères' }, { status: 400 })
  }
  if (name && typeof name !== 'string') {
    return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
  }

  const sanitizedPrompt = prompt.trim()
  const sanitizedName = (name ?? '').trim().slice(0, 200)

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
  const siteName = sanitizedName || `Site ${new Date().toLocaleDateString('fr-FR')}`

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
        const htmlContent = await generateWebsiteStreaming(sanitizedPrompt, (chars) => {
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

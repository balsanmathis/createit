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

const ULTRA_SYSTEM_PROMPT = `Tu es un développeur web senior. Tu crées des sites HTML5 en UN SEUL fichier qui sont 100% interactifs et fonctionnels.

RÈGLE NUMÉRO 1 — INTERACTIVITÉ TOTALE :
Chaque élément cliquable DOIT faire quelque chose. INTERDIT de laisser un bouton ou lien sans action.

SYSTÈME DE NAVIGATION INTERNE OBLIGATOIRE :
Le site doit se comporter comme un vrai site multi-pages grâce à ce système JavaScript :

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
  window.scrollTo(0, 0);
}
document.addEventListener('DOMContentLoaded', () => showPage('page-home'));

STRUCTURE DU SITE — PAGES VIRTUELLES :
Crée plusieurs divs avec class='page' et id unique :
- id='page-home' : Page d'accueil avec hero, aperçu services, témoignages
- id='page-services' : Page services complète avec détails et prix
- id='page-about' : Page à propos avec histoire, équipe, valeurs
- id='page-gallery' : Page galerie avec toutes les photos
- id='page-contact' : Page contact avec formulaire complet et infos

NAVBAR INTERACTIVE :
Logo à gauche + liens onclick :
  onclick="showPage('page-home')" | onclick="showPage('page-services')" | onclick="showPage('page-about')" | onclick="showPage('page-gallery')" | onclick="showPage('page-contact')"
Bouton CTA navbar → onclick="showPage('page-contact')"
Style : position fixed, transparent → fond sombre au scroll (window.scrollY > 60)

BOUTONS INTERACTIFS OBLIGATOIRES sur chaque page :
- 'Réserver' / 'Prendre RDV' → showPage('page-contact')
- 'Nos services' → showPage('page-services')
- 'En savoir plus' → showPage('page-about')
- 'Voir la galerie' → showPage('page-gallery')
- 'Nous contacter' → showPage('page-contact')
- Bouton 'Retour accueil' sur chaque sous-page → showPage('page-home')
- Cards de services → onclick ouvre un modal avec détails complets
- Photos de galerie → onclick ouvre lightbox

MODALS DE SERVICES :
Chaque card de service a un onclick qui affiche un modal :
- Photo, description complète, prix détaillés
- Bouton 'Réserver' → showPage('page-contact'); closeModal()
- Bouton fermer (×) et clic sur overlay → closeModal()

function openModal(id) { document.getElementById(id).style.display='flex'; document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id).style.display='none'; document.body.style.overflow=''; }

LIGHTBOX GALERIE :
function openLightbox(src, caption) {
  document.getElementById('lightbox').style.display='flex';
  document.getElementById('lightbox-img').src=src;
  document.getElementById('lightbox-caption').textContent=caption;
}
function closeLightbox() { document.getElementById('lightbox').style.display='none'; }
Structure lightbox : div id='lightbox' fixé plein écran, image centrée, caption, bouton ×

FORMULAIRE DE CONTACT INTERACTIF :
- Validation temps réel : champ vide → border rouge, valide → border verte
- Email invalide → message 'Format email invalide'
- Téléphone → autoformat XX XX XX XX XX
- Submit : animation loading 1.5s puis message :
  'Merci [Prénom] ! Nous vous recontactons sous 24h à [email] ✓'
- Bouton submit disabled pendant le loading

FAQ ACCORDÉON (sur page-services ou page-home) :
function toggleFaq(el) {
  const ans = el.nextElementSibling;
  ans.style.display = ans.style.display==='block' ? 'none' : 'block';
  el.querySelector('.faq-icon').textContent = ans.style.display==='block' ? '−' : '+';
}

ANIMATIONS :
- IntersectionObserver : opacity 0→1 + translateY(20px)→0 sur chaque section au premier affichage
- Boutons : hover scale(1.02), active scale(0.98)
- Cards : hover translateY(-4px) + box-shadow renforcée
- Images galerie : hover scale(1.05) avec overflow:hidden sur le conteneur
- Compteurs animés sur les stats (ex: 0→150 clients en 1.5s)

IMAGES OBLIGATOIRES — URLs Unsplash à utiliser :
RESTAURANTS : hero=https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80 | plat=https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80 | table=https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80 | chef=https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80
AGENCES : hero=https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80 | équipe=https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80
IMMOBILIER : hero=https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80 | intérieur=https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80 | villa=https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80
BEAUTÉ : hero=https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80 | soin=https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80
FITNESS : hero=https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80
ARCHITECTURE : hero=https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80
SANTÉ : hero=https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80
BOUTIQUE : hero=https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80
TECH : hero=https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=80
PERSONNES avatars : f1=https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80 | f2=https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80 | h1=https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80 | h2=https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80

CSS DE BASE OBLIGATOIRE :
:root { --accent:[couleur secteur]; --dark:#0d0d0d; }
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { font-family:system-ui,sans-serif; }
.page { display:none; }
nav { position:fixed; top:0; width:100%; z-index:1000; display:flex; align-items:center; justify-content:space-between; padding:0 5%; height:64px; transition:background .3s; }
nav button, nav a { cursor:pointer; background:none; border:none; color:#fff; font-weight:500; text-decoration:none; }
.hero { height:100vh; position:relative; display:flex; align-items:center; justify-content:center; background:url('IMAGE') center/cover; }
.hero::before { content:''; position:absolute; inset:0; background:rgba(0,0,0,.55); }
.hero-inner { position:relative; z-index:1; color:#fff; text-align:center; }
.modal { display:none; position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:2000; align-items:center; justify-content:center; }
#lightbox { display:none; position:fixed; inset:0; background:rgba(0,0,0,.9); z-index:3000; align-items:center; justify-content:center; flex-direction:column; }

CONTENU RÉEL OBLIGATOIRE :
- Noms français réalistes, adresses plausibles, prix marché 2024
- Témoignages spécifiques (pas génériques)
- JAMAIS lorem ipsum
- Minimum 3 services avec vrais prix
- Minimum 4 photos en galerie
- Minimum 3 témoignages avec avatars

RÈGLE FINALE : Si manque de tokens, réduire le contenu textuel MAIS conserver TOUTES les pages virtuelles, TOUS les modals, et TOUTE l'interactivité. Finit TOUJOURS par </body></html>`

const HAIKU = 'claude-haiku-4-5-20251001'

// Haiku output: $4/1M tokens. Budget per tier (max $0.20/site):
//   rapide  : 10k tokens → ~$0.04   (fast, landing page)
//   standard: 20k tokens → ~$0.08   (site complet)
//   premium : 32k tokens → ~$0.13   (site riche + galerie)
//   ultra   : 46k tokens → ~$0.19   (site de qualité agence)
const QUALITY_CONFIG: Record<string, { maxTokens: number; tokenCost: number; model: string; systemPrompt?: string }> = {
  rapide:   { maxTokens: 10_000, tokenCost: 1 * TOKEN_COST_GENERATE, model: HAIKU },
  standard: { maxTokens: 20_000, tokenCost: 2 * TOKEN_COST_GENERATE, model: HAIKU },
  premium:  { maxTokens: 32_000, tokenCost: 4 * TOKEN_COST_GENERATE, model: HAIKU },
  ultra:    { maxTokens: 46_000, tokenCost: 8 * TOKEN_COST_GENERATE, model: HAIKU, systemPrompt: ULTRA_SYSTEM_PROMPT },
}

export async function POST(request: Request) {
  // Honeypot: silently absorb bot requests
  if (request.headers.get('x-honeypot')) {
    return NextResponse.json({ ok: true })
  }

  // Parse + validate body early (before auth, so clients get meaningful errors)
  const body = await request.json()
  const { prompt, name, quality = 'standard' } = body

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 })
  }
  if (typeof prompt !== 'string' || prompt.trim().length > 5000) {
    return NextResponse.json({ error: 'Le prompt ne peut pas dépasser 5000 caractères' }, { status: 400 })
  }
  if (name && typeof name !== 'string') {
    return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
  }

  // Rate limiting
  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  if (isRateLimited(ip, 5)) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans une minute.' }, { status: 429 })
  }

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
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
          model: qualityConfig.model,
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

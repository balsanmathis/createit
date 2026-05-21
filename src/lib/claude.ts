import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Tu es un développeur web senior. Tu crées des sites HTML5 en UN SEUL fichier qui sont 100% interactifs et fonctionnels.

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

export interface GenerateOptions {
  maxTokens?: number
  systemPrompt?: string
  model?: string
  timeoutMs?: number
}

const MODEL_HAIKU  = 'claude-haiku-4-5-20251001'
const MODEL_SONNET = 'claude-sonnet-4-6'

function stripFences(text: string): string {
  let t = text.trim()
  if (t.startsWith('```html')) t = t.slice(7)
  else if (t.startsWith('```')) t = t.slice(3)
  if (t.endsWith('```')) t = t.slice(0, -3)
  return t.trim()
}

function isClosed(html: string): boolean {
  return /<\/html>/i.test(html)
}

function forceClose(html: string): string {
  if (isClosed(html)) return html

  let result = html

  const styleOpens  = (result.match(/<style[^>]*>/gi)  || []).length
  const styleCloses = (result.match(/<\/style>/gi)      || []).length
  if (styleOpens > styleCloses) result += '\n}</style>'

  const scriptOpens  = (result.match(/<script[^>]*>/gi)  || []).length
  const scriptCloses = (result.match(/<\/script>/gi)      || []).length
  if (scriptOpens > scriptCloses) result += '\n}</script>'

  const hasBodyOpen  = /<body[\s>]/i.test(result)
  const hasBodyClose = /<\/body>/i.test(result)

  if (!hasBodyOpen) {
    if (!/<\/head>/i.test(result)) result += '\n</head>'
    result += '\n<body style="font-family:system-ui,sans-serif;padding:2rem">'
    result += '\n<p style="color:#666">Site partiellement généré. Relancez la génération pour un résultat complet.</p>'
    result += '\n</body>'
  } else if (!hasBodyClose) {
    result += '\n</body>'
  }

  result += '\n</html>'
  return result
}

// Build a targeted continuation message based on current HTML state
function getContinueMsg(html: string): string {
  const tail = html.slice(-300)
  const hasBody = /<body[\s>]/i.test(html)

  if (!hasBody) {
    // Model is stuck in <head>/<style> — force it past that
    return `Tu générais un site HTML mais tu n'as pas encore écrit <body>. Contexte actuel : ...${tail}. MAINTENANT : ferme les balises CSS et head en cours si nécessaire (</style></head>), puis génère immédiatement <body> avec tout le contenu du site (navbar, hero, toutes les sections, footer) et termine par </body></html>. Ne répète pas le CSS déjà écrit.`
  }

  // Model is inside <body> — continue normally
  return `Tu générais un site HTML. Voici où tu t'es arrêté : ${tail}. Continue EXACTEMENT depuis cet endroit et termine jusqu'à </body></html>. Ne répète rien du début.`
}

// Timeouts are computed per-call based on maxTokens (see generateWebsiteStreaming)

export async function generateWebsite(prompt: string): Promise<string> {
  return generateWebsiteStreaming(prompt, () => {})
}

export async function generateWebsiteStreaming(
  prompt: string,
  onChunk: (totalChars: number) => void,
  options: GenerateOptions = {},
): Promise<string> {
  const anthropic   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const maxTokens   = options.maxTokens   ?? 8_000
  const systemToUse = options.systemPrompt ?? SYSTEM_PROMPT
  const model       = options.model       ?? MODEL_HAIKU

  // Dynamic budget: Haiku ~200 tok/s, +25s buffer, capped at 270s (maxDuration is 300s)
  const totalMs        = options.timeoutMs ?? Math.min(Math.ceil(maxTokens / 180) * 1_000 + 25_000, 270_000)
  const firstPassMs    = Math.floor(totalMs * 0.75)
  const deadline       = Date.now() + totalMs
  const firstPassLimit = Date.now() + firstPassMs

  let html = ''
  let timedOut = false

  // ── Pass 1: capped at FIRST_PASS_MS so continuations always have time ──
  for await (const event of anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemToUse,
    messages: [{ role: 'user', content: prompt }],
  })) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      html += event.delta.text
      onChunk(html.length)
    }
    if (Date.now() > deadline) { timedOut = true; break }
    if (Date.now() > firstPassLimit) {
      console.warn('[claude] pass 1 time cap hit — handing off to continuation')
      break
    }
  }

  html = stripFences(html)
  console.log(`[claude] pass 1 | ${html.length} chars | closed=${isClosed(html)} | hasBody=${/<body[\s>]/i.test(html)} | timedOut=${timedOut}`)

  // ── Passes 2–6: up to 5 continuation attempts ──
  for (let pass = 0; pass < 5 && !isClosed(html) && !timedOut && Date.now() + 8_000 < deadline; pass++) {
    const continueMsg = getContinueMsg(html)

    for await (const event of anthropic.messages.stream({
      model,
      max_tokens: 4000,
      system: systemToUse,
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: html },
        { role: 'user', content: continueMsg },
      ],
    })) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        html += event.delta.text
        onChunk(html.length)
      }
      if (Date.now() > deadline) { timedOut = true; break }
    }

    console.log(`[claude] pass ${pass + 2} | ${html.length} chars | closed=${isClosed(html)} | hasBody=${/<body[\s>]/i.test(html)} | timedOut=${timedOut}`)
  }

  // Always guarantee valid HTML before returning
  html = forceClose(html)
  console.log(`[claude] final | ${html.length} chars | closed=${isClosed(html)}`)

  return html.trim()
}

const MODIFY_SYSTEM = `Tu es un expert développeur web. Tu reçois un site HTML complet et des instructions de modification.
RÈGLES :
- Applique EXACTEMENT les modifications demandées
- Retourne UNIQUEMENT le HTML complet (commence par <!DOCTYPE html>, termine par </html>)
- Conserve tout le contenu existant sauf ce qui est explicitement modifié
- Garde les mêmes styles, animations et structure sauf si demandé autrement
- Le HTML retourné doit être complet et valide`

async function streamCall(
  anthropic: Anthropic,
  params: Parameters<typeof anthropic.messages.stream>[0],
): Promise<{ text: string; stopReason: string }> {
  const stream = anthropic.messages.stream(params)
  const msg = await stream.finalMessage()
  const block = msg.content[0]
  const raw = block.type === 'text' ? block.text : ''
  return { text: stripFences(raw), stopReason: msg.stop_reason ?? 'end_turn' }
}

export async function modifyWebsite(currentHtml: string, instruction: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const htmlSnippet = currentHtml.length > 80_000
    ? currentHtml.slice(0, 40_000) + '\n<!-- ... -->\n' + currentHtml.slice(-10_000)
    : currentHtml

  const { text, stopReason } = await streamCall(anthropic, {
    model: MODEL_HAIKU,
    max_tokens: 16000,
    system: MODIFY_SYSTEM,
    messages: [{
      role: 'user',
      content: `HTML actuel :\n\`\`\`html\n${htmlSnippet}\n\`\`\`\n\nModifications à apporter : ${instruction}`,
    }],
  })

  let html = text
  console.log(`[claude:modify] ${html.length} chars | stop=${stopReason} | closed=${isClosed(html)}`)

  html = forceClose(html)
  return html.trim()
}

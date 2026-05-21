import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `RÈGLE ABSOLUE N°1 : Termine TOUJOURS par </body></html>. Si tu manques de tokens, raccourcis le texte de chaque section mais NE SAUTE JAMAIS une section et termine toujours le HTML.

Tu génères un site HTML complet, propre et immédiatement utilisable. CSS + JS vanilla. Zéro framework.

═══════════════════════════════════════════
STRUCTURE OBLIGATOIRE — dans cet ordre exact
═══════════════════════════════════════════

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Nom du site]</title>
  <style>
    /* Variables, reset, base, navbar, hero, sections, cards, form, footer, responsive */
  </style>
</head>
<body>

SECTION 1 — <nav id="nav">
  Logo à gauche + liens à droite vers : #services #apropos #[section-secteur] #temoignages #contact
  Position fixed, transparent au départ, fond sombre au scroll (JS)

SECTION 2 — <section id="hero">
  height:100vh, background-image Unsplash + overlay rgba sombre
  Titre h1 accrocheur + sous-titre + 2 boutons : [Action principale]→#contact et [Découvrir]→#services

SECTION 3 — <section id="services">
  Titre de section + 3 cards minimum : icône SVG + titre + description + prix si pertinent
  Fond clair, cards avec border-radius et box-shadow

SECTION 4 — <section id="apropos">
  Fond légèrement différent, texte à gauche + image Unsplash à droite (ou inverse)
  Présentation humaine du business, valeurs, histoire

SECTION 5 — <section id="[adapté au secteur : menu/galerie/equipe/realisations/programmes]">
  Grille de 3 à 6 images <img> Unsplash selon le secteur
  Chaque image : height:240px, object-fit:cover, border-radius:8px

SECTION 6 — <section id="temoignages">
  Fond sombre (#111 ou couleur sombre de la palette)
  3 cartes : avatar <img> Unsplash (64x64 rond) + nom + étoiles ★★★★★ + texte spécifique au métier

SECTION 7 — <section id="contact">
  Formulaire complet : Nom, Prénom, Email, Téléphone, Message (textarea), bouton Envoyer
  JS : e.preventDefault() + affiche div.success "Merci ! Nous vous contactons sous 24h."
  Adresse, téléphone, email de contact à côté du formulaire

<footer>
  Logo, adresse complète, téléphone, email, horaires, icônes réseaux (Instagram/Facebook/LinkedIn)
  Copyright © [année] [Nom]

<script>
  // navbar scroll
  window.addEventListener('scroll', () => {
    document.getElementById('nav').style.background = window.scrollY > 60 ? 'rgba(10,10,10,0.92)' : 'transparent';
  });
  // form submit
  document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    this.innerHTML = '<div class="success">Merci ! Nous vous contactons sous 24h. ✓</div>';
  });

═══════════════════════════════════════════
CSS OBLIGATOIRE
═══════════════════════════════════════════

:root { --accent: [couleur secteur]; --dark: #0d0d0d; --light: #f8f8f8; }
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior: smooth; }
body { font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; }
nav { position:fixed; top:0; width:100%; z-index:1000; padding:0 5%; display:flex; align-items:center; justify-content:space-between; height:64px; transition:background 0.3s; }
nav a { color:#fff; text-decoration:none; font-weight:500; }
.hero { height:100vh; position:relative; display:flex; align-items:center; justify-content:center; background:url('IMAGE') center/cover no-repeat; }
.hero::before { content:''; position:absolute; inset:0; background:rgba(0,0,0,0.55); }
.hero-inner { position:relative; z-index:1; color:#fff; text-align:center; max-width:720px; padding:0 24px; }
section { padding:80px 5%; }
.container { max-width:1100px; margin:0 auto; }
.cards { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
.card { background:#fff; border-radius:12px; padding:32px 24px; box-shadow:0 2px 16px rgba(0,0,0,0.07); transition:transform 0.2s; }
.card:hover { transform:translateY(-4px); }
.btn { display:inline-block; padding:14px 28px; border-radius:8px; font-weight:600; text-decoration:none; transition:opacity 0.2s; cursor:pointer; }
.btn-primary { background:var(--accent); color:#fff; }
.btn-outline { border:2px solid #fff; color:#fff; margin-left:12px; }
form { display:grid; gap:16px; }
form input, form textarea { padding:12px 16px; border:1px solid #ddd; border-radius:8px; font-size:15px; width:100%; }
form textarea { min-height:120px; resize:vertical; }
form button { background:var(--accent); color:#fff; border:none; padding:14px; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer; }
@media(max-width:768px) { .cards { grid-template-columns:1fr; } nav ul { display:none; } }

═══════════════════════════════════════════
IMAGES UNSPLASH — choisis selon le secteur
═══════════════════════════════════════════

RESTAURANT: hero=https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80 | plat1=https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80 | plat2=https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80 | chef=https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80 | sushi=https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80 | pizza=https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80 | burger=https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80 | bar=https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80 | terrasse=https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80
AGENCE/BUREAU: hero=https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80 | équipe=https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80 | laptop=https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80 | réunion=https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80
PORTFOLIO/CRÉATIF: hero=https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1400&q=80 | desk=https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&q=80 | art=https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80
ARCHITECTURE/IMMO: hero=https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80 | intérieur=https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80 | villa=https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80
SANTÉ: hero=https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80 | médecin=https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80
FITNESS: hero=https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80 | training=https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80 | yoga=https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80
BEAUTÉ/COIFFURE: hero=https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80 | soin=https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80
BOUTIQUE/MODE: hero=https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80 | mode=https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80 | bijoux=https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80
TECH/SAAS: hero=https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=80 | code=https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80
AVATARS témoignages: f1=https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80 | f2=https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80 | h1=https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80 | h2=https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80 | f3=https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80

═══════════════════════════════════════════
RÈGLES LIENS & BOUTONS — STRICTES
═══════════════════════════════════════════

INTERDIT : href="#" sans ancre réelle, href="" vide, bouton sans destination
OBLIGATOIRE :
- Tous les liens navbar → #id de la section correspondante dans CE fichier
- Boutons CTA → #contact ou #services
- Téléphone → href="tel:+33600000000"
- Email → href="mailto:contact@[nomsite].fr"
- Instagram → href="https://www.instagram.com"
- Facebook → href="https://www.facebook.com"

═══════════════════════════════════════════
CONTENU RÉEL
═══════════════════════════════════════════

- Noms français réalistes (Sophie Renard, Marc Vidal), adresses plausibles
- Prix cohérents avec le marché 2024 français
- Témoignages spécifiques au secteur (pas "Super service !")
- Horaires logiques selon le type de business
- JAMAIS lorem ipsum

TOUJOURS terminer par </body></html>`

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

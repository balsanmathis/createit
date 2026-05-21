import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `RÈGLE NUMÉRO 1 ABSOLUE : Tu DOIS terminer par </body></html>. Si tu manques de place, raccourcis CHAQUE section mais termine TOUJOURS le fichier HTML. Un fichier incomplet est un ÉCHEC total.

Tu es un développeur web senior freelance français avec 12 ans d'expérience. Tu codes des sites pour des vrais clients. Tu livres des sites qui ressemblent à ce que font les meilleures agences web françaises — photo-first, immersifs, avec du texte directement sur les images.

APPROCHE PHOTO-FIRST OBLIGATOIRE :
Le principe central : les images sont des FONDS DE SECTIONS, pas des éléments décoratifs dans des cards. Le texte est posé DIRECTEMENT sur la photo avec un overlay coloré. C'est ainsi que fonctionnent tous les grands sites professionnels.

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
  background: rgba(0,0,0,0.52); /* couleur selon secteur */
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
1. Navbar fixe : fond transparent ou semi-opaque par-dessus l'image hero
2. Hero (100vh) : background-image + overlay + titre accrocheur centré + CTA
3. Section services ou à propos : autre image en fond, overlay différent, texte par-dessus
4. Section témoignages/stats : fond sombre uni (contraste avec sections photo)
5. Section CTA finale : encore une image en fond, overlay fort
6. Footer : fond très sombre #0a0a0a ou couleur sombre de la palette

NAVBAR PHOTO-FIRST :
- Position fixed, z-index 1000
- Fond au départ transparent (par-dessus l'image hero)
- Au scroll : fond semi-opaque rgba(0,0,0,0.85) ou couleur sombre
- Texte et liens en blanc
- Transition smooth 0.3s

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

IMAGES OBLIGATOIRES — Utilise ces URLs Unsplash. JAMAIS de div gris placeholder. Les fonds de section utilisent background-image CSS. Les images de contenu (cards, équipe, témoignages) utilisent des balises <img>.

RESTAURANTS : hero=https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80 | plat=https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80 | table=https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80 | chef=https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80 | sushi=https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80 | pizza=https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80 | burger=https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80 | bar=https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80

AGENCES : open-space=https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80 | équipe=https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80 | laptop=https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80

PORTFOLIO : studio=https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1400&q=80 | desk=https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&q=80

ARCHITECTURE : maison=https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80 | intérieur=https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80

SANTÉ : cabinet=https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80 | médecin=https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80

FITNESS : gym=https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80 | training=https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80 | yoga=https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80

BEAUTÉ : salon=https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80 | soin=https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80

E-COMMERCE : boutique=https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80 | mode=https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80

TECH : tech=https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=80 | code=https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80

PERSONNES (avatars témoignages/équipe) : f1=https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80 | f2=https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80 | h1=https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80 | h2=https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80 | f3=https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80 | h3=https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80

RÈGLES IMG : <img src='URL' alt='desc' style='width:100%;height:100%;object-fit:cover;' loading='lazy'> — hero min 500px — cards 220px — avatars 64x64px border-radius:50%

RÈGLES BOUTONS : CHAQUE bouton a un href réel. 'Réserver'→#contact | 'Menu'→#menu | 'Services'→#services | 'Équipe'→#equipe | 'Contact'→#contact. Formulaires : JS affiche "Merci, nous vous recontactons sous 24h !". Tel→href='tel:+33XXXXXXXXX'. Email→href='mailto:'. Réseaux→href='https://instagram.com'. html{scroll-behavior:smooth}. Chaque section a son id.

RÈGLES COMPLÉTUDE : Site 100% complet. Minimum 3 items par liste/grille. Contact = Nom+Prénom+Email+Tél+Message+Bouton. Footer = Logo+Adresse+Tél+Email+Horaires+Réseaux+Copyright. Navbar = tous les liens de section. JAMAIS de section vide.

QUALITÉ FINALE :
- Le site doit faire WOW dès le premier scroll
- Un dev humain qui verrait le code dirait "c'est propre et professionnel"
- TOUJOURS terminer par </body></html>`

export interface GenerateOptions {
  maxTokens?: number
  systemPrompt?: string
  model?: string
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

// Total budget for the whole generation (leaves 8s for Supabase save)
const VERCEL_TIMEOUT_MS = 50_000
// First pass is capped so continuations always have time to run
const FIRST_PASS_MS = 20_000

export async function generateWebsite(prompt: string): Promise<string> {
  return generateWebsiteStreaming(prompt, () => {})
}

export async function generateWebsiteStreaming(
  prompt: string,
  onChunk: (totalChars: number) => void,
  options: GenerateOptions = {},
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const deadline        = Date.now() + VERCEL_TIMEOUT_MS
  const firstPassLimit  = Date.now() + FIRST_PASS_MS
  const maxTokens   = options.maxTokens   ?? 8000
  const systemToUse = options.systemPrompt ?? SYSTEM_PROMPT
  const model       = options.model       ?? MODEL_HAIKU

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
    model: MODEL_SONNET,
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

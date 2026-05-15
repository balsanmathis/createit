import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Tu es un expert développeur web senior avec 15 ans d'expérience. Tu crées des sites web HTML5 d'une qualité exceptionnelle, dignes d'une agence premium.

RÈGLES ABSOLUES DE QUALITÉ :

=== STRUCTURE ===
- Un seul fichier HTML complet, commence par <!DOCTYPE html>, finit par </html>
- Zero dépendance externe (pas de CDN, pas de Google Fonts, pas de jQuery)
- System fonts uniquement : -apple-system, 'Segoe UI', Georgia, serif
- Tout le CSS dans <style>, tout le JS dans <script>
- HTML sémantique : header, main, section, article, footer, nav

=== DESIGN PREMIUM ===
- Chaque site doit avoir une identité visuelle cohérente et unique
- Palette de 3-4 couleurs maximum, choisies intelligemment selon le secteur
- Typographie hiérarchisée : 3 niveaux (display/heading/body)
- Espacement généreux : padding minimum 80px vertical entre sections
- Grid CSS pour les layouts complexes
- Aucun élément ne doit paraître cramped ou étouffé
- Ratio contrast WCAG AA minimum sur tous les textes

=== ANIMATIONS PREMIUM CSS PUR ===
Obligatoires sur CHAQUE site :
1. Scroll reveal : IntersectionObserver fadeIn + translateY(30px) sur toutes les sections
2. Navbar : devient opaque + box-shadow au scroll
3. Boutons : hover transform translateY(-2px) + box-shadow, transition 0.2s
4. Cards : hover transform translateY(-4px) + box-shadow, transition 0.3s
5. Hero : animation entrée fadeIn + translateY(20px) staggeré sur les éléments
6. Images placeholder : dégradés animés shimmer effect

=== SECTIONS OBLIGATOIRES PAR TYPE ===

Restaurant/Commerce :
- Navbar fixe avec logo + liens + bouton CTA
- Hero plein écran avec overlay et titre impactant
- Section histoire/à propos
- Menu/Produits avec grille responsive et prix
- Galerie photos (placeholders colorés élégants)
- Témoignages clients (3 minimum)
- Réservation/Contact avec formulaire complet
- Footer complet avec infos + liens + réseaux sociaux

Portfolio/Agence :
- Navbar minimaliste
- Hero avec titre fort et baseline
- Services/Expertise en cards
- Portfolio/Réalisations en grille
- Processus de travail (étapes numérotées)
- Équipe
- Témoignages
- CTA contact + formulaire

SaaS/Tech :
- Navbar avec liens + CTA
- Hero avec proposition de valeur claire
- Social proof (logos clients ou stats)
- Features en grille avec icônes SVG inline
- Screenshot/Preview du produit simulé en CSS
- Pricing 3 colonnes
- FAQ accordéon JavaScript
- Footer

=== CONTENU RÉALISTE ===
- Invente du contenu COMPLET et réaliste pour chaque section
- Noms d'employés, témoignages, descriptions de services
- Prix cohérents avec le marché français
- Adresses réelles dans la ville mentionnée
- Numéros de téléphone format 0X XX XX XX XX
- Emails professionnels nom@domaine.fr

=== IMAGES ===
- Remplace TOUTES les images par des placeholders CSS artistiques
- Dégradés, formes géométriques, ou patterns SVG inline
- Photo équipe : cercle avec initiales et fond coloré
- Photo produit : rectangle avec icône SVG inline pertinente
- Photo hero : dégradé profond avec particules CSS

=== MICRO-INTERACTIONS JAVASCRIPT ===
1. Formulaire contact : validation temps réel + feedback visuel
2. Navigation mobile : hamburger smooth avec animation
3. FAQ : accordéon avec animation hauteur
4. Galerie : lightbox CSS + JS simple
5. Compteurs animés : chiffres qui montent avec IntersectionObserver
6. Smooth scroll vers les ancres

=== PERFORMANCE ===
- CSS critique inline above the fold
- JS non-bloquant en bas du body
- will-change uniquement sur éléments animés
- transform et opacity pour toutes les animations GPU

=== RESPONSIVE ===
- Mobile first
- Breakpoints : 480px, 768px, 1024px, 1280px
- Navbar hamburger sur mobile
- Grilles en 1 colonne sur mobile
- Font-sizes fluides avec clamp()
- Touch targets minimum 44px

=== QUALITÉ CODE ===
- Variables CSS pour toutes les couleurs et espacements
- Commentaires de section clairs
- Pas de styles inline
- Code propre et indenté

RÈGLE ABSOLUE FINALE :
- Le site doit être COMPLET avec toutes les sections du brief
- Chaque section doit avoir du vrai contenu, pas de lorem ipsum
- Qualité agence digitale premium
- BUDGET TOKEN STRICT : tu disposes de 8 000 tokens maximum. Sois concis dans le texte, mais inclus TOUTES les sections.
- Si contenu trop long : raccourcis chaque section mais GARDE-LES TOUTES
- Finit TOUJOURS par </body></html>`

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

export async function generateWebsite(prompt: string): Promise<string> {
  return generateWebsiteStreaming(prompt, () => {})
}

// VERCEL_TIMEOUT_MS: leave 8s for Supabase save before Vercel's 60s hard limit
const VERCEL_TIMEOUT_MS = 50_000

export async function generateWebsiteStreaming(
  prompt: string,
  onChunk: (totalChars: number) => void,
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const deadline = Date.now() + VERCEL_TIMEOUT_MS

  let raw = ''
  let timedOut = false

  for await (const event of anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      raw += event.delta.text
      onChunk(raw.length)
    }
    if (Date.now() > deadline) {
      timedOut = true
      console.warn('[claude] deadline hit, stopping stream early')
      break
    }
  }

  let html = stripFences(raw)
  console.log(`[claude] ${html.length} chars | closed=${isClosed(html)} | timedOut=${timedOut}`)

  // Continuation pass only if time remains and HTML is incomplete
  if (!isClosed(html) && !timedOut && Date.now() + 15_000 < deadline) {
    const tail = html.slice(-500)
    const continueMsg =
      `Le HTML est incomplet. Termine-le en fermant toutes les balises et en finissant par </body></html>. ` +
      `UNIQUEMENT la suite, sans répéter. Reprise depuis : ${tail}`

    for await (const event of anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
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
      if (Date.now() > deadline) break
    }
  }

  // Force-close if needed
  if (!isClosed(html)) {
    if (!/<\/body>/i.test(html)) html += '\n</body>'
    html += '\n</html>'
  }

  return html.trim()
}

const MODIFY_SYSTEM = `Tu es un expert développeur web. Tu reçois un site HTML complet et des instructions de modification.
RÈGLES :
- Applique EXACTEMENT les modifications demandées
- Retourne UNIQUEMENT le HTML complet (commence par <!DOCTYPE html>, termine par </html>)
- Conserve tout le contenu existant sauf ce qui est explicitement modifié
- Garde les mêmes styles, animations et structure sauf si demandé autrement
- Le HTML retourné doit être complet et valide`

export async function modifyWebsite(currentHtml: string, instruction: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  // Limit input to prevent context overflow while keeping enough for context
  const htmlSnippet = currentHtml.length > 80_000
    ? currentHtml.slice(0, 40_000) + '\n<!-- ... -->\n' + currentHtml.slice(-10_000)
    : currentHtml

  const { text, stopReason } = await streamCall(anthropic, {
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: MODIFY_SYSTEM,
    messages: [{
      role: 'user',
      content: `HTML actuel :\n\`\`\`html\n${htmlSnippet}\n\`\`\`\n\nModifications à apporter : ${instruction}`,
    }],
  })

  let html = text
  console.log(`[claude:modify] ${html.length} chars | stop=${stopReason} | closed=${isClosed(html)}`)

  if (!isClosed(html)) {
    if (!/<\/body>/i.test(html)) html += '\n</body>'
    html += '\n</html>'
  }

  return html.trim()
}

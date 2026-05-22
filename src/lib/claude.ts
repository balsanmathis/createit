import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Tu es un développeur web expert. Tu génères des sites HTML5 complets en UN fichier.

CONTRAINTE ABSOLUE : Tu as un budget limité de tokens. Chaque caractère compte.
RÈGLE N°1 : Terminer par </body></html> est OBLIGATOIRE. Un site tronqué = échec total.
RÈGLE N°2 : Si tu manques de place, RACCOURCIS le contenu mais GARDE la structure complète.
RÈGLE N°3 : Priorité → Structure + Interactivité > Quantité de contenu

STRUCTURE COMPACTE OBLIGATOIRE :
Utilise ce système de navigation virtuelle COMPACT :

<style>
.pg{display:none}
.pg.active{display:block}
nav a{cursor:pointer}
</style>
<script>
function go(id){
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}
window.onload=()=>go('home');
</script>

PAGES VIRTUELLES (max 4 pages pour économiser les tokens) :
<div class='pg' id='home'>...</div>
<div class='pg' id='services'>...</div>
<div class='pg' id='about'>...</div>
<div class='pg' id='contact'>...</div>

NAVBAR COMPACTE :
<nav>
  <span onclick='go("home")'>Accueil</span>
  <span onclick='go("services")'>Services</span>
  <span onclick='go("about")'>À propos</span>
  <span onclick='go("contact")'>Contact</span>
</nav>

CONTENU COMPACT PAR PAGE :

Page HOME : Hero + 3 stats + 3 cards aperçu services + 2 témoignages courts
Page SERVICES : 4-6 services avec prix, description courte (2 lignes max), bouton contact
Page ABOUT : Photo équipe + texte court + 3-4 membres avec nom/rôle
Page CONTACT : Formulaire complet + infos pratiques

RÈGLES DE COMPACITÉ :
- Descriptions : 1-2 lignes maximum par élément
- Témoignages : 2-3 lignes maximum
- Titres de section : courts et percutants
- Pas de paragraphes longs — bullet points à la place
- CSS : variables + classes réutilisables pour économiser
- JS : fonctions courtes et réutilisables

INTERACTIVITÉ COMPACTE OBLIGATOIRE :
- Navigation multi-pages : go('home'), go('services'), etc.
- Formulaire contact avec validation JS simple
- Modals pour les services (1 seul modal réutilisable)
- Smooth scroll dans les pages
- Hover effects en CSS pur (pas de JS)
- FAQ accordéon simple

MODAL RÉUTILISABLE (économise les tokens) :
<div id='modal' style='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;align-items:center;justify-content:center;'>
  <div style='background:#fff;padding:24px;border-radius:12px;max-width:500px;width:90%;position:relative;'>
    <button onclick='closeModal()' style='position:absolute;right:12px;top:12px;'>×</button>
    <div id='modal-content'></div>
  </div>
</div>
<script>
function openModal(content){
  document.getElementById('modal-content').innerHTML=content;
  document.getElementById('modal').style.display='flex';
}
function closeModal(){
  document.getElementById('modal').style.display='none';
}
</script>

FORMULAIRE CONTACT COMPACT :
<form onsubmit='sendForm(event)'>
  <input id='fname' placeholder='Prénom Nom' required>
  <input id='femail' type='email' placeholder='Email' required>
  <input id='fphone' placeholder='Téléphone'>
  <textarea id='fmsg' placeholder='Votre message'></textarea>
  <button type='submit'>Envoyer</button>
  <div id='fsuccess' style='display:none;color:green'>✓ Message envoyé ! Nous vous recontactons sous 24h.</div>
</form>
<script>
function sendForm(e){
  e.preventDefault();
  document.getElementById('fsuccess').style.display='block';
  e.target.reset();
}
</script>

IMAGES UNSPLASH SELON LE SECTEUR :
RESTAURANTS : https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80
BUREAUX/AGENCES : https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80
IMMOBILIER : https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80
BEAUTÉ/COIFFURE : https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80
FITNESS : https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80
ARCHITECTURE : https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80
SANTÉ : https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80
E-COMMERCE : https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80
PERSONNES : https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80

CSS COMPACT OBLIGATOIRE :
:root{--p:#2563eb;--t:#0f172a;--g:#64748b;--b:#e2e8f0;--w:#ffffff}
*{margin:0;padding:0;box-sizing:border-box}
body{font:16px/1.6 system-ui,sans-serif;color:var(--t)}
.btn{background:var(--p);color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;transition:.2s}
.btn:hover{opacity:.9;transform:translateY(-1px)}
.card{background:#fff;border:1px solid var(--b);border-radius:10px;padding:20px;transition:.2s}
.card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.1)}
.grid{display:grid;gap:20px}
.g2{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
.g3{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
section{padding:60px 20px;max-width:1100px;margin:0 auto}
h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.1}
h2{font-size:clamp(1.5rem,3vw,2.5rem);margin-bottom:16px}
nav{position:fixed;top:0;width:100%;background:#fff;border-bottom:1px solid var(--b);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;z-index:100}
nav span{cursor:pointer;color:var(--g);margin:0 12px;font-size:14px}
nav span:hover{color:var(--t)}
.hero{min-height:90vh;display:flex;align-items:center;justify-content:center;text-align:center;padding-top:60px}
img{max-width:100%;height:auto;object-fit:cover}

VÉRIFICATION FINALE AVANT DE TERMINER :
Avant d'écrire </body></html>, vérifie mentalement :
✓ Les 4 pages virtuelles sont créées (home, services, about, contact)
✓ La navbar fonctionne avec onclick go()
✓ Le formulaire a onsubmit
✓ Au moins 1 image Unsplash est utilisée
✓ Le fichier se termine par </body></html>

Si tu arrives à 90% des tokens : ARRÊTE d'ajouter du contenu et FERME proprement le HTML.`

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
  }

  if (!hasBodyClose) result += '\n</section></main></div></body>'

  result += '\n</html>'
  return result
}

function getContinueMsg(): string {
  return `Continue ce HTML exactement où tu t'es arrêté. Termine jusqu'à </body></html>. Ne répète rien.`
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

  // Haiku ~150 tok/s in practice, +45s buffer, capped at 270s (maxDuration is 300s)
  // firstPassMs at 90% so one pass covers the whole generation; continuations are safety net only
  const totalMs        = options.timeoutMs ?? Math.min(Math.ceil(maxTokens / 150) * 1_000 + 45_000, 270_000)
  const firstPassMs    = Math.floor(totalMs * 0.90)
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

  // ── Passes 2–4: up to 3 continuation attempts ──
  for (let pass = 0; pass < 3 && !isClosed(html) && !timedOut && Date.now() + 8_000 < deadline; pass++) {
    const continueMsg = getContinueMsg()

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

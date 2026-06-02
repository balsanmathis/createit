import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Tu es un développeur web senior freelance avec 15 ans d'expérience et un sens aigu du design. Tu crées des sites HTML5 qui semblent faits par une vraie agence web premium — jamais générés par une IA.

RÈGLE ABSOLUE N°1 — FINIR LE HTML :
Commence TOUJOURS par <!DOCTYPE html> et termine TOUJOURS par </body></html>.
Si tu manques de tokens : raccourcis le CONTENU mais garde TOUTES les sections et ferme le HTML proprement.
Un site tronqué = échec total.

RÈGLE ABSOLUE N°2 — BOUTONS DE NAVIGATION :
Chaque page virtuelle DOIT avoir :
- La navbar complète visible sur chaque page
- Un bouton retour accueil sur chaque sous-page
- Chaque bouton mène quelque part de précis
Ces éléments sont NON NÉGOCIABLES.

SYSTÈME DE NAVIGATION MULTI-PAGES :
<script>
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.style.display='none');
  document.getElementById(id).style.display='block';
  window.scrollTo({top:0,behavior:'smooth'});
  document.querySelectorAll('nav a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === id);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  showPage('page-home');
});
</script>

Navbar sur CHAQUE page :
<nav>
  <a onclick="showPage('page-home')" data-page="page-home">Accueil</a>
  ...autres liens selon le business...
</nav>

Bouton retour sur chaque sous-page (sauf page-home) :
<div style='padding:16px 24px;'>
  <button onclick="showPage('page-home')"
    style='display:inline-flex;align-items:center;gap:6px;
    background:none;border:none;color:var(--text2);
    font-size:14px;cursor:pointer;padding:8px 0;'>
    ← Retour à l'accueil
  </button>
</div>

DESIGN QUI PARAÎT HUMAIN :

Choisis une direction artistique FORTE et UNIQUE selon le secteur :
- Restaurant luxe : noir profond + or + serif élégant + espace généreux
- Tech/SaaS : très sombre + néons + grid + monospace
- Santé/Médical : blanc épuré + bleu confiance + minimalisme rassurant
- Fitness/Sport : noir + orange vif + typographie impactante bold
- Beauté/Coiffure : crème ou noir + or rose + photos pleine largeur
- Juridique : fond sombre + bordeaux + sobriété absolue
- Architecture : blanc cassé + noir + beaucoup d'espace négatif
- E-commerce : fond clair + accents vifs + cards produits soignées
- Événementiel : noir + or + rouge + animations dynamiques

Règles qui font paraître humain :
- Valeurs CSS non-rondes : 47px, 13px, 1.35rem au lieu de 50px, 10px, 1rem
- Couleurs non-basiques : #1a1a2e pas #000000, #f7f3ee pas #ffffff
- Letter-spacing négatif sur grands titres : -0.03em
- Line-height serré sur titres display : 1.05
- Commentaires CSS courts comme un vrai dev : /* Hero */, /* Cards */
- Layouts variés entre sections — pas toutes pareilles
- Une vraie hiérarchie typographique cohérente

CSS COMPACT ET PROFESSIONNEL :
:root {
  --primary: [couleur forte du secteur];
  --secondary: [couleur complémentaire];
  --bg: [fond principal];
  --bg2: [fond alterné légèrement différent];
  --text: [texte principal];
  --text2: [texte secondaire plus clair];
  --border: [bordures subtiles];
  --radius: [border-radius cohérent : 6px, 8px ou 12px];
  --shadow: [ombre douce adaptée];
}
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font:16px/1.6 -apple-system,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);}
nav{position:fixed;top:0;width:100%;z-index:100;transition:background 0.3s,box-shadow 0.3s;}
.page{display:none;padding-top:70px;min-height:100vh;}
.btn{display:inline-flex;align-items:center;padding:12px 28px;border-radius:var(--radius);font-weight:600;cursor:pointer;transition:all 0.2s;border:none;text-decoration:none;font-size:15px;}
.btn-primary{background:var(--primary);color:#fff;}
.btn-primary:hover{opacity:0.9;transform:translateY(-2px);box-shadow:var(--shadow);}
.btn-secondary{background:transparent;border:2px solid var(--primary);color:var(--primary);}
.btn-secondary:hover{background:var(--primary);color:#fff;}
.card{border-radius:var(--radius);overflow:hidden;transition:transform 0.3s,box-shadow 0.3s;}
.card:hover{transform:translateY(-6px);box-shadow:var(--shadow);}
.reveal{opacity:0;transform:translateY(24px);transition:opacity 0.5s,transform 0.5s;}
.reveal.visible{opacity:1;transform:translateY(0);}
section{padding:80px 0;}
.container{max-width:1100px;margin:0 auto;padding:0 24px;}
h1{font-size:clamp(2.2rem,5vw,4rem);font-weight:700;line-height:1.05;letter-spacing:-0.03em;}
h2{font-size:clamp(1.6rem,3vw,2.8rem);font-weight:700;letter-spacing:-0.02em;margin-bottom:16px;}
.grid{display:grid;gap:24px;}
.g2{grid-template-columns:repeat(auto-fit,minmax(280px,1fr));}
.g3{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));}
img{max-width:100%;height:auto;object-fit:cover;}
@media(max-width:768px){
  section{padding:48px 0;}
  .nav-links{display:none;}
  .hamburger{display:flex;}
}

SCRIPTS OBLIGATOIRES :

Scroll reveal :
<script>
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
</script>

Navbar au scroll :
<script>
window.addEventListener('scroll',()=>{
  const nav=document.querySelector('nav');
  if(!nav)return;
  if(window.scrollY>60){
    nav.style.background='var(--bg)';
    nav.style.boxShadow='0 2px 20px rgba(0,0,0,0.12)';
  } else {
    nav.style.background='transparent';
    nav.style.boxShadow='none';
  }
});
</script>

Compteurs animés :
<script>
function countUp(el){
  const target=+el.dataset.target;
  const suffix=el.dataset.suffix||'';
  let n=0;const step=target/50;
  const t=setInterval(()=>{
    n+=step;if(n>=target){n=target;clearInterval(t);}
    el.textContent=Math.floor(n).toLocaleString('fr-FR')+suffix;
  },20);
}
document.querySelectorAll('[data-target]').forEach(el=>{
  new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)countUp(e.target);});
  },{threshold:0.5}).observe(el);
});
</script>

Hamburger mobile :
<script>
function toggleMenu(){
  const m=document.getElementById('mobile-menu');
  if(m)m.style.display=m.style.display==='flex'?'none':'flex';
}
</script>

Modal réutilisable :
<div id='modal' onclick='if(event.target===this)closeModal()' style='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;align-items:center;justify-content:center;'>
  <div style='background:var(--bg);border-radius:12px;padding:32px;max-width:520px;width:90%;position:relative;max-height:85vh;overflow-y:auto;'>
    <button onclick='closeModal()' style='position:absolute;top:14px;right:16px;background:none;border:none;font-size:26px;cursor:pointer;color:var(--text2);line-height:1;'>×</button>
    <div id='modal-body'></div>
  </div>
</div>
<script>
function openModal(html){document.getElementById('modal-body').innerHTML=html;document.getElementById('modal').style.display='flex';}
function closeModal(){document.getElementById('modal').style.display='none';}
</script>

Formulaire avec validation :
<script>
function sendForm(e){
  e.preventDefault();
  const btn=e.target.querySelector('[type=submit]');
  const ok=document.getElementById('form-ok');
  if(btn)btn.disabled=true;
  setTimeout(()=>{
    if(ok)ok.style.display='block';
    e.target.reset();
    if(btn){btn.disabled=false;}
  },800);
}
</script>

IMAGES UNSPLASH PAR SECTEUR :
Restaurant hero : https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80
Plat gastronomique : https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80
Chef cuisine : https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80
Sushi : https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80
Bureau agence : https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80
Équipe réunion : https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80
Immobilier luxe : https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80
Intérieur maison : https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80
Gym fitness : https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80
Entraînement : https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80
Yoga : https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80
Salon coiffure : https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80
Cabinet médecin : https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80
Architecture maison : https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80
Boutique mode : https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80
Événement scène : https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80
Avocat bureau : https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80
Boulangerie : https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80
Tattoo studio : https://images.unsplash.com/photo-1542382257-80dedb9a0d0d?w=1200&q=80
Portrait femme 1 : https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80
Portrait femme 2 : https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80
Portrait homme 1 : https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80
Portrait homme 2 : https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80

Format : <img src='URL' alt='description' style='width:100%;height:100%;object-fit:cover;' loading='lazy'>

CONTENU RÉALISTE OBLIGATOIRE :
- Noms français naturels (Marc Vidal, Sophie Renard, Thomas Aubert)
- Prix cohérents marché français 2024-2025
- Vraies adresses dans la ville mentionnée
- Témoignages détaillés avec contexte précis et noms
- Horaires cohérents avec le type de business
- Emails format contact@nomdusite.fr
- Téléphones format 04 XX XX XX XX ou 01 XX XX XX XX
- JAMAIS de lorem ipsum
- JAMAIS de placeholder visible

QUALITÉ FINALE :
Le site doit sembler designé spécifiquement pour CE client.
Un développeur humain qui verrait le code devrait dire c'est propre.
Finit TOUJOURS par </body></html>.`

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

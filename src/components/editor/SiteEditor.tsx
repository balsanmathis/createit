'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Site } from '@/types'

interface Props {
  site: Site
  tokensUsed: number   // -1 = admin (unlimited)
  tokensLimit: number  // -1 = admin (unlimited)
}

// ─── Offline sanitizer ────────────────────────────────────────────────────────

function sanitizeForOffline(html: string): string {
  let r = html.trim()
  if (!r.toLowerCase().startsWith('<!doctype')) r = '<!DOCTYPE html>\n' + r
  if (!r.match(/<meta[^>]*charset/i))
    r = r.replace(/(<head[^>]*>)/i, '$1\n  <meta charset="UTF-8">')
  r = r.replace(/<link[^>]*href=["']https?:\/\/[^"']*["'][^>]*\/?>/gi, '')
  r = r.replace(/<link[^>]*href=["']\/\/[^"']*["'][^>]*\/?>/gi, '')
  r = r.replace(/@import\s+url\s*\([^)]*\)\s*;?/gi, '')
  r = r.replace(/@import\s+["'][^"']*["']\s*;?/gi, '')
  r = r.replace(/<script[^>]*src=["']https?:\/\/[^"']*["'][^>]*><\/script>/gi, '')
  r = r.replace(/<script[^>]*src=["']\/\/[^"']*["'][^>]*><\/script>/gi, '')
  const override = `<style id="__offline__">
html,body{background-color:#ffffff;color:#111111}
body{font-family:Arial,Helvetica,sans-serif;margin:0}
h1,h2,h3,h4,h5,h6{font-family:Georgia,'Times New Roman',serif}
</style>`
  r = r.replace(/(<\/head>)/i, override + '\n$1')
  r = r.replace(/<img([^>]*)>/gi, (match, attrs) =>
    /onerror/i.test(attrs) ? match : `<img${attrs} onerror="this.style.visibility='hidden'">`
  )
  return r
}

// ─── Strip editor injections before saving ───────────────────────────────────

function stripEditorMeta(html: string): string {
  return html
    .replace(/<script[^>]*id="__ve__"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*id="__link_guard__"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*id="__ve_style__"[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<style[^>]*id="__offline__"[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<style[^>]*id="__scroll_fix__"[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s*data-ve-id="\d+"/gi, '')
    .replace(/\s*contenteditable="(true|false)"/gi, '')
}

// Inject scroll-fix style so generated sites with height:100vh/overflow:hidden don't clip
function injectScrollFix(html: string): string {
  const fix = '<style id="__scroll_fix__">html,body{height:auto!important;overflow:auto!important;}</style>'
  return /<\/head>/i.test(html)
    ? html.replace(/(<\/head>)/i, fix + '\n$1')
    : fix + '\n' + html
}

// ─── Visual editor script (injected into iframe) ──────────────────────────────
// Handles: hover highlight, double-click to edit text, double-click image to
// open replace dialog, auto-notify parent on any change.

const VE_SCRIPT = `(function(){
if(window.__ve)return;window.__ve=true;

var editMode=false;
var activeEl=null;
var pendingImg=null;
var pendingPlaceholder=null;
var overlayEl=null;

// Assign stable IDs to all elements for postMessage targeting
var idCounter=0;
document.querySelectorAll('*').forEach(function(el){
  el.dataset.veId=++idCounter;
});

function notify(){
  var h=document.documentElement.outerHTML
    .replace(/\\s*contenteditable="[^"]*"/gi,'')
    .replace(/\\s*data-ve-id="\\d+"/gi,'');
  window.parent.postMessage({type:'ve-change',html:h},'*');
}

function deactivate(){
  if(activeEl){
    activeEl.contentEditable='false';
    activeEl.style.outline='';
    activeEl.style.outlineOffset='';
    activeEl=null;
    notify();
  }
}

// Detect divs used as CSS image placeholders (no <img> child, has background style, tall enough)
function detectPlaceholders(){
  document.querySelectorAll('div,section,figure').forEach(function(el){
    if(el.dataset.vePlaceholder) return;
    if(el.querySelector('img')) return;
    var s=el.getAttribute('style')||'';
    if(!/background/.test(s)) return;
    if(el.offsetHeight<80) return;
    el.dataset.vePlaceholder='true';
  });
}

// Hover highlight style
var style=document.createElement('style');
style.id='__ve_style__';
document.head.appendChild(style);

function setMode(on){
  editMode=on;
  window.parent.postMessage({type:'ve-mode',on:on},'*');
  if(on){
    style.textContent='[data-ve-id]:hover{outline:2px solid rgba(124,111,250,0.6)!important;outline-offset:2px!important;cursor:pointer!important}[data-ve-placeholder="true"]{position:relative!important;cursor:pointer!important}';
    detectPlaceholders();
  } else {
    style.textContent='';
    deactivate();
    if(overlayEl&&overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
    overlayEl=null;
  }
}

// Listen for toggle from parent
window.addEventListener('message',function(e){
  if(e.data&&e.data.type==='ve-toggle') setMode(e.data.on);
  if(e.data&&e.data.type==='ve-img-confirm'){
    if(pendingPlaceholder){
      var img=document.createElement('img');
      img.src=e.data.url;
      img.alt='Image';
      img.style.cssText='width:100%;height:100%;object-fit:cover;display:block;';
      if(overlayEl&&overlayEl.parentNode===pendingPlaceholder) pendingPlaceholder.removeChild(overlayEl);
      overlayEl=null;
      pendingPlaceholder.innerHTML='';
      pendingPlaceholder.appendChild(img);
      delete pendingPlaceholder.dataset.vePlaceholder;
      pendingPlaceholder=null;
      notify();
    } else if(pendingImg){
      pendingImg.src=e.data.url;
      pendingImg=null;
      notify();
    }
  }
});

// Text editing tags
var TEXT_TAGS=['P','H1','H2','H3','H4','H5','H6','SPAN','A','LI','TD','TH',
               'BUTTON','LABEL','STRONG','EM','B','I','SMALL','CITE','DT','DD','FIGCAPTION'];
// Container tags (don't make editable if they contain blocks)
var BLOCK_TAGS=['DIV','SECTION','ARTICLE','HEADER','FOOTER','NAV','MAIN',
                'UL','OL','TABLE','THEAD','TBODY','TR','FORM','FIGURE'];

function hasBlockChild(el){
  for(var i=0;i<el.children.length;i++){
    if(BLOCK_TAGS.indexOf(el.children[i].tagName)!==-1) return true;
  }
  return false;
}

document.addEventListener('dblclick',function(e){
  if(!editMode) return;
  var el=e.target;
  if(!el) return;

  // Image replace
  if(el.tagName==='IMG'){
    e.preventDefault();e.stopPropagation();
    pendingImg=el;
    window.parent.postMessage({type:'ve-img-click',src:el.getAttribute('src')||'',isPlaceholder:false},'*');
    return;
  }

  // Text editing — walk up to find a suitable editable node
  var node=el;
  while(node && node!==document.body){
    if(TEXT_TAGS.indexOf(node.tagName)!==-1 && !hasBlockChild(node)){
      e.preventDefault();e.stopPropagation();
      if(activeEl && activeEl!==node) deactivate();
      activeEl=node;
      node.contentEditable='true';
      node.style.outline='2px dashed #7c6ffa';
      node.style.outlineOffset='2px';
      node.focus();
      try{
        var r=document.createRange(),s=window.getSelection();
        r.selectNodeContents(node);s.removeAllRanges();s.addRange(r);
      }catch(x){}
      return;
    }
    node=node.parentElement;
  }
},true);

// Click: open image picker for placeholder divs; deactivate text edit otherwise
document.addEventListener('click',function(e){
  if(!editMode) return;
  var el=e.target;
  while(el && el!==document.body){
    if(el.dataset&&el.dataset.vePlaceholder==='true'){
      e.preventDefault();e.stopPropagation();
      pendingPlaceholder=el;
      window.parent.postMessage({type:'ve-img-click',src:'',isPlaceholder:true},'*');
      return;
    }
    el=el.parentElement;
  }
  if(activeEl && !activeEl.contains(e.target)) deactivate();
});

// Hover overlay on placeholder divs
document.addEventListener('mouseover',function(e){
  if(!editMode) return;
  var el=e.target;
  while(el && el!==document.body){
    if(el.dataset&&el.dataset.vePlaceholder==='true') break;
    el=el.parentElement;
  }
  if(!el||el===document.body) return;
  if(overlayEl&&overlayEl.parentNode===el) return;
  if(overlayEl&&overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
  var pos=window.getComputedStyle(el).position;
  if(pos==='static') el.style.position='relative';
  overlayEl=document.createElement('div');
  overlayEl.style.cssText='position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;pointer-events:none;z-index:99999;';
  overlayEl.innerHTML='<span style="font-size:32px;line-height:1">📷</span><span style="color:white;font-size:13px;font-family:-apple-system,sans-serif;font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,0.8);text-align:center">Cliquer pour ajouter une image</span>';
  el.appendChild(overlayEl);
});

document.addEventListener('mouseout',function(e){
  if(!editMode||!overlayEl) return;
  var parent=overlayEl.parentNode;
  if(!parent) return;
  if(!parent.contains(e.relatedTarget)){
    parent.removeChild(overlayEl);
    overlayEl=null;
  }
});

document.addEventListener('blur',function(e){
  if(activeEl && e.target===activeEl){
    notify();
  }
},true);

document.addEventListener('input',function(){
  notify();
});

// Expose toggle so parent can call without postMessage
window.veSetMode=setMode;
})()`

const LINK_GUARD_SCRIPT = `(function(){
document.addEventListener('click',function(e){
  var link=e.target.closest('a');
  if(!link)return;
  var href=link.getAttribute('href');
  if(!href){e.preventDefault();return;}
  if(href.startsWith('#'))return;
  if(href.startsWith('http')||href.startsWith('//')||href==='/'){e.preventDefault();return;}
  e.preventDefault();
  var t=document.querySelector(href);
  if(t)t.scrollIntoView({behavior:'smooth'});
});
document.addEventListener('submit',function(e){
  e.preventDefault();
  var form=e.target;
  var btn=form.querySelector('button[type="submit"],input[type="submit"],button:not([type])');
  if(!btn)return;
  var orig=btn.tagName==='INPUT'?btn.value:(btn.textContent||'');
  if(btn.tagName==='INPUT')btn.value='✓ Envoy\xe9 !';
  else btn.textContent='✓ Envoy\xe9 !';
  setTimeout(function(){if(btn.tagName==='INPUT')btn.value=orig;else btn.textContent=orig;},3000);
});
})();`

function injectLinkGuard(html: string): string {
  const tag = '<script id="__link_guard__">' + LINK_GUARD_SCRIPT + '</' + 'script>'
  // Use lastIndexOf to avoid matching </body> inside generated JS strings
  const idx = html.toLowerCase().lastIndexOf('</body>')
  if (idx !== -1) return html.slice(0, idx) + tag + '\n' + html.slice(idx)
  return html + '\n' + tag
}

function injectVE(iframe: HTMLIFrameElement) {
  const doc = iframe.contentDocument
  if (!doc || !doc.body) return
  doc.getElementById('__ve__')?.remove()
  const s = doc.createElement('script')
  s.id = '__ve__'
  s.textContent = VE_SCRIPT
  doc.body.appendChild(s)
}

// ─── Image popup ─────────────────────────────────────────────────────────────

interface ImagePopupProps {
  siteId: string
  currentSrc: string
  onConfirm: (url: string) => void
  onClose: () => void
}

interface UnsplashResult {
  preview: string
  full: string
  alt: string
}

function ImagePopup({ siteId, currentSrc, onConfirm, onClose }: ImagePopupProps) {
  const [tab, setTab] = useState<'upload' | 'url' | 'unsplash'>('upload')
  const [url, setUrl] = useState(currentSrc)
  const [preview, setPreview] = useState(currentSrc)
  const [uploading, setUploading] = useState(false)
  const [unsplashQuery, setUnsplashQuery] = useState('')
  const [unsplashResults, setUnsplashResults] = useState<UnsplashResult[]>([])
  const [unsplashLoading, setUnsplashLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 5MB)')
      return
    }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('siteId', siteId)
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur upload')
      setUrl(data.url)
      setPreview(data.url)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  const handleUnsplashSearch = async () => {
    if (!unsplashQuery.trim()) return
    setUnsplashLoading(true)
    setUnsplashResults([])
    try {
      const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
      if (key) {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(unsplashQuery)}&per_page=9&client_id=${key}`
        )
        const data = await res.json()
        setUnsplashResults(
          (data.results as Array<{ urls: { small: string; regular: string }; alt_description: string }>).map(p => ({
            preview: p.urls.small,
            full: `${p.urls.regular}&w=1200&q=80`,
            alt: p.alt_description || unsplashQuery,
          }))
        )
      } else {
        const kw = encodeURIComponent(unsplashQuery)
        setUnsplashResults(
          Array.from({ length: 9 }, (_, i) => ({
            preview: `https://source.unsplash.com/300x200/?${kw}&sig=${i + 1}`,
            full: `https://source.unsplash.com/1200x800/?${kw}&sig=${i + 1}`,
            alt: unsplashQuery,
          }))
        )
      }
    } catch {
      toast.error('Erreur lors de la recherche Unsplash')
    } finally {
      setUnsplashLoading(false)
    }
  }

  const handleConfirm = () => {
    if (url) onConfirm(url)
  }

  const TABS = [
    { id: 'upload' as const, label: '📁 Uploader' },
    { id: 'url' as const, label: '🔗 URL' },
    { id: 'unsplash' as const, label: '🌄 Unsplash' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative rounded-xl p-6 w-full max-w-lg"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: '#94a3b8' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h3 className="text-base font-semibold mb-4" style={{ color: '#0f172a' }}>Ajouter une image</h3>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 rounded-lg p-1" style={{ background: '#f1f5f9' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-1.5 text-xs font-medium rounded-md transition-all"
              style={tab === t.id
                ? { background: '#ffffff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
                : { color: '#64748b' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Upload tab */}
        {tab === 'upload' && (
          <div className="mb-4">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} className="hidden" />
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="w-full rounded-xl py-8 text-sm flex flex-col items-center gap-2 cursor-pointer transition-all"
              style={{ border: '2px dashed #e2e8f0', color: '#94a3b8' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2563eb'; (e.currentTarget as HTMLDivElement).style.color = '#2563eb'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.color = '#94a3b8'; }}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-8 h-8 text-[#2563eb]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span style={{ color: '#2563eb' }}>Upload en cours…</span>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  <span>Glisser-déposer ou cliquer pour choisir</span>
                  <span className="text-xs" style={{ color: '#cbd5e1' }}>JPG, PNG, WebP, GIF · max 5MB</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* URL tab */}
        {tab === 'url' && (
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setPreview(e.target.value) }}
            placeholder="https://exemple.com/image.jpg"
            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors mb-4"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
            onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            autoFocus
          />
        )}

        {/* Unsplash tab */}
        {tab === 'unsplash' && (
          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={unsplashQuery}
                onChange={(e) => setUnsplashQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnsplashSearch()}
                placeholder="restaurant, bureau, nature…"
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
                onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                autoFocus
              />
              <button
                onClick={handleUnsplashSearch}
                disabled={unsplashLoading || !unsplashQuery.trim()}
                className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40"
                style={{ background: '#2563eb' }}
                onMouseEnter={(e) => { if (!unsplashLoading) (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
              >
                {unsplashLoading ? '…' : 'Chercher'}
              </button>
            </div>

            {unsplashResults.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto rounded-xl">
                {unsplashResults.map((r, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={i}
                    src={r.preview}
                    alt={r.alt}
                    className="w-full h-20 object-cover rounded-lg cursor-pointer transition-all"
                    style={{ outline: 'none' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.outline = '2px solid #2563eb'; (e.currentTarget as HTMLImageElement).style.opacity = '0.85'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.outline = 'none'; (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                    onClick={() => { setUrl(r.full); setPreview(r.full); setTab('url') }}
                  />
                ))}
              </div>
            )}

            {unsplashLoading && (
              <div className="flex justify-center py-4">
                <svg className="animate-spin w-6 h-6 text-[#2563eb]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {preview && tab !== 'unsplash' && (
          <div
            className="mb-4 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ minHeight: 120, background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" className="max-h-40 max-w-full object-contain" onError={() => setPreview('')} />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#cbd5e1'; (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!url || uploading}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#2563eb' }}
            onMouseEnter={(e) => { if (url && !uploading) (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SiteEditor({ site, tokensUsed, tokensLimit }: Props) {
  const [html, setHtml] = useState(site.html_content)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [imgPopup, setImgPopup] = useState<{ src: string } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // AI Modify panel
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiInstruction, setAiInstruction] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [currentTokensUsed, setCurrentTokensUsed] = useState(tokensUsed)
  const currentTokensLimit = tokensLimit

  const TOKEN_COST_MODIFY = 8_000
  const isAdmin = tokensUsed === -1
  const tokensRemaining = isAdmin ? Infinity : Math.max(0, currentTokensLimit - currentTokensUsed)
  const canModify = isAdmin || tokensRemaining >= TOKEN_COST_MODIFY

  const handleAiModify = async () => {
    if (!aiInstruction.trim() || aiLoading) return
    setAiLoading(true)
    try {
      const res = await fetch(`/api/sites/${site.id}/ai-modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: aiInstruction.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.needsUpgrade) {
          toast.error(data.error, { duration: 6000, action: { label: 'Choisir un plan', onClick: () => window.location.href = '/pricing' } })
        } else {
          toast.error(data.error || 'Erreur lors de la modification')
        }
        return
      }
      setHtml(data.html)
      writeToIframe(data.html)
      setCurrentTokensUsed(data.tokensUsed)
      setAiInstruction('')
      toast.success('Site modifié avec succès !')
    } catch {
      toast.error('Erreur lors de la modification')
    } finally {
      setAiLoading(false)
    }
  }

  // Write HTML into the iframe — applies scroll fix + link guard on every write
  const writeToIframe = useCallback((content: string) => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.onload = () => injectVE(iframe)
    iframe.srcdoc = injectScrollFix(injectLinkGuard(content))
  }, [])

  // Initial load
  useEffect(() => {
    writeToIframe(html)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for messages from iframe
  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (!e.data) return

      if (e.data.type === 've-change' && typeof e.data.html === 'string') {
        const incoming = e.data.html as string
        setHtml(incoming.toLowerCase().startsWith('<!doctype') ? incoming : '<!DOCTYPE html>\n' + incoming)
      }

      if (e.data.type === 've-img-click') {
        setImgPopup({ src: e.data.src as string })
      }

      if (e.data.type === 've-mode') {
        setEditMode(e.data.on as boolean)
      }
    }
    window.addEventListener('message', handle)
    return () => window.removeEventListener('message', handle)
  }, [])

  const toggleEditMode = useCallback(() => {
    const next = !editMode
    setEditMode(next)
    iframeRef.current?.contentWindow?.postMessage({ type: 've-toggle', on: next }, '*')
  }, [editMode])

  const handleImgConfirm = useCallback((url: string) => {
    setImgPopup(null)
    iframeRef.current?.contentWindow?.postMessage({ type: 've-img-confirm', url }, '*')
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const clean = stripEditorMeta(html)
      const res = await fetch(`/api/sites/${site.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html_content: clean }),
      })
      if (!res.ok) throw new Error()
      setHtml(clean)
      toast.success('Site sauvegardé !')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      zip.file('index.html', sanitizeForOffline(stripEditorMeta(html)))
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${site.name.replace(/\s+/g, '-').toLowerCase()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Site téléchargé !')
    } catch {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setDownloading(false)
    }
  }, [html, site.name])

  const handleFullscreen = useCallback(() => {
    const clean = stripEditorMeta(html)
    const blob = new Blob([clean], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const w = window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
    if (!w) toast.error('Autorisez les popups pour le plein écran')
  }, [html])

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="h-14 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-3 md:px-4 flex-shrink-0 z-30 gap-2 shadow-sm">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link href="/dashboard" className="text-[#64748b] hover:text-[#0f172a] transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="hidden md:block h-5 w-px bg-[#e2e8f0]" />
          <h1 className="text-sm font-semibold text-[#0f172a] truncate max-w-[120px] md:max-w-xs">{site.name}</h1>
          {/* Token pill */}
          {!isAdmin && (() => {
            const pct = currentTokensLimit > 0 ? (tokensRemaining / currentTokensLimit) * 100 : 0
            const color = pct > 50 ? '#059669' : pct > 20 ? '#d97706' : '#dc2626'
            const bg    = pct > 50 ? '#ecfdf5'  : pct > 20 ? '#fffbeb'  : '#fef2f2'
            const border = pct > 50 ? '#a7f3d0' : pct > 20 ? '#fde68a'  : '#fecaca'
            return (
              <span
                className="hidden md:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: bg, border: `1px solid ${border}`, color }}
              >
                {tokensRemaining === Infinity ? '∞' : tokensRemaining.toLocaleString('fr-FR')} tokens
              </span>
            )
          })()}
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          {/* AI Modify */}
          <button
            onClick={() => setAiPanelOpen(o => !o)}
            className="flex items-center gap-1.5 text-sm px-2 md:px-3 py-1.5 rounded-lg border transition-all"
            style={aiPanelOpen
              ? { background: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' }
              : { background: 'white', borderColor: '#e2e8f0', color: '#64748b' }
            }
          >
            <span className="text-sm">✨</span>
            <span className="hidden sm:inline">Modifier</span>
          </button>

          {/* Edit mode toggle */}
          <button
            onClick={toggleEditMode}
            className="flex items-center gap-1.5 text-sm px-2 md:px-3 py-1.5 rounded-lg border transition-all"
            style={editMode
              ? { background: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' }
              : { background: 'white', borderColor: '#e2e8f0', color: '#64748b' }
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <span className="hidden sm:inline">{editMode ? 'Édition ON' : 'Édition OFF'}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            title="Ouvrir en plein écran"
            className="flex items-center gap-1.5 text-sm bg-white px-2 md:px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/>
            </svg>
            <span className="hidden md:inline">Plein écran</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="hidden sm:flex items-center gap-1.5 text-sm bg-white px-2 md:px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1] transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <span className="hidden md:inline">{downloading ? 'Préparation…' : 'Télécharger'}</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm bg-[#2563eb] hover:bg-[#1d4ed8] px-3 md:px-4 py-1.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            )}
            <span className="hidden sm:inline">{saving ? 'Sauvegarde…' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {/* ── Edit mode hint bar ── */}
      {editMode && (
        <div className="h-8 bg-[#eff6ff] border-b border-[#bfdbfe] flex items-center justify-center flex-shrink-0">
          <p className="text-xs text-[#2563eb]">
            ✏️ Mode édition actif — double-cliquez sur un texte ou une image pour le modifier
          </p>
        </div>
      )}

      {/* ── AI Modify panel ── */}
      {aiPanelOpen && (
        <div className="absolute right-0 top-14 bottom-0 w-80 bg-white border-l border-[#e2e8f0] flex flex-col z-20 shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span className="text-sm font-bold text-[#0f172a]">Modifier le site</span>
            </div>
            <button onClick={() => setAiPanelOpen(false)} className="text-[#94a3b8] hover:text-[#0f172a] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Token balance */}
            {!isAdmin && (
              <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0]">
                <p className="text-xs text-[#94a3b8] mb-1.5">Tokens restants</p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-[#0f172a]">
                    {tokensRemaining.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs text-[#94a3b8]">/ {currentTokensLimit.toLocaleString('fr-FR')}</span>
                </div>
                <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, 100 - (currentTokensUsed / currentTokensLimit) * 100)}%`,
                      background: tokensRemaining < TOKEN_COST_MODIFY * 2 ? '#ef4444' : '#2563eb',
                    }}
                  />
                </div>
                <p className="text-xs text-[#94a3b8] mt-1.5">
                  Coût : {TOKEN_COST_MODIFY.toLocaleString('fr-FR')} tokens par modification
                </p>
              </div>
            )}

            {isAdmin && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-xs text-amber-700">⚡ Mode admin — modifications illimitées</p>
              </div>
            )}

            {/* Instruction input */}
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-2">
                Décrivez les modifications souhaitées
              </label>
              <textarea
                value={aiInstruction}
                onChange={e => setAiInstruction(e.target.value)}
                placeholder={"Change la couleur principale en bleu\nAjoute une section témoignages\nRends le design plus moderne\nAjoute un formulaire de contact"}
                rows={6}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] focus:outline-none transition-colors resize-none"
                disabled={aiLoading}
              />
            </div>

            {/* Examples */}
            <div className="space-y-1.5">
              <p className="text-xs text-[#94a3b8] font-medium">Exemples rapides</p>
              {[
                'Change la couleur principale en bleu nuit',
                'Ajoute une section témoignages avec 3 avis',
                'Rends le design plus minimaliste',
                'Ajoute un footer avec les liens légaux',
              ].map(ex => (
                <button
                  key={ex}
                  onClick={() => setAiInstruction(ex)}
                  className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1] hover:bg-[#f8fafc] transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>

            {!canModify && !isAdmin && (
              <div className="bg-[#fef2f2] rounded-xl p-3 border border-[#fecaca]">
                <p className="text-xs text-red-600 mb-2">Tokens insuffisants pour une modification.</p>
                <a href="/pricing" className="block text-center text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] py-2 rounded-lg transition-colors">
                  Choisir un plan →
                </a>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#e2e8f0]">
            <button
              onClick={handleAiModify}
              disabled={!aiInstruction.trim() || aiLoading || (!isAdmin && !canModify)}
              className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Modification en cours…
                </>
              ) : (
                <>✨ Appliquer les modifications</>
              )}
            </button>
            {!isAdmin && (
              <p className="text-center text-xs text-[#94a3b8] mt-2">
                Coûte {TOKEN_COST_MODIFY.toLocaleString('fr-FR')} tokens
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Preview iframe ── */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full bg-white"
          title="Aperçu du site"
          sandbox="allow-scripts allow-same-origin"
          style={{ border: 'none' }}
        />
      </div>

      {/* ── Info bar ── */}
      <div className="h-7 bg-white border-t border-[#e2e8f0] flex items-center px-4 gap-4 flex-shrink-0">
        <span className="text-xs text-[#94a3b8] font-mono truncate">
          {site.prompt.slice(0, 120)}{site.prompt.length > 120 ? '…' : ''}
        </span>
        <span className="text-xs text-[#94a3b8] ml-auto flex-shrink-0">
          Créé le {new Date(site.created_at).toLocaleDateString('fr-FR')}
        </span>
      </div>

      {/* ── Image popup ── */}
      {imgPopup && (
        <ImagePopup
          siteId={site.id}
          currentSrc={imgPopup.src}
          onConfirm={handleImgConfirm}
          onClose={() => setImgPopup(null)}
        />
      )}
    </div>
  )
}

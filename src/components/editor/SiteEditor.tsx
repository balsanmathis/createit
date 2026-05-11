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

// Hover highlight style
var style=document.createElement('style');
style.id='__ve_style__';
document.head.appendChild(style);

function setMode(on){
  editMode=on;
  window.parent.postMessage({type:'ve-mode',on:on},'*');
  if(on){
    style.textContent='[data-ve-id]:hover{outline:2px solid rgba(124,111,250,0.6)!important;outline-offset:2px!important;cursor:pointer!important}';
  } else {
    style.textContent='';
    deactivate();
  }
}

// Listen for toggle from parent
window.addEventListener('message',function(e){
  if(e.data&&e.data.type==='ve-toggle') setMode(e.data.on);
  if(e.data&&e.data.type==='ve-img-confirm' && pendingImg){
    pendingImg.src=e.data.url;
    pendingImg=null;
    notify();
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
    window.parent.postMessage({type:'ve-img-click',src:el.getAttribute('src')||''},'*');
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

// Blur: deactivate when clicking outside
document.addEventListener('click',function(e){
  if(!editMode||!activeEl) return;
  if(!activeEl.contains(e.target)){
    deactivate();
  }
});

document.addEventListener('blur',function(e){
  if(activeEl && e.target===activeEl){
    // Don't deactivate on blur — user may click inside again
    notify();
  }
},true);

document.addEventListener('input',function(){
  notify();
});

// Expose toggle so parent can call without postMessage
window.veSetMode=setMode;
})()`

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
  currentSrc: string
  onConfirm: (url: string) => void
  onClose: () => void
}

function ImagePopup({ currentSrc, onConfirm, onClose }: ImagePopupProps) {
  const [tab, setTab] = useState<'url' | 'upload'>('url')
  const [url, setUrl] = useState(currentSrc)
  const [preview, setPreview] = useState(currentSrc)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      setUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleConfirm = () => {
    if (url) onConfirm(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative glass rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h3 className="text-base font-bold text-white mb-4">Remplacer l&apos;image</h3>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">
          {(['url', 'upload'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                tab === t ? 'bg-violet-500/30 text-violet-300' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t === 'url' ? '🔗 URL d\'image' : '📁 Uploader depuis PC'}
            </button>
          ))}
        </div>

        {tab === 'url' && (
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setPreview(e.target.value) }}
            placeholder="https://exemple.com/image.jpg"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-violet-500/40 focus:outline-none transition-colors mb-4"
            autoFocus
          />
        )}

        {tab === 'upload' && (
          <div className="mb-4">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/15 rounded-xl py-6 text-sm text-white/40 hover:border-violet-500/40 hover:text-white/60 transition-all flex flex-col items-center gap-2"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              Cliquer pour choisir un fichier
            </button>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center" style={{ minHeight: 120 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" className="max-h-40 max-w-full object-contain" onError={() => setPreview('')} />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!url}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white text-sm font-bold transition-all"
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

  // Write HTML into the iframe via srcdoc + scroll fix override
  const writeToIframe = useCallback((content: string) => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.onload = () => injectVE(iframe)
    iframe.srcdoc = injectScrollFix(content)
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
    <div className="h-screen bg-[#080810] text-white flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="h-14 glass border-b border-white/5 flex items-center justify-between px-3 md:px-4 flex-shrink-0 z-30 gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="hidden md:block h-5 w-px bg-white/10" />
          <h1 className="text-sm font-semibold text-white truncate max-w-[120px] md:max-w-xs">{site.name}</h1>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          {/* AI Modify */}
          <button
            onClick={() => setAiPanelOpen(o => !o)}
            className={`flex items-center gap-1.5 text-sm px-2 md:px-3 py-1.5 rounded-lg border transition-all ${
              aiPanelOpen
                ? 'bg-violet-600/30 border-violet-500/50 text-violet-200'
                : 'glass border-white/10 hover:border-violet-500/30 text-white/70 hover:text-white'
            }`}
          >
            <span className="text-sm">✨</span>
            <span className="hidden sm:inline">Modifier avec l&apos;IA</span>
          </button>

          {/* Edit mode toggle */}
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-1.5 text-sm px-2 md:px-3 py-1.5 rounded-lg border transition-all ${
              editMode
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'glass border-white/10 hover:border-violet-500/30 text-white/70 hover:text-white'
            }`}
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
            className="flex items-center gap-1.5 text-sm glass px-2 md:px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/30 text-white/70 hover:text-white transition-all"
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
            className="hidden sm:flex items-center gap-1.5 text-sm glass px-2 md:px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/30 text-white/70 hover:text-white transition-all disabled:opacity-50"
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
            className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-3 md:px-4 py-1.5 rounded-lg text-white font-medium transition-all disabled:opacity-50"
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
        <div className="h-8 bg-violet-500/10 border-b border-violet-500/20 flex items-center justify-center flex-shrink-0">
          <p className="text-xs text-violet-300/80">
            ✏️ Mode édition actif — double-cliquez sur un texte ou une image pour le modifier
          </p>
        </div>
      )}

      {/* ── AI Modify panel ── */}
      {aiPanelOpen && (
        <div className="absolute right-0 top-14 bottom-0 w-80 glass border-l border-white/10 flex flex-col z-20 shadow-2xl" style={{ background: 'rgba(8,8,20,0.97)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span className="text-sm font-bold text-white">Modifier avec l&apos;IA</span>
            </div>
            <button onClick={() => setAiPanelOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Token balance */}
            {!isAdmin && (
              <div className="glass rounded-xl p-3 border border-white/5">
                <p className="text-xs text-white/40 mb-1.5">Tokens restants</p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-white">
                    {tokensRemaining.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs text-white/30">/ {currentTokensLimit.toLocaleString('fr-FR')}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, 100 - (currentTokensUsed / currentTokensLimit) * 100)}%`,
                      background: tokensRemaining < TOKEN_COST_MODIFY * 2
                        ? 'linear-gradient(90deg, #ef4444, #f97316)'
                        : 'linear-gradient(90deg, #7c6dfa, #4f46e5)',
                    }}
                  />
                </div>
                <p className="text-xs text-white/25 mt-1.5">
                  Coût : {TOKEN_COST_MODIFY.toLocaleString('fr-FR')} tokens par modification
                </p>
              </div>
            )}

            {isAdmin && (
              <div className="glass rounded-xl p-3 border border-amber-500/20">
                <p className="text-xs text-amber-300">⚡ Mode admin — modifications illimitées</p>
              </div>
            )}

            {/* Instruction input */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">
                Décrivez les modifications souhaitées
              </label>
              <textarea
                value={aiInstruction}
                onChange={e => setAiInstruction(e.target.value)}
                placeholder={"Change la couleur principale en bleu\nAjoute une section témoignages\nRends le design plus moderne\nAjoute un formulaire de contact"}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-violet-500/40 focus:outline-none transition-colors resize-none"
                disabled={aiLoading}
              />
            </div>

            {/* Examples */}
            <div className="space-y-1.5">
              <p className="text-xs text-white/30 font-medium">Exemples rapides</p>
              {[
                'Change la couleur principale en bleu nuit',
                'Ajoute une section témoignages avec 3 avis',
                'Rends le design plus minimaliste',
                'Ajoute un footer avec les liens légaux',
              ].map(ex => (
                <button
                  key={ex}
                  onClick={() => setAiInstruction(ex)}
                  className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-white/5 text-white/40 hover:text-white/70 hover:border-violet-500/20 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>

            {!canModify && !isAdmin && (
              <div className="glass rounded-xl p-3 border border-red-500/20">
                <p className="text-xs text-red-400 mb-2">Tokens insuffisants pour une modification.</p>
                <a href="/pricing" className="block text-center text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 py-2 rounded-lg">
                  Choisir un plan →
                </a>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleAiModify}
              disabled={!aiInstruction.trim() || aiLoading || (!isAdmin && !canModify)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm"
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
              <p className="text-center text-xs text-white/20 mt-2">
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
      <div className="h-7 glass border-t border-white/5 flex items-center px-4 gap-4 flex-shrink-0">
        <span className="text-xs text-white/30 font-mono truncate">
          {site.prompt.slice(0, 120)}{site.prompt.length > 120 ? '…' : ''}
        </span>
        <span className="text-xs text-white/20 ml-auto flex-shrink-0">
          Créé le {new Date(site.created_at).toLocaleDateString('fr-FR')}
        </span>
      </div>

      {/* ── Image popup ── */}
      {imgPopup && (
        <ImagePopup
          currentSrc={imgPopup.src}
          onConfirm={handleImgConfirm}
          onClose={() => setImgPopup(null)}
        />
      )}
    </div>
  )
}

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
    .replace(/<div[^>]*id="__ve_tb__"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="__ve_rb__"[^>]*>[\s\S]*?<\/div>/gi, '')
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

const VE_SCRIPT = `(function(){
if(window.__ve)return;window.__ve=true;

// ── State ─────────────────────────────────────────────────────────────────────
var _em=false,_sel=null,_atext=null,_tb=null,_rb=null,_pImg=null,_addImg=false,_idc=0;

document.querySelectorAll('*').forEach(function(el){el.dataset.veId=++_idc;});

function _notify(){
  var h=document.documentElement.outerHTML
    .replace(/\\s*contenteditable="[^"]*"/gi,'')
    .replace(/\\s*data-ve-id="\\d+"/gi,'');
  window.parent.postMessage({type:'ve-change',html:h},'*');
}

// ── Toolbar cleanup ────────────────────────────────────────────────────────────
function _clear(){
  if(_sel){_sel.style.outline='';_sel.style.outlineOffset='';_sel=null;}
  if(_tb&&_tb.parentNode)_tb.parentNode.removeChild(_tb);
  if(_rb&&_rb.parentNode)_rb.parentNode.removeChild(_rb);
  _tb=null;_rb=null;
}

// ── Reposition toolbar under/above selected element ────────────────────────────
function _rePos(){
  if(!_tb||!_sel)return;
  var r=_sel.getBoundingClientRect();
  var tbH=_tb.offsetHeight||32;
  _tb.style.left=Math.max(2,r.left)+'px';
  _tb.style.top=Math.max(2,r.top-tbH-6)+'px';
  if(_rb){
    _rb.style.left=r.left+'px';
    _rb.style.top=r.top+'px';
    _rb.style.width=r.width+'px';
    _rb.style.height=r.height+'px';
  }
}

// ── Toolbar button factory ─────────────────────────────────────────────────────
function _btn(html,title,bg){
  var b=document.createElement('button');
  b.innerHTML=html;b.title=title||'';
  b.style.cssText='min-width:22px;height:22px;background:'+(bg||'rgba(255,255,255,0.18)')+';border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:700;color:#fff;display:inline-flex;align-items:center;justify-content:center;padding:0 5px;white-space:nowrap;transition:filter 0.1s;';
  b.addEventListener('mouseenter',function(){this.style.filter='brightness(1.2)';});
  b.addEventListener('mouseleave',function(){this.style.filter='';});
  return b;
}

// ── Show selection box + floating toolbar ──────────────────────────────────────
function _showSel(el){
  _clear();
  _sel=el;
  el.style.outline='2px solid #7c3aed';
  el.style.outlineOffset='1px';

  _tb=document.createElement('div');
  _tb.id='__ve_tb__';
  _tb.style.cssText='position:fixed;display:inline-flex;align-items:center;gap:2px;z-index:2147483647;background:#7c3aed;border-radius:7px;padding:3px 4px;box-shadow:0 4px 20px rgba(124,58,237,0.4);pointer-events:all;user-select:none;';

  // Drag handle
  var drag=_btn('⠿','Maintenir pour déplacer');
  drag.style.cursor='grab';
  drag.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();_startDrag(e,el);});
  _tb.appendChild(drag);

  // Separator
  function _sep(){var d=document.createElement('div');d.style.cssText='width:1px;height:14px;background:rgba(255,255,255,0.3);margin:0 1px;flex-shrink:0;';return d;}
  _tb.appendChild(_sep());

  // Z-index controls
  var zu=_btn('↑Z','Passer devant');
  zu.addEventListener('click',function(e){e.stopPropagation();_zAdj(el,1);});
  _tb.appendChild(zu);

  var zd=_btn('↓Z','Envoyer derrière');
  zd.addEventListener('click',function(e){e.stopPropagation();_zAdj(el,-1);});
  _tb.appendChild(zd);

  _tb.appendChild(_sep());

  // Duplicate
  var dup=_btn('⧉','Dupliquer');
  dup.addEventListener('click',function(e){e.stopPropagation();_dup(el);});
  _tb.appendChild(dup);

  // Delete
  var del=_btn('✕','Supprimer','rgba(220,38,38,0.85)');
  del.addEventListener('click',function(e){
    e.stopPropagation();
    if(el.parentNode)el.parentNode.removeChild(el);
    _clear();_notify();
  });
  _tb.appendChild(del);

  _tb.appendChild(_sep());

  // Link button
  var lnk=_btn('🔗','Modifier le lien');
  lnk.addEventListener('click',function(e){
    e.stopPropagation();
    var a=el.tagName==='A'?el:(el.closest?el.closest('a'):null);
    var hr=a?(a.getAttribute('href')||''):'';
    var tg=a?(a.getAttribute('target')||'_self'):'_self';
    window.parent.postMessage({type:'ve-link-click',href:hr,target:tg,hasLink:!!a},'*');
  });
  _tb.appendChild(lnk);

  // Anchor button
  var anc=_btn('#','Définir l\\'ID (ancre)','rgba(16,185,129,0.8)');
  anc.addEventListener('click',function(e){
    e.stopPropagation();
    window.parent.postMessage({type:'ve-anchor-click',currentId:el.id||''},'*');
  });
  _tb.appendChild(anc);

  document.body.appendChild(_tb);
  if(el.tagName==='IMG')_showRB(el);
  _rePos();
}

// ── Z-index control ────────────────────────────────────────────────────────────
function _zAdj(el,d){
  var cur=parseInt(window.getComputedStyle(el).zIndex)||0;
  if(isNaN(cur))cur=0;
  if(!el.style.position||el.style.position==='static')el.style.position='relative';
  el.style.zIndex=cur+d;
  window.parent.postMessage({type:'ve-zindex',val:el.style.zIndex},'*');
  _notify();
}

// ── Duplicate element ──────────────────────────────────────────────────────────
function _dup(el){
  var c=el.cloneNode(true);
  var m=c.style.transform&&c.style.transform.match(/translate\\(([^,]+)px,\\s*([^)]+)px\\)/);
  var dx=m?parseFloat(m[1]):0,dy=m?parseFloat(m[2]):0;
  c.style.transform='translate('+(dx+16)+'px,'+(dy+16)+'px)';
  if(!c.style.position||c.style.position==='static')c.style.position='relative';
  c.dataset.veId=++_idc;
  c.querySelectorAll('[data-ve-id]').forEach(function(ch){ch.dataset.veId=++_idc;});
  el.parentNode.insertBefore(c,el.nextSibling);
  _notify();_showSel(c);
}

// ── Image resize box (4 corner handles) ───────────────────────────────────────
function _showRB(img){
  _rb=document.createElement('div');
  _rb.id='__ve_rb__';
  _rb.style.cssText='position:fixed;pointer-events:none;z-index:2147483646;';
  [['se','se-resize','bottom:-5px','right:-5px'],
   ['sw','sw-resize','bottom:-5px','left:-5px'],
   ['ne','ne-resize','top:-5px','right:-5px'],
   ['nw','nw-resize','top:-5px','left:-5px']
  ].forEach(function(cfg){
    var h=document.createElement('div');
    h.style.cssText='position:absolute;width:10px;height:10px;background:#7c3aed;border:2px solid #fff;border-radius:2px;pointer-events:all;cursor:'+cfg[1]+';'+cfg[2]+';'+cfg[3]+';';
    h.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();_startImgResize(e,img,cfg[0]);});
    _rb.appendChild(h);
  });
  document.body.appendChild(_rb);
}

// ── Image resize drag ──────────────────────────────────────────────────────────
function _startImgResize(e,img,corner){
  var r=img.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,sw=r.width,sh=r.height;
  function mv(ev){
    var dx=ev.clientX-sx,dy=ev.clientY-sy,w=sw,h=sh;
    if(corner==='se'){w=Math.max(20,sw+dx);h=Math.max(20,sh+dy);}
    else if(corner==='sw'){w=Math.max(20,sw-dx);h=Math.max(20,sh+dy);}
    else if(corner==='ne'){w=Math.max(20,sw+dx);h=Math.max(20,sh-dy);}
    else{w=Math.max(20,sw-dx);h=Math.max(20,sh-dy);}
    img.style.width=w+'px';img.style.height=h+'px';
    if(!img.style.objectFit)img.style.objectFit='cover';
    _rePos();
  }
  function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);_notify();}
  document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
}

// ── Drag element with CSS transform ───────────────────────────────────────────
function _startDrag(e,el){
  var sx=e.clientX,sy=e.clientY;
  var m=el.style.transform&&el.style.transform.match(/translate\\(([^,]+)px,\\s*([^)]+)px\\)/);
  var ox=m?parseFloat(m[1]):0,oy=m?parseFloat(m[2]):0;
  if(!el.style.position||el.style.position==='static')el.style.position='relative';
  function mv(ev){
    var dx=ev.clientX-sx+ox,dy=ev.clientY-sy+oy;
    el.style.transform='translate('+dx+'px,'+dy+'px)';
    _rePos();
  }
  function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);_notify();}
  document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
}

// ── Deactivate text editing ────────────────────────────────────────────────────
function _dtxt(){
  if(_atext){
    _atext.contentEditable='false';
    _atext.style.outline='';_atext.style.outlineOffset='';
    _atext=null;_notify();
  }
}

// ── Mode CSS injection ─────────────────────────────────────────────────────────
var _vs=document.createElement('style');
_vs.id='__ve_style__';
document.head.appendChild(_vs);

function _setMode(on){
  _em=on;
  window.parent.postMessage({type:'ve-mode',on:on},'*');
  if(on){
    _vs.textContent='[data-ve-id]:hover{outline:1px solid rgba(124,111,250,0.5)!important;outline-offset:1px!important;cursor:pointer!important;}#__ve_tb__,#__ve_tb__ *,#__ve_rb__,#__ve_rb__ *{outline:none!important;cursor:auto!important;}';
  }else{
    _vs.textContent='';
    _clear();_dtxt();
  }
}

// ── Text/block tag sets ────────────────────────────────────────────────────────
var TT=['P','H1','H2','H3','H4','H5','H6','SPAN','A','LI','TD','TH','BUTTON','LABEL','STRONG','EM','B','I','SMALL','CITE','DT','DD','FIGCAPTION'];
var BT=['DIV','SECTION','ARTICLE','HEADER','FOOTER','NAV','MAIN','UL','OL','TABLE','THEAD','TBODY','TR','FORM','FIGURE'];
function _hbc(el){for(var i=0;i<el.children.length;i++)if(BT.indexOf(el.children[i].tagName)!==-1)return true;return false;}

// ── Click → select element ─────────────────────────────────────────────────────
document.addEventListener('click',function(e){
  if(!_em)return;
  if(_tb&&_tb.contains(e.target))return;
  if(_rb&&_rb.contains(e.target))return;
  var el=e.target;
  if(!el||el===document.documentElement||el===document.body){_clear();return;}
  if(_atext&&!_atext.contains(el))_dtxt();
  e.stopPropagation();
  if(_sel!==el)_showSel(el);
},true);

// ── Double-click → text edit or image replace ──────────────────────────────────
document.addEventListener('dblclick',function(e){
  if(!_em)return;
  if(_tb&&_tb.contains(e.target))return;
  if(_rb&&_rb.contains(e.target))return;
  var el=e.target;if(!el)return;

  if(el.tagName==='IMG'){
    e.preventDefault();e.stopPropagation();
    _pImg=el;_addImg=false;
    window.parent.postMessage({type:'ve-img-click',src:el.getAttribute('src')||'',isPlaceholder:false},'*');
    return;
  }

  var node=el;
  while(node&&node!==document.body){
    if(TT.indexOf(node.tagName)!==-1&&!_hbc(node)){
      e.preventDefault();e.stopPropagation();
      _dtxt();
      _atext=node;node.contentEditable='true';
      node.style.outline='2px dashed #7c3aed';node.style.outlineOffset='2px';
      node.focus();
      try{var rc=document.createRange(),sc=window.getSelection();rc.selectNodeContents(node);sc.removeAllRanges();sc.addRange(rc);}catch(x){}
      return;
    }
    node=node.parentElement;
  }
},true);

document.addEventListener('blur',function(e){if(_atext&&e.target===_atext)_dtxt();},true);
document.addEventListener('input',function(){_notify();});

// ── Scroll/resize → update toolbar position ────────────────────────────────────
window.addEventListener('scroll',_rePos,true);
window.addEventListener('resize',_rePos);

// ── Parent messages ────────────────────────────────────────────────────────────
window.addEventListener('message',function(e){
  if(!e.data)return;

  if(e.data.type==='ve-toggle')_setMode(e.data.on);

  if(e.data.type==='ve-img-confirm'){
    if(_pImg){_pImg.src=e.data.url;_pImg=null;_notify();}
    else if(_addImg){
      var img=document.createElement('img');
      img.src=e.data.url;img.alt='Image';
      img.style.cssText='width:300px;height:200px;object-fit:cover;display:block;border-radius:4px;position:relative;';
      img.dataset.veId=++_idc;
      document.body.appendChild(img);
      _addImg=false;_notify();_showSel(img);
    }
  }

  if(e.data.type==='ve-add-text'){
    var div=document.createElement('div');
    div.textContent='Votre texte ici';
    div.style.cssText='position:relative;display:inline-block;padding:10px 16px;font-size:18px;color:#111111;background:rgba(255,255,255,0.95);border-radius:6px;min-width:100px;box-shadow:0 2px 10px rgba(0,0,0,0.14);margin:8px;';
    div.dataset.veId=++_idc;
    document.body.appendChild(div);
    _notify();_showSel(div);
    _atext=div;div.contentEditable='true';
    div.style.outline='2px dashed #7c3aed';div.style.outlineOffset='2px';
    div.focus();
    try{var rt=document.createRange(),st=window.getSelection();rt.selectNodeContents(div);st.removeAllRanges();st.addRange(rt);}catch(x){}
  }

  if(e.data.type==='ve-add-image'){
    _addImg=true;
    window.parent.postMessage({type:'ve-img-click',src:'',isPlaceholder:false},'*');
  }

  if(e.data.type==='ve-link-confirm'){
    var hr2=e.data.href||'';var tg2=e.data.target||'_self';var rm=e.data.remove;
    if(_sel){
      var existA=_sel.tagName==='A'?_sel:(_sel.closest?_sel.closest('a'):null);
      if(rm){
        if(existA&&existA.parentNode){
          while(existA.firstChild)existA.parentNode.insertBefore(existA.firstChild,existA);
          existA.parentNode.removeChild(existA);
          _clear();
        } else { _sel.removeAttribute('href'); }
      } else if(existA){
        existA.setAttribute('href',hr2);
        if(tg2==='_blank'){existA.setAttribute('target','_blank');existA.setAttribute('rel','noopener noreferrer');}
        else{existA.removeAttribute('target');existA.removeAttribute('rel');}
      } else {
        var newA2=document.createElement('a');
        newA2.setAttribute('href',hr2);
        if(tg2==='_blank'){newA2.setAttribute('target','_blank');newA2.setAttribute('rel','noopener noreferrer');}
        newA2.style.textDecoration='none';newA2.style.color='inherit';
        newA2.dataset.veId=String(++_idc);
        _sel.parentNode.insertBefore(newA2,_sel);newA2.appendChild(_sel);
        _showSel(newA2);
      }
      _notify();
    }
  }

  if(e.data.type==='ve-anchor-confirm'){
    if(_sel){
      if(e.data.id){_sel.id=e.data.id;}else{_sel.removeAttribute('id');}
      _notify();
    }
  }

  if(e.data.type==='ve-get-anchors'){
    var anchors2=[];
    document.querySelectorAll('[id]').forEach(function(ae){
      if(ae.id&&!ae.id.startsWith('__'))anchors2.push({id:ae.id,tag:ae.tagName.toLowerCase()});
    });
    window.parent.postMessage({type:'ve-anchors',anchors:anchors2},'*');
  }
});

window.veSetMode=_setMode;
})()`

const LINK_GUARD_SCRIPT = `(function(){
document.addEventListener('click',function(e){
  var link=e.target.closest('a');
  if(!link)return;
  var href=link.getAttribute('href');
  if(!href){e.preventDefault();return;}
  if(href.startsWith('tel:')||href.startsWith('mailto:'))return;
  if(href.startsWith('#')){
    e.preventDefault();
    var t=document.querySelector(href);
    if(t)t.scrollIntoView({behavior:'smooth'});
    return;
  }
  if(href.startsWith('http')||href.startsWith('//')||href==='/'){e.preventDefault();return;}
  e.preventDefault();
  var t=document.querySelector(href);
  if(t)t.scrollIntoView({behavior:'smooth'});
});
document.addEventListener('submit',function(e){
  e.preventDefault();
  var form=e.target;
  var btn=form.querySelector('button[type="submit"],input[type="submit"],button:not([type])');
  var nameEl=form.querySelector('[id*=name],[id*=nom],[placeholder*=nom],[placeholder*=Nom],[id*=f-name]');
  var name=nameEl?nameEl.value:'';
  var firstName=name?name.split(' ')[0]:'';
  if(!btn)return;
  var orig=btn.tagName==='INPUT'?btn.value:(btn.textContent||'');
  var msg='✓ Envoy\xe9 !'+(firstName?' Merci '+firstName+' !':'');
  if(btn.tagName==='INPUT')btn.value=msg;
  else btn.textContent=msg;
  setTimeout(function(){if(btn.tagName==='INPUT')btn.value=orig;else btn.textContent=orig;},4000);
});
})();`

function injectLinkGuard(html: string): string {
  const tag = '<script id="__link_guard__">' + LINK_GUARD_SCRIPT + '</' + 'script>'
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
    if (file.size > 5 * 1024 * 1024) { toast.error('Fichier trop volumineux (max 5MB)'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('siteId', siteId)
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur upload')
      setUrl(data.url); setPreview(data.url)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  const handleUnsplashSearch = async () => {
    if (!unsplashQuery.trim()) return
    setUnsplashLoading(true); setUnsplashResults([])
    try {
      const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
      if (key) {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(unsplashQuery)}&per_page=9&client_id=${key}`)
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

  const TABS = [
    { id: 'upload' as const, label: '📁 Uploader' },
    { id: 'url' as const, label: '🔗 URL' },
    { id: 'unsplash' as const, label: '🌄 Unsplash' },
  ]

  const inputBase: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--fg)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div
        className="relative rounded-xl p-6 w-full max-w-lg"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: 'var(--fg-subtle)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-subtle)')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--fg)' }}>Ajouter une image</h3>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 rounded-lg p-1" style={{ background: 'var(--bg)' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-1.5 text-xs font-medium rounded-md transition-all"
              style={tab === t.id
                ? { background: 'var(--surface)', color: 'var(--accent)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
                : { color: 'var(--fg-muted)' }
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
              style={{ border: '2px dashed var(--border)', color: 'var(--fg-subtle)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--accent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--fg-subtle)' }}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span style={{ color: 'var(--accent)' }}>Upload en cours…</span>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Glisser-déposer ou cliquer pour choisir</span>
                  <span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>JPG, PNG, WebP, GIF · max 5MB</span>
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
            onChange={e => { setUrl(e.target.value); setPreview(e.target.value) }}
            placeholder="https://exemple.com/image.jpg"
            style={{ ...inputBase, marginBottom: 16 }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
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
                onChange={e => setUnsplashQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnsplashSearch()}
                placeholder="restaurant, bureau, nature…"
                style={{ ...inputBase, padding: '8px 12px', flex: 1, width: 'auto' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                autoFocus
              />
              <button
                onClick={handleUnsplashSearch}
                disabled={unsplashLoading || !unsplashQuery.trim()}
                className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-opacity disabled:opacity-40"
                style={{ background: 'var(--accent)' }}
                onMouseEnter={e => { if (!unsplashLoading) e.currentTarget.style.background = 'var(--accent-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
              >
                {unsplashLoading ? '…' : 'Chercher'}
              </button>
            </div>

            {unsplashResults.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto rounded-xl">
                {unsplashResults.map((r, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={r.preview}
                    alt={r.alt}
                    className="w-full h-20 object-cover rounded-lg cursor-pointer transition-opacity"
                    onClick={() => { setUrl(r.full); setPreview(r.full); setTab('url') }}
                    onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.outline = '2px solid var(--accent)'; (e.currentTarget as HTMLImageElement).style.opacity = '0.85' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.outline = 'none'; (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
                  />
                ))}
              </div>
            )}

            {unsplashLoading && (
              <div className="flex justify-center py-4">
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {preview && tab !== 'unsplash' && (
          <div
            className="mb-4 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ minHeight: 120, background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" className="max-h-40 max-w-full object-contain" onError={() => setPreview('')} />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
          >
            Annuler
          </button>
          <button
            onClick={() => { if (url) onConfirm(url) }}
            disabled={!url || uploading}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)' }}
            onMouseEnter={e => { if (url && !uploading) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Link popup ───────────────────────────────────────────────────────────────

interface LinkPopupProps {
  href: string
  target: string
  hasLink: boolean
  anchors: { id: string; tag: string }[]
  onConfirm: (href: string, target: string) => void
  onRemove: () => void
  onClose: () => void
}

function LinkPopup({ href: initHref, target: initTarget, hasLink, anchors, onConfirm, onRemove, onClose }: LinkPopupProps) {
  const [href, setHref] = useState(initHref)
  const [newTab, setNewTab] = useState(initTarget === '_blank')

  const inputBase: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)',
    borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%',
  }

  const prefixes = ['https://', '#', 'mailto:', 'tel:']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div className="relative rounded-xl p-6 w-full max-w-md space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--fg-subtle)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>🔗 Modifier le lien</h3>

        {/* Prefix shortcuts */}
        <div className="flex gap-1.5 flex-wrap">
          {prefixes.map(p => (
            <button key={p} onClick={() => setHref(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
              style={href.startsWith(p) ? { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.3)' } : { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >{p}</button>
          ))}
        </div>

        {/* URL input */}
        <input
          type="text"
          value={href}
          onChange={e => setHref(e.target.value)}
          placeholder="https://exemple.com ou #section-id"
          style={inputBase}
          autoFocus
          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        />

        {/* Page anchors */}
        {anchors.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--fg-muted)' }}>Sections de cette page :</p>
            <div className="flex flex-wrap gap-1.5">
              {anchors.map(a => (
                <button key={a.id} onClick={() => setHref('#' + a.id)}
                  className="px-2 py-1 rounded-md text-xs font-mono transition-all"
                  style={href === '#' + a.id ? { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.3)' } : { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                >#{a.id}</button>
              ))}
            </div>
          </div>
        )}

        {/* Target toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={newTab} onChange={e => setNewTab(e.target.checked)} style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
          <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>Ouvrir dans un nouvel onglet</span>
        </label>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {hasLink && (
            <button onClick={onRemove} className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
              Supprimer le lien
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
            Annuler
          </button>
          <button onClick={() => href && onConfirm(href, newTab ? '_blank' : '_self')}
            disabled={!href}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40"
            style={{ background: 'var(--accent)' }}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Anchor popup ─────────────────────────────────────────────────────────────

interface AnchorPopupProps {
  currentId: string
  onConfirm: (id: string) => void
  onClose: () => void
}

function AnchorPopup({ currentId, onConfirm, onClose }: AnchorPopupProps) {
  const [id, setId] = useState(currentId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div className="relative rounded-xl p-6 w-full max-w-sm space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
        <h3 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>⚓ Ancre de section</h3>
        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
          Définissez un identifiant unique sur cet élément. Les boutons pourront pointer vers lui avec <code style={{ background: 'var(--bg)', padding: '1px 4px', borderRadius: 4 }}>#identifiant</code>.
        </p>
        <input
          type="text"
          value={id}
          onChange={e => setId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
          placeholder="ex: contact, services, tarifs…"
          autoFocus
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        />
        {id && <p className="text-xs font-mono" style={{ color: 'var(--accent)' }}>Lien : #{id}</p>}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
            Annuler
          </button>
          <button onClick={() => onConfirm(id)} className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>
            {id ? 'Confirmer' : 'Supprimer l\'ancre'}
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
  const [linkPopup, setLinkPopup] = useState<{ href: string; target: string; hasLink: boolean } | null>(null)
  const [anchorPopup, setAnchorPopup] = useState<{ currentId: string } | null>(null)
  const [pageAnchors, setPageAnchors] = useState<{ id: string; tag: string }[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)

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
          toast.error(data.error, { duration: 6000, action: { label: 'Choisir un plan', onClick: () => window.location.href = '/tarifs' } })
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

  const writeToIframe = useCallback((content: string) => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.onload = () => injectVE(iframe)
    iframe.srcdoc = injectScrollFix(injectLinkGuard(content))
  }, [])

  useEffect(() => {
    writeToIframe(html)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (!e.data) return
      if (e.data.type === 've-change' && typeof e.data.html === 'string') {
        const incoming = e.data.html as string
        setHtml(incoming.toLowerCase().startsWith('<!doctype') ? incoming : '<!DOCTYPE html>\n' + incoming)
      }
      if (e.data.type === 've-img-click') setImgPopup({ src: e.data.src as string })
      if (e.data.type === 've-mode') setEditMode(e.data.on as boolean)
      if (e.data.type === 've-link-click') {
        setLinkPopup({ href: e.data.href as string, target: e.data.target as string, hasLink: e.data.hasLink as boolean })
        iframeRef.current?.contentWindow?.postMessage({ type: 've-get-anchors' }, '*')
      }
      if (e.data.type === 've-anchors') setPageAnchors(e.data.anchors as { id: string; tag: string }[])
      if (e.data.type === 've-anchor-click') setAnchorPopup({ currentId: e.data.currentId as string })
    }
    window.addEventListener('message', handle)
    return () => window.removeEventListener('message', handle)
  }, [])

  const toggleEditMode = useCallback(() => {
    const next = !editMode
    setEditMode(next)
    iframeRef.current?.contentWindow?.postMessage({ type: 've-toggle', on: next }, '*')
  }, [editMode])

  const addTextZone = useCallback(() => {
    if (!editMode) {
      setEditMode(true)
      iframeRef.current?.contentWindow?.postMessage({ type: 've-toggle', on: true }, '*')
    }
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: 've-add-text' }, '*')
    }, editMode ? 0 : 80)
  }, [editMode])

  const addImageZone = useCallback(() => {
    if (!editMode) {
      setEditMode(true)
      iframeRef.current?.contentWindow?.postMessage({ type: 've-toggle', on: true }, '*')
    }
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: 've-add-image' }, '*')
    }, editMode ? 0 : 80)
  }, [editMode])

  const handleImgConfirm = useCallback((url: string) => {
    setImgPopup(null)
    iframeRef.current?.contentWindow?.postMessage({ type: 've-img-confirm', url }, '*')
  }, [])

  const handleLinkConfirm = useCallback((href: string, target: string) => {
    setLinkPopup(null)
    iframeRef.current?.contentWindow?.postMessage({ type: 've-link-confirm', href, target, remove: false }, '*')
  }, [])

  const handleLinkRemove = useCallback(() => {
    setLinkPopup(null)
    iframeRef.current?.contentWindow?.postMessage({ type: 've-link-confirm', href: '', target: '', remove: true }, '*')
  }, [])

  const handleAnchorConfirm = useCallback((id: string) => {
    setAnchorPopup(null)
    iframeRef.current?.contentWindow?.postMessage({ type: 've-anchor-confirm', id }, '*')
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

  // Token pill color
  const tokenPillColor = (() => {
    if (isAdmin) return null
    const pct = currentTokensLimit > 0 ? (tokensRemaining / currentTokensLimit) * 100 : 0
    return {
      color: pct > 50 ? '#059669' : pct > 20 ? '#d97706' : '#dc2626',
      bg:    pct > 50 ? 'rgba(5,150,105,0.1)' : pct > 20 ? 'rgba(217,119,6,0.1)' : 'rgba(220,38,38,0.1)',
      border: pct > 50 ? 'rgba(5,150,105,0.3)' : pct > 20 ? 'rgba(217,119,6,0.3)' : 'rgba(220,38,38,0.3)',
    }
  })()

  const btnToolStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--fg-muted)',
    borderRadius: 8,
  }
  const btnToolActiveStyle: React.CSSProperties = {
    background: 'var(--accent-light)',
    border: '1px solid rgba(124,58,237,0.25)',
    color: 'var(--accent)',
    borderRadius: 8,
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Top bar ── */}
      <div
        className="h-14 flex items-center justify-between px-3 md:px-4 flex-shrink-0 z-30 gap-2"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link
            href="/dashboard"
            className="flex-shrink-0 transition-colors"
            style={{ color: 'var(--fg-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="hidden md:block h-5 w-px" style={{ background: 'var(--border)' }} />
          <h1 className="text-sm font-semibold truncate max-w-[120px] md:max-w-xs" style={{ color: 'var(--fg)' }}>{site.name}</h1>
          {/* Token pill */}
          {tokenPillColor && (
            <span
              className="hidden md:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: tokenPillColor.bg, border: `1px solid ${tokenPillColor.border}`, color: tokenPillColor.color }}
            >
              {tokensRemaining === Infinity ? '∞' : tokensRemaining.toLocaleString('fr-FR')} tokens
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          {/* AI Modify */}
          <button
            onClick={() => setAiPanelOpen(o => !o)}
            className="flex items-center gap-1.5 text-sm px-2 md:px-3 py-1.5 transition-all"
            style={aiPanelOpen ? btnToolActiveStyle : btnToolStyle}
          >
            <span className="text-sm">✨</span>
            <span className="hidden sm:inline">Modifier</span>
          </button>

          {/* Edit mode toggle */}
          <button
            onClick={toggleEditMode}
            className="flex items-center gap-1.5 text-sm px-2 md:px-3 py-1.5 transition-all"
            style={editMode ? btnToolActiveStyle : btnToolStyle}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">{editMode ? 'Édition ON' : 'Édition OFF'}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            title="Ouvrir en plein écran"
            className="flex items-center gap-1.5 text-sm px-2 md:px-3 py-1.5 transition-all"
            style={btnToolStyle}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <span className="hidden md:inline">Plein écran</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="hidden sm:flex items-center gap-1.5 text-sm px-2 md:px-3 py-1.5 transition-all disabled:opacity-50"
            style={btnToolStyle}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden md:inline">{downloading ? 'Préparation…' : 'Télécharger'}</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm px-3 md:px-4 py-1.5 rounded-lg text-white font-medium transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent)', borderRadius: 8 }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            {saving ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="hidden sm:inline">{saving ? 'Sauvegarde…' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {/* ── Edit mode hint bar ── */}
      {editMode && (
        <div
          className="h-10 flex items-center justify-between px-3 flex-shrink-0 gap-3"
          style={{ background: 'var(--accent-light)', borderBottom: '1px solid rgba(124,58,237,0.2)' }}
        >
          <p className="text-xs hidden sm:block flex-shrink-0" style={{ color: 'var(--accent)' }}>
            ✏️ Clic = sélectionner · double-clic = modifier texte/image
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={addTextZone}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-all"
              style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
              title="Ajouter une zone de texte"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Texte
            </button>
            <button
              onClick={addImageZone}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-all"
              style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.3)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.25)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.15)' }}
              title="Ajouter une image"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Image
            </button>
            <div style={{ width: 1, height: 14, background: 'rgba(124,58,237,0.3)', margin: '0 2px' }} />
            <span className="text-xs hidden sm:inline" style={{ color: 'rgba(124,58,237,0.7)' }}>Sélectionner → 🔗 ou #</span>
          </div>
        </div>
      )}

      {/* ── AI Modify panel ── */}
      {aiPanelOpen && (
        <div
          className="absolute right-0 top-14 bottom-0 w-80 flex flex-col z-20"
          style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Modifier le site</span>
            </div>
            <button
              onClick={() => setAiPanelOpen(false)}
              style={{ color: 'var(--fg-subtle)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-subtle)')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Token balance */}
            {!isAdmin && (
              <div className="rounded-xl p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-1.5" style={{ color: 'var(--fg-subtle)' }}>Tokens restants</p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
                    {tokensRemaining.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>/ {currentTokensLimit.toLocaleString('fr-FR')}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, 100 - (currentTokensUsed / currentTokensLimit) * 100)}%`,
                      background: tokensRemaining < TOKEN_COST_MODIFY * 2 ? '#ef4444' : 'var(--accent)',
                    }}
                  />
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'var(--fg-subtle)' }}>
                  Coût : {TOKEN_COST_MODIFY.toLocaleString('fr-FR')} tokens par modification
                </p>
              </div>
            )}

            {isAdmin && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <p className="text-xs" style={{ color: '#b45309' }}>⚡ Mode admin — modifications illimitées</p>
              </div>
            )}

            {/* Instruction input */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--fg-muted)' }}>
                Décrivez les modifications souhaitées
              </label>
              <textarea
                value={aiInstruction}
                onChange={e => setAiInstruction(e.target.value)}
                placeholder={"Change la couleur principale en bleu\nAjoute une section témoignages\nRends le design plus moderne\nAjoute un formulaire de contact"}
                rows={6}
                className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-opacity-50 outline-none transition-colors resize-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                  borderRadius: 12,
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                disabled={aiLoading}
              />
            </div>

            {/* Quick examples */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium" style={{ color: 'var(--fg-subtle)' }}>Exemples rapides</p>
              {[
                'Change la couleur principale en bleu nuit',
                'Ajoute une section témoignages avec 3 avis',
                'Rends le design plus minimaliste',
                'Ajoute un footer avec les liens légaux',
              ].map(ex => (
                <button
                  key={ex}
                  onClick={() => setAiInstruction(ex)}
                  className="block w-full text-left text-xs px-3 py-2 rounded-lg transition-all"
                  style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)', background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  {ex}
                </button>
              ))}
            </div>

            {!canModify && !isAdmin && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <p className="text-xs mb-2" style={{ color: '#dc2626' }}>Tokens insuffisants pour une modification.</p>
                <a
                  href="/tarifs"
                  className="block text-center text-xs font-semibold text-white py-2 rounded-lg transition-opacity"
                  style={{ background: 'var(--accent)' }}
                >
                  Choisir un plan →
                </a>
              </div>
            )}
          </div>

          <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleAiModify}
              disabled={!aiInstruction.trim() || aiLoading || (!isAdmin && !canModify)}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => { if (!aiLoading) e.currentTarget.style.background = 'var(--accent-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Modification en cours…
                </>
              ) : '✨ Appliquer les modifications'}
            </button>
            {!isAdmin && (
              <p className="text-center text-xs mt-2" style={{ color: 'var(--fg-subtle)' }}>
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
          className="absolute inset-0 w-full h-full"
          title="Aperçu du site"
          sandbox="allow-scripts allow-same-origin"
          style={{ border: 'none', background: '#fff' }}
        />
      </div>

      {/* ── Info bar ── */}
      <div
        className="h-7 flex items-center px-4 gap-4 flex-shrink-0"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        <span className="text-xs font-mono truncate" style={{ color: 'var(--fg-subtle)' }}>
          {site.prompt.slice(0, 120)}{site.prompt.length > 120 ? '…' : ''}
        </span>
        <span className="text-xs ml-auto flex-shrink-0" style={{ color: 'var(--fg-subtle)' }}>
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

      {/* ── Link popup ── */}
      {linkPopup && (
        <LinkPopup
          href={linkPopup.href}
          target={linkPopup.target}
          hasLink={linkPopup.hasLink}
          anchors={pageAnchors}
          onConfirm={handleLinkConfirm}
          onRemove={handleLinkRemove}
          onClose={() => setLinkPopup(null)}
        />
      )}

      {/* ── Anchor popup ── */}
      {anchorPopup && (
        <AnchorPopup
          currentId={anchorPopup.currentId}
          onConfirm={handleAnchorConfirm}
          onClose={() => setAnchorPopup(null)}
        />
      )}
    </div>
  )
}

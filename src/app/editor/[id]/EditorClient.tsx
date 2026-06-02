'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  sanitizeForOffline,
  injectScrollFix,
  injectLinkGuard,
} from '@/lib/editor/ve-script'
import ImageManager, { type ImageManagerMode } from '@/components/editor/ImageManager'

// ─── New VE_SCRIPT ─────────────────────────────────────────────────────────────

const NEW_VE_SCRIPT = `(function(){
if(window.__ve_new)return;window.__ve_new=true;
var ss=document.createElement('style');ss.id='__ve_sel_style__';
ss.textContent='[data-ve-selected]{outline:2px solid #2563eb!important;outline-offset:2px!important}[data-ve-hovered]:not([data-ve-selected]){outline:2px dashed rgba(37,99,235,0.5)!important;outline-offset:2px!important}';
document.head.appendChild(ss);
var sel=null,hov=null,editMode=false;
function getPath(el){
  if(!el||el===document.body)return 'body';
  var path=[],cur=el;
  while(cur&&cur!==document.body){
    var par=cur.parentElement;if(!par)break;
    var idx=Array.from(par.children).indexOf(cur)+1;
    path.unshift(cur.tagName.toLowerCase()+':nth-child('+idx+')');
    cur=par;
  }
  return 'body > '+path.join(' > ');
}
function notify(){window.parent.postMessage({type:'ve-change',html:document.documentElement.outerHTML},'*');}
function setEditMode(v){
  editMode=v;
  document.body.style.cursor=v?'crosshair':'';
  var b=document.getElementById('__ve_banner__');if(b)b.style.display=v?'block':'none';
  if(!v){
    if(sel){sel.removeAttribute('data-ve-selected');sel=null;}
    if(hov){hov.removeAttribute('data-ve-hovered');hov=null;}
  }
}
document.addEventListener('mouseover',function(e){
  if(!editMode)return;
  if(hov)hov.removeAttribute('data-ve-hovered');
  hov=e.target;
  if(hov!==sel)hov.setAttribute('data-ve-hovered','');
},true);
document.addEventListener('mouseout',function(e){
  if(!editMode)return;
  if(e.target)e.target.removeAttribute('data-ve-hovered');
},true);
document.addEventListener('click',function(e){
  if(!editMode)return;
  e.preventDefault();e.stopPropagation();
  var el=e.target;
  if(!el||el===document.documentElement)return;
  if(sel&&sel!==el)sel.removeAttribute('data-ve-selected');
  sel=el;sel.setAttribute('data-ve-selected','');
  el.removeAttribute('data-ve-hovered');
  var cs=window.getComputedStyle(el);
  window.parent.postMessage({type:'ELEMENT_SELECTED',path:getPath(el),data:{
    tag:el.tagName,id:el.id||'',classes:typeof el.className==='string'?el.className:'',
    text:el.textContent?el.textContent.trim().substring(0,500):'',
    isImage:el.tagName==='IMG',src:el.tagName==='IMG'?(el.src||el.getAttribute('src')||''):'',
    style:el.getAttribute('style')||'',
    computedColor:cs.color,computedBg:cs.backgroundColor,
    computedFontSize:cs.fontSize,computedFontWeight:cs.fontWeight,
    computedFontStyle:cs.fontStyle,computedTextAlign:cs.textAlign,
    computedPaddingTop:cs.paddingTop,computedPaddingRight:cs.paddingRight,
    computedPaddingBottom:cs.paddingBottom,computedPaddingLeft:cs.paddingLeft,
    computedMarginTop:cs.marginTop,computedMarginRight:cs.marginRight,
    computedMarginBottom:cs.marginBottom,computedMarginLeft:cs.marginLeft,
    computedWidth:cs.width,computedHeight:cs.height,
    computedBorderRadius:cs.borderRadius,computedOpacity:cs.opacity,
    computedObjectFit:cs.objectFit||'cover',computedMinHeight:cs.minHeight,
  }},'*');
},true);
function enableEdit(el,path){
  el.contentEditable='true';el.focus();
  try{var r=document.createRange(),s=window.getSelection();r.selectNodeContents(el);s.removeAllRanges();s.addRange(r);}catch(x){}
  function onBlur(){
    el.removeEventListener('blur',onBlur);
    el.contentEditable='false';
    window.parent.postMessage({type:'TEXT_CHANGED',path:path,text:el.textContent},'*');
    notify();
  }
  el.addEventListener('blur',onBlur);
}
document.addEventListener('dblclick',function(e){
  if(!editMode)return;
  e.preventDefault();e.stopPropagation();
  var el=e.target;
  if(!el||el.tagName==='IMG'||el===document.documentElement||el===document.body)return;
  enableEdit(el,getPath(el));
},true);
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    var ed=document.querySelector('[contenteditable="true"]');
    if(ed)ed.blur();
    else if(sel){sel.removeAttribute('data-ve-selected');sel=null;window.parent.postMessage({type:'SELECTION_CLEARED'},'*');}
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();window.parent.postMessage({type:'KEYBOARD_SAVE'},'*');}
  if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){
    var ed=document.querySelector('[contenteditable="true"]');
    if(!ed){e.preventDefault();window.parent.postMessage({type:'KEYBOARD_UNDO'},'*');}
  }
  if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){
    var ed=document.querySelector('[contenteditable="true"]');
    if(!ed){e.preventDefault();window.parent.postMessage({type:'KEYBOARD_REDO'},'*');}
  }
});
window.addEventListener('message',function(e){
  if(!e.data)return;
  var d=e.data;
  if(d.type==='SET_MODE'){setEditMode(d.mode==='edit');}
  if(d.type==='APPLY_STYLE'){var el=document.querySelector(d.path);if(el){Object.assign(el.style,d.styles);notify();}}
  if(d.type==='APPLY_TEXT'){var el=document.querySelector(d.path);if(el){el.textContent=d.text;notify();}}
  if(d.type==='APPLY_IMAGE'){var el=document.querySelector(d.path);if(el&&el.tagName==='IMG'){el.src=d.src;notify();}}
  if(d.type==='INSERT_IMAGE'){var t=document.querySelector(d.path)||document.body;var img=document.createElement('img');img.src=d.src;img.alt='Image';img.style.cssText='max-width:100%;height:auto;display:block;margin:16px auto;cursor:pointer;';if(t.tagName==='IMG'){t.insertAdjacentElement('afterend',img);}else{t.appendChild(img);}notify();}
  if(d.type==='APPLY_BG_IMAGE'){var el=document.querySelector(d.path);if(el){el.style.backgroundImage='url("'+d.src+'")';el.style.backgroundSize='cover';el.style.backgroundPosition='center';notify();}}
  if(d.type==='ENABLE_EDIT'){var el=document.querySelector(d.path);if(el)enableEdit(el,d.path);}
  if(d.type==='CLEAR_SELECTION'){if(sel){sel.removeAttribute('data-ve-selected');sel=null;}}
  if(d.type==='GET_HTML'){notify();}
});
var banner=document.createElement('div');
banner.id='__ve_banner__';
banner.style.cssText='display:none;position:fixed;top:0;left:0;right:0;background:rgba(37,99,235,0.85);color:#fff;text-align:center;padding:5px 8px;font-size:11px;font-family:system-ui,sans-serif;z-index:99999;pointer-events:none;';
banner.textContent='✏️ Mode Édition — Cliquez sur un élément pour le modifier · Double-cliquez pour éditer le texte · Échap pour désélectionner';
document.body.appendChild(banner);
})()`

// ─── Helpers ───────────────────────────────────────────────────────────────────

function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return '#000000'
  return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('')
}

function isTransparent(bg: string): boolean {
  return !bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)'
}

function pxToNum(px: string): number {
  return Math.round(parseFloat(px) || 0)
}

function buildSrcdoc(html: string): string {
  let h = sanitizeForOffline(html)
  h = injectScrollFix(h)
  h = injectLinkGuard(h)
  const veTag = `<script id="__ve_new__">${NEW_VE_SCRIPT}</${'script'}>`
  const idx = h.toLowerCase().lastIndexOf('</body>')
  return idx !== -1 ? h.slice(0, idx) + veTag + '\n' + h.slice(idx) : h + '\n' + veTag
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[^>]*id="__ve_new__"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*id="__link_guard__"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*id="__ve_sel_style__"[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<style[^>]*id="__offline__"[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<style[^>]*id="__scroll_fix__"[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<div[^>]*id="__ve_banner__"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/\s*data-ve-selected=""/gi, '')
    .replace(/\s*data-ve-hovered=""/gi, '')
    .replace(/\s*contenteditable="(true|false)"/gi, '')
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SelectedElData {
  tag: string; id: string; classes: string; text: string; isImage: boolean; src: string
  style: string; computedColor: string; computedBg: string; computedFontSize: string
  computedFontWeight: string; computedFontStyle: string; computedTextAlign: string
  computedPaddingTop: string; computedPaddingRight: string; computedPaddingBottom: string; computedPaddingLeft: string
  computedMarginTop: string; computedMarginRight: string; computedMarginBottom: string; computedMarginLeft: string
  computedWidth: string; computedHeight: string; computedBorderRadius: string; computedOpacity: string
  computedObjectFit: string; computedMinHeight: string
}

interface SelectedEl {
  data: SelectedElData
  path: string
}

// ─── Panel UI helpers ──────────────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
      <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0, minWidth: 80 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>{children}</div>
    </div>
  )
}

const inp: React.CSSProperties = {
  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6,
  padding: '4px 8px', fontSize: 12, color: '#0f172a', outline: 'none', width: '100%',
}

const smallInp: React.CSSProperties = {
  ...inp, width: 52, textAlign: 'center', flexShrink: 0,
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 28, height: 28, border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', padding: 2, flexShrink: 0, background: 'none' }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inp, width: 80 }}
        spellCheck={false}
      />
    </div>
  )
}

function SliderInput({ value, min, max, onChange, unit = '' }: { value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{ flex: 1, accentColor: '#2563eb' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={e => onChange(parseInt(e.target.value) || min)}
          style={{ ...smallInp, width: 44 }}
        />
        {unit && <span style={{ fontSize: 11, color: '#94a3b8' }}>{unit}</span>}
      </div>
    </div>
  )
}

function SpacingGrid({ values, onChange }: {
  values: { top: number; right: number; bottom: number; left: number }
  onChange: (k: 'top' | 'right' | 'bottom' | 'left', v: number) => void
}) {
  const box: React.CSSProperties = { ...smallInp, width: 42 }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, alignItems: 'center' }}>
      <div />
      <input type="number" value={values.top} onChange={e => onChange('top', parseInt(e.target.value) || 0)} style={box} />
      <div />
      <input type="number" value={values.left} onChange={e => onChange('left', parseInt(e.target.value) || 0)} style={box} />
      <div style={{ textAlign: 'center', fontSize: 9, color: '#94a3b8' }}>px</div>
      <input type="number" value={values.right} onChange={e => onChange('right', parseInt(e.target.value) || 0)} style={box} />
      <div />
      <input type="number" value={values.bottom} onChange={e => onChange('bottom', parseInt(e.target.value) || 0)} style={box} />
      <div />
    </div>
  )
}

// ─── Properties Panel ──────────────────────────────────────────────────────────

function PropertiesPanel({ el, applyStyle, applyText, onChangeImage, onSetBgImage, onClose, fullWidth }: {
  el: SelectedEl
  applyStyle: (styles: Record<string, string>) => void
  applyText: (text: string) => void
  onChangeImage: () => void
  onSetBgImage?: () => void
  onClose: () => void
  fullWidth?: boolean
}) {
  const d = el.data
  const isImg = d.isImage
  const TEXT_TAGS = ['P','H1','H2','H3','H4','H5','H6','SPAN','A','LABEL','STRONG','EM','B','I','BUTTON','LI','TD','TH','FIGCAPTION','CITE','SMALL']
  const SECTION_TAGS = ['DIV','SECTION','ARTICLE','HEADER','FOOTER','MAIN','NAV','FIGURE']
  const type: 'image' | 'text' | 'section' | 'other' = isImg ? 'image' : TEXT_TAGS.includes(d.tag) ? 'text' : SECTION_TAGS.includes(d.tag) ? 'section' : 'other'

  const [text, setText] = useState(d.text)
  const [fontSize, setFontSize] = useState(pxToNum(d.computedFontSize) || 16)
  const [color, setColor] = useState(isTransparent(d.computedColor) ? '#111111' : rgbToHex(d.computedColor))
  const [bold, setBold] = useState(parseInt(d.computedFontWeight) >= 600 || d.computedFontWeight === 'bold')
  const [italic, setItalic] = useState(d.computedFontStyle === 'italic')
  const [align, setAlign] = useState(d.computedTextAlign || 'left')
  const [bgColor, setBgColor] = useState(isTransparent(d.computedBg) ? '#ffffff' : rgbToHex(d.computedBg))
  const [opacity, setOpacity] = useState(Math.round(parseFloat(d.computedOpacity || '1') * 100))
  const [padding, setPadding] = useState({
    top: pxToNum(d.computedPaddingTop), right: pxToNum(d.computedPaddingRight),
    bottom: pxToNum(d.computedPaddingBottom), left: pxToNum(d.computedPaddingLeft),
  })
  const [margin, setMargin] = useState({
    top: pxToNum(d.computedMarginTop), right: pxToNum(d.computedMarginRight),
    bottom: pxToNum(d.computedMarginBottom), left: pxToNum(d.computedMarginLeft),
  })
  // Image state
  const [imgWidth, setImgWidth] = useState(d.computedWidth || 'auto')
  const [imgHeight, setImgHeight] = useState(d.computedHeight || 'auto')
  const [objectFit, setObjectFit] = useState(d.computedObjectFit || 'cover')
  const [borderRadius, setBorderRadius] = useState(pxToNum(d.computedBorderRadius))
  const [shadow, setShadow] = useState(false)
  // Section state
  const [minHeight, setMinHeight] = useState(d.computedMinHeight || 'auto')

  const panelStyle: React.CSSProperties = fullWidth
    ? { width: '100%', background: '#fff', overflowY: 'auto', padding: 16 }
    : { width: 280, background: '#fff', borderLeft: '1px solid #e2e8f0', overflowY: 'auto', padding: 16, flexShrink: 0 }

  const toggleBtn: React.CSSProperties = {
    padding: '4px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
    border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b',
  }
  const toggleBtnActive: React.CSSProperties = {
    ...toggleBtn, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
  }

  return (
    <aside style={panelStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
          {d.tag.toLowerCase()}{d.id ? `#${d.id}` : ''}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* IMAGE PANEL */}
      {type === 'image' && (
        <>
          <PanelSection title="Image">
            {d.src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.src} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8, display: 'block' }} />
            )}
            <button onClick={onChangeImage} style={{ ...toggleBtn, width: '100%', textAlign: 'center' }}>
              Changer l&apos;image
            </button>
          </PanelSection>

          <PanelSection title="Dimensions">
            <Row label="Largeur">
              <input value={imgWidth} onChange={e => { setImgWidth(e.target.value); applyStyle({ width: e.target.value }) }} style={{ ...inp, width: 90 }} />
            </Row>
            <Row label="Hauteur">
              <input value={imgHeight} onChange={e => { setImgHeight(e.target.value); applyStyle({ height: e.target.value }) }} style={{ ...inp, width: 90 }} />
            </Row>
            <Row label="Ajustement">
              <select value={objectFit} onChange={e => { setObjectFit(e.target.value); applyStyle({ objectFit: e.target.value }) }} style={{ ...inp, width: 100 }}>
                <option value="cover">Couvrir</option>
                <option value="contain">Contenir</option>
                <option value="fill">Remplir</option>
                <option value="none">Aucun</option>
              </select>
            </Row>
          </PanelSection>

          <PanelSection title="Style">
            <Row label="Arrondi">
              <SliderInput value={borderRadius} min={0} max={50} unit="px"
                onChange={v => { setBorderRadius(v); applyStyle({ borderRadius: v + 'px' }) }} />
            </Row>
            <Row label="Opacité">
              <SliderInput value={opacity} min={0} max={100} unit="%"
                onChange={v => { setOpacity(v); applyStyle({ opacity: (v / 100).toString() }) }} />
            </Row>
            <Row label="Ombre">
              <button onClick={() => { const s = !shadow; setShadow(s); applyStyle({ boxShadow: s ? '0 8px 24px rgba(0,0,0,0.2)' : 'none' }) }}
                style={shadow ? toggleBtnActive : toggleBtn}>
                {shadow ? 'ON' : 'OFF'}
              </button>
            </Row>
          </PanelSection>
        </>
      )}

      {/* TEXT PANEL */}
      {(type === 'text' || type === 'other') && (
        <>
          <PanelSection title="Contenu">
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); applyText(e.target.value) }}
              rows={3}
              style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
            />
          </PanelSection>

          <PanelSection title="Typographie">
            <Row label="Taille">
              <SliderInput value={fontSize} min={10} max={80} unit="px"
                onChange={v => { setFontSize(v); applyStyle({ fontSize: v + 'px' }) }} />
            </Row>
            <Row label="Couleur">
              <ColorInput value={color} onChange={v => { setColor(v); applyStyle({ color: v }) }} />
            </Row>
            <Row label="Style">
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => { const n = !bold; setBold(n); applyStyle({ fontWeight: n ? 'bold' : 'normal' }) }}
                  style={bold ? toggleBtnActive : toggleBtn}><strong>G</strong></button>
                <button onClick={() => { const n = !italic; setItalic(n); applyStyle({ fontStyle: n ? 'italic' : 'normal' }) }}
                  style={italic ? toggleBtnActive : toggleBtn}><em>I</em></button>
              </div>
            </Row>
            <Row label="Alignement">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['left','center','right','justify'] as const).map(a => (
                  <button key={a} onClick={() => { setAlign(a); applyStyle({ textAlign: a }) }}
                    style={align === a ? toggleBtnActive : toggleBtn}>
                    {a === 'left' ? '⬅' : a === 'center' ? '↔' : a === 'right' ? '➡' : '≡'}
                  </button>
                ))}
              </div>
            </Row>
          </PanelSection>

          <PanelSection title="Fond">
            <Row label="Couleur">
              <ColorInput value={bgColor} onChange={v => { setBgColor(v); applyStyle({ backgroundColor: v }) }} />
            </Row>
            <Row label="Opacité">
              <SliderInput value={opacity} min={0} max={100} unit="%"
                onChange={v => { setOpacity(v); applyStyle({ opacity: (v / 100).toString() }) }} />
            </Row>
          </PanelSection>

          <PanelSection title="Espacement — Padding">
            <SpacingGrid values={padding} onChange={(k, v) => {
              const next = { ...padding, [k]: v }; setPadding(next)
              applyStyle({ [`padding${k.charAt(0).toUpperCase()+k.slice(1)}`]: v + 'px' })
            }} />
          </PanelSection>

          <PanelSection title="Espacement — Marge">
            <SpacingGrid values={margin} onChange={(k, v) => {
              const next = { ...margin, [k]: v }; setMargin(next)
              applyStyle({ [`margin${k.charAt(0).toUpperCase()+k.slice(1)}`]: v + 'px' })
            }} />
          </PanelSection>
        </>
      )}

      {/* SECTION PANEL */}
      {type === 'section' && (
        <>
          <PanelSection title="Fond">
            <Row label="Couleur">
              <ColorInput value={bgColor} onChange={v => { setBgColor(v); applyStyle({ backgroundColor: v }) }} />
            </Row>
            <Row label="Opacité">
              <SliderInput value={opacity} min={0} max={100} unit="%"
                onChange={v => { setOpacity(v); applyStyle({ opacity: (v / 100).toString() }) }} />
            </Row>
            {onSetBgImage && (
              <button onClick={onSetBgImage} style={{ ...toggleBtn, width: '100%', textAlign: 'center', marginTop: 4 }}>
                Image de fond
              </button>
            )}
          </PanelSection>

          <PanelSection title="Dimensions">
            <Row label="Haut. min">
              <input value={minHeight} onChange={e => { setMinHeight(e.target.value); applyStyle({ minHeight: e.target.value }) }}
                style={{ ...inp, width: 90 }} placeholder="auto" />
            </Row>
          </PanelSection>

          <PanelSection title="Espacement — Padding">
            <SpacingGrid values={padding} onChange={(k, v) => {
              const next = { ...padding, [k]: v }; setPadding(next)
              applyStyle({ [`padding${k.charAt(0).toUpperCase()+k.slice(1)}`]: v + 'px' })
            }} />
          </PanelSection>
        </>
      )}
    </aside>
  )
}

// ─── AI Panel ─────────────────────────────────────────────────────────────────

function AiPanel({ siteId, tokensUsed, tokensLimit, onHtmlChange, onClose }: {
  siteId: string; tokensUsed: number; tokensLimit: number; onHtmlChange: (html: string) => void; onClose: () => void
}) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const remaining = tokensLimit === -1 ? Infinity : tokensLimit - tokensUsed

  const handleAi = async () => {
    if (!prompt.trim() || loading) return
    if (remaining <= 0) { toast.error('Plus de tokens disponibles.'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/ai-modify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur IA')
      if (data.html) { onHtmlChange(data.html); setPrompt(''); toast.success('Site modifié !') }
    } catch (err) { toast.error((err as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>✨ Modifier avec l&apos;IA</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAi() }}
          placeholder="Ex: Rends le header plus grand, change la couleur principale en bleu…"
          rows={4}
          style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#0f172a', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
          autoFocus
        />
        {tokensLimit !== -1 && (
          <p style={{ fontSize: 12, color: remaining < 50000 ? '#ef4444' : '#94a3b8', marginTop: 6 }}>
            {remaining.toLocaleString()} tokens restants
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={handleAi} disabled={!prompt.trim() || loading || remaining <= 0}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!prompt.trim() || loading || remaining <= 0) ? 0.5 : 1, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? (
              <><svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Génération…</>
            ) : '✨ Modifier'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main EditorClient ────────────────────────────────────────────────────────

interface Props {
  siteId: string
  siteName: string
  initialHtml: string
  tokensUsed: number
  tokensLimit: number
}

export default function EditorClient({ siteId, siteName, initialHtml, tokensUsed, tokensLimit }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const htmlRef = useRef(initialHtml)
  const saveStatusRef = useRef<'saved' | 'modified' | 'saving'>('saved')
  const histRef = useRef({ items: [initialHtml], idx: 0 })
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const histDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [mode, setMode] = useState<'navigate' | 'edit'>('navigate')
  const modeRef = useRef<'navigate' | 'edit'>('navigate')
  const [selectedEl, setSelectedEl] = useState<SelectedEl | null>(null)
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [isMobile, setIsMobile] = useState(false)
  const [showMobilePanel, setShowMobilePanel] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'modified' | 'saving'>('saved')
  const [undoDisabled, setUndoDisabled] = useState(true)
  const [redoDisabled, setRedoDisabled] = useState(true)
  const [name, setName] = useState(siteName)
  const [srcdoc, setSrcdoc] = useState(() => buildSrcdoc(initialHtml))
  const [showAi, setShowAi] = useState(false)
  const [tokensUsedState, setTokensUsedState] = useState(tokensUsed)
  const [imgModal, setImgModal] = useState<{ path: string; src: string; mode: ImageManagerMode } | null>(null)

  function updateStatus(s: typeof saveStatus) {
    saveStatusRef.current = s
    setSaveStatus(s)
  }

  function changeMode(m: 'navigate' | 'edit') {
    modeRef.current = m
    setMode(m)
    iframeRef.current?.contentWindow?.postMessage({ type: 'SET_MODE', mode: m }, '*')
    if (m === 'navigate') {
      setSelectedEl(null)
      setShowMobilePanel(false)
      iframeRef.current?.contentWindow?.postMessage({ type: 'CLEAR_SELECTION' }, '*')
    }
  }

  function pushHistory(html: string) {
    const h = histRef.current
    const items = [...h.items.slice(0, h.idx + 1), html].slice(-20)
    h.items = items
    h.idx = items.length - 1
    setUndoDisabled(h.idx <= 0)
    setRedoDisabled(h.idx >= h.items.length - 1)
  }

  function undoHistory() {
    const h = histRef.current
    if (h.idx <= 0) return
    h.idx--
    const html = h.items[h.idx]
    htmlRef.current = html
    setSrcdoc(buildSrcdoc(html))
    setSelectedEl(null)
    setUndoDisabled(h.idx <= 0)
    setRedoDisabled(h.idx >= h.items.length - 1)
    updateStatus('modified')
  }

  function redoHistory() {
    const h = histRef.current
    if (h.idx >= h.items.length - 1) return
    h.idx++
    const html = h.items[h.idx]
    htmlRef.current = html
    setSrcdoc(buildSrcdoc(html))
    setSelectedEl(null)
    setUndoDisabled(h.idx <= 0)
    setRedoDisabled(h.idx >= h.items.length - 1)
    updateStatus('modified')
  }

  function scheduleAutoSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      if (saveStatusRef.current === 'modified') save()
    }, 2000)
  }

  function scheduleHistoryPush(html: string) {
    if (histDebounce.current) clearTimeout(histDebounce.current)
    histDebounce.current = setTimeout(() => pushHistory(html), 1000)
  }

  const save = useCallback(async () => {
    if (saveStatusRef.current === 'saving') return
    updateStatus('saving')
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html_content: htmlRef.current, name }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur') }
      updateStatus('saved')
      toast.success('✓ Sauvegardé', { duration: 2000, position: 'bottom-right' })
    } catch (err) {
      updateStatus('modified')
      toast.error((err as Error).message)
    }
  }, [siteId, name])

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // 30s interval auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (saveStatusRef.current === 'modified') save()
    }, 30000)
    return () => clearInterval(interval)
  }, [save])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undoHistory() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redoHistory() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [save])

  // postMessage handler
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      // Ignore non-object messages (strings, numbers) and null
      if (!e.data || typeof e.data !== 'object') return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = e.data as any

      if (d.type === 've-change') {
        const clean = cleanHtml(d.html)
        htmlRef.current = clean
        updateStatus('modified')
        scheduleHistoryPush(clean)
        scheduleAutoSave()
      }

      if (d.type === 'ELEMENT_SELECTED') {
        setSelectedEl({ data: d.data, path: d.path })
      }

      if (d.type === 'SELECTION_CLEARED') {
        setSelectedEl(null)
      }

      if (d.type === 'TEXT_CHANGED') {
        // HTML already updated via ve-change
      }

      if (d.type === 'KEYBOARD_SAVE') save()
      if (d.type === 'KEYBOARD_UNDO') undoHistory()
      if (d.type === 'KEYBOARD_REDO') redoHistory()
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [save])

  function applyStyle(styles: Record<string, string>) {
    if (!selectedEl) return
    iframeRef.current?.contentWindow?.postMessage({ type: 'APPLY_STYLE', path: selectedEl.path, styles }, '*')
  }

  function applyText(text: string) {
    if (!selectedEl) return
    iframeRef.current?.contentWindow?.postMessage({ type: 'APPLY_TEXT', path: selectedEl.path, text }, '*')
  }

  async function exportZip() {
    try {
      const res = await fetch(`/api/sites/${siteId}/export`, { method: 'POST' })
      if (!res.ok) throw new Error('Erreur export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${name || 'site'}.zip`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { toast.error((err as Error).message) }
  }

  const hdrBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
    fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid #e2e8f0',
    background: '#f8fafc', color: '#64748b', textDecoration: 'none',
  }
  const hdrIconBtn: React.CSSProperties = {
    padding: '6px 8px', borderRadius: 8, cursor: 'pointer', border: '1px solid #e2e8f0',
    background: '#f8fafc', color: '#64748b',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#f8fafc', overflow: 'hidden' }}>

      {/* ── Header 52px ──────────────────────────────────────────── */}
      <header style={{
        height: 52, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
        background: '#fff', borderBottom: '1px solid #e2e8f0', zIndex: 50, flexShrink: 0,
      }}>
        {/* Back */}
        <Link href="/editor" style={{ ...hdrBtn, gap: 4 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          <span className="hidden sm:inline">Mes sites</span>
        </Link>

        <div style={{ width: 1, height: 20, background: '#e2e8f0', flexShrink: 0 }} />

        {/* Site name */}
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ flex: 1, minWidth: 0, maxWidth: 240, fontSize: 14, fontWeight: 500, color: '#0f172a', background: 'transparent', border: 'none', outline: 'none', borderBottom: '1px solid transparent' }}
          onFocus={e => { e.target.style.borderBottomColor = '#2563eb' }}
          onBlur={e => { e.target.style.borderBottomColor = 'transparent' }}
        />

        <div style={{ flex: 1 }} />

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 6, padding: 3 }}>
          <button
            onClick={() => changeMode('navigate')}
            title="Naviguez sur le site, cliquez sur les boutons, changez de page"
            style={{
              padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: mode === 'navigate' ? '#2563eb' : 'transparent',
              color: mode === 'navigate' ? '#fff' : '#64748b',
              fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            🖱 <span className="hidden sm:inline">Navigation</span>
          </button>
          <button
            onClick={() => changeMode('edit')}
            title="Cliquez sur un élément pour modifier ses propriétés"
            style={{
              padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: mode === 'edit' ? '#2563eb' : 'transparent',
              color: mode === 'edit' ? '#fff' : '#64748b',
              fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ✏️ <span className="hidden sm:inline">Édition</span>
          </button>
        </div>

        <div style={{ width: 1, height: 20, background: '#e2e8f0', flexShrink: 0 }} />

        {/* Viewport toggle */}
        <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => setViewport('desktop')}
            style={{ padding: '6px 10px', background: viewport === 'desktop' ? '#eff6ff' : '#f8fafc', color: viewport === 'desktop' ? '#2563eb' : '#64748b', border: 'none', cursor: 'pointer', fontSize: 13 }}
            title="Desktop"
          >🖥</button>
          <button
            onClick={() => setViewport('mobile')}
            style={{ padding: '6px 10px', background: viewport === 'mobile' ? '#eff6ff' : '#f8fafc', color: viewport === 'mobile' ? '#2563eb' : '#64748b', border: 'none', cursor: 'pointer', fontSize: 13 }}
            title="Mobile"
          >📱</button>
        </div>

        {/* Undo/Redo */}
        <button onClick={undoHistory} disabled={undoDisabled} title="Annuler (Ctrl+Z)" style={{ ...hdrIconBtn, opacity: undoDisabled ? 0.4 : 1 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 010 16H9m-6-6l-3-3 3-3"/></svg>
        </button>
        <button onClick={redoHistory} disabled={redoDisabled} title="Refaire (Ctrl+Y)" style={{ ...hdrIconBtn, opacity: redoDisabled ? 0.4 : 1 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 000 16h4m6-6l3-3-3-3"/></svg>
        </button>

        {/* Save status */}
        <span style={{ fontSize: 12, color: saveStatus === 'modified' ? '#f97316' : saveStatus === 'saving' ? '#94a3b8' : '#22c55e', flexShrink: 0 }}>
          {saveStatus === 'modified' ? 'Modifications en cours' : saveStatus === 'saving' ? 'Sauvegarde…' : '✓ Sauvegardé'}
        </span>

        {/* AI */}
        <button onClick={() => setShowAi(true)}
          style={{ ...hdrBtn, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', border: 'none' }}>
          ✨ <span className="hidden sm:inline">IA</span>
        </button>

        {/* Export */}
        <button onClick={exportZip} title="Exporter ZIP" style={hdrIconBtn}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
        </button>

        {/* Save button */}
        <button onClick={save} disabled={saveStatus === 'saving'}
          style={{ ...hdrBtn, background: '#2563eb', color: '#fff', border: 'none', opacity: saveStatus === 'saving' ? 0.7 : 1 }}>
          {saveStatus === 'saving' ? (
            <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          )}
          <span className="hidden sm:inline">Sauvegarder</span>
        </button>
      </header>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', background: '#e2e8f0', overflow: 'auto' }}>
          <div style={{
            width: viewport === 'mobile' ? 390 : '100%',
            height: '100%',
            transition: 'width 0.3s ease',
            boxShadow: viewport === 'mobile' ? '0 0 40px rgba(0,0,0,0.15)' : 'none',
            background: '#fff',
            position: 'relative',
          }}>
            <iframe
              ref={iframeRef}
              srcDoc={srcdoc}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="Éditeur de site"
              onLoad={() => {
                iframeRef.current?.contentWindow?.postMessage({ type: 'SET_MODE', mode: modeRef.current }, '*')
              }}
            />
            {/* Instruction banner */}
            {mode === 'navigate' && (
              <div style={{
                position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(15,23,42,0.7)', color: '#fff', borderRadius: 20,
                padding: '4px 14px', fontSize: 11, fontWeight: 500, pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}>
                🖱 Mode Navigation — Passez en ✏️ Édition pour modifier les éléments
              </div>
            )}
          </div>
        </div>

        {/* Properties panel — desktop sidebar */}
        {selectedEl && !isMobile && (
          <PropertiesPanel
            key={selectedEl.path}
            el={selectedEl}
            applyStyle={applyStyle}
            applyText={applyText}
            onChangeImage={() => setImgModal({ path: selectedEl.path, src: selectedEl.data.src, mode: 'replace' })}
            onSetBgImage={() => setImgModal({ path: selectedEl.path, src: '', mode: 'background' })}
            onClose={() => changeMode('navigate')}
          />
        )}
      </div>

      {/* ── Mobile floating button + bottom sheet ─────────────────── */}
      {isMobile && selectedEl && !showMobilePanel && (
        <button
          onClick={() => setShowMobilePanel(true)}
          style={{
            position: 'fixed', bottom: 24, right: 16, zIndex: 100,
            background: '#2563eb', color: '#fff', border: 'none',
            borderRadius: 30, padding: '10px 18px', fontSize: 14,
            fontWeight: 600, boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ⚙️ Propriétés
        </button>
      )}

      {isMobile && selectedEl && showMobilePanel && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setShowMobilePanel(false)}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
            height: '60vh', background: '#fff', borderRadius: '16px 16px 0 0',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
          }}>
            <div
              style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0, cursor: 'pointer' }}
              onClick={() => setShowMobilePanel(false)}
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#cbd5e1' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <PropertiesPanel
                key={selectedEl.path}
                el={selectedEl}
                applyStyle={applyStyle}
                applyText={applyText}
                onChangeImage={() => { setShowMobilePanel(false); setImgModal({ path: selectedEl.path, src: selectedEl.data.src, mode: 'replace' }) }}
                onSetBgImage={() => { setShowMobilePanel(false); setImgModal({ path: selectedEl.path, src: '', mode: 'background' }) }}
                onClose={() => { setShowMobilePanel(false); changeMode('navigate') }}
                fullWidth
              />
            </div>
          </div>
        </>
      )}

      {/* ── Add Image floating button (edit mode, no element selected) ── */}
      {mode === 'edit' && !selectedEl && !isMobile && (
        <button
          onClick={() => setImgModal({ path: 'body', src: '', mode: 'insert' })}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 90,
            background: '#fff', color: '#2563eb', border: '1.5px solid #bfdbfe',
            borderRadius: 30, padding: '8px 16px', fontSize: 13,
            fontWeight: 600, boxShadow: '0 4px 16px rgba(37,99,235,0.15)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
          Ajouter une image
        </button>
      )}

      {/* ── Modals ───────────────────────────────────────────────── */}

      {imgModal && (
        <ImageManager
          mode={imgModal.mode}
          currentSrc={imgModal.src}
          siteId={siteId}
          onConfirm={url => {
            const msg =
              imgModal.mode === 'insert'
                ? { type: 'INSERT_IMAGE', path: imgModal.path, src: url }
                : imgModal.mode === 'background'
                ? { type: 'APPLY_BG_IMAGE', path: imgModal.path, src: url }
                : { type: 'APPLY_IMAGE', path: imgModal.path, src: url }
            iframeRef.current?.contentWindow?.postMessage(msg, '*')
            setImgModal(null)
          }}
          onClose={() => setImgModal(null)}
        />
      )}

      {showAi && (
        <AiPanel
          siteId={siteId}
          tokensUsed={tokensUsedState}
          tokensLimit={tokensLimit}
          onHtmlChange={html => {
            const clean = cleanHtml(html)
            htmlRef.current = clean
            setSrcdoc(buildSrcdoc(clean))
            setSelectedEl(null)
            pushHistory(clean)
            updateStatus('modified')
            scheduleAutoSave()
            setTokensUsedState(t => t + 50000)
          }}
          onClose={() => setShowAi(false)}
        />
      )}
    </div>
  )
}

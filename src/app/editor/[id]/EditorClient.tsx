'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  sanitizeForOffline,
  stripEditorMeta,
  injectScrollFix,
  injectLinkGuard,
  VE_EXT_SCRIPT,
} from '@/lib/editor/ve-script'

// ─── VE_SCRIPT (click-to-edit engine) ────────────────────────────────────────

const VE_SCRIPT = `(function(){
if(window.__ve)return;window.__ve=true;
var _em=false,_sel=null,_atext=null,_tb=null,_rb=null,_pImg=null,_addImg=false,_idc=0;
document.querySelectorAll('*').forEach(function(el){el.dataset.veId=++_idc;});
function _notify(){
  var h=document.documentElement.outerHTML
    .replace(/\\s*contenteditable="[^"]*"/gi,'')
    .replace(/\\s*data-ve-id="\\d+"/gi,'');
  window.parent.postMessage({type:'ve-change',html:h},'*');
}
function _clear(){
  if(_sel){_sel.style.outline='';_sel.style.outlineOffset='';_sel=null;}
  if(_tb&&_tb.parentNode)_tb.parentNode.removeChild(_tb);
  if(_rb&&_rb.parentNode)_rb.parentNode.removeChild(_rb);
  _tb=null;_rb=null;
}
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
function _btn(html,title,bg){
  var b=document.createElement('button');
  b.innerHTML=html;b.title=title||'';
  b.style.cssText='min-width:22px;height:22px;background:'+(bg||'rgba(255,255,255,0.18)')+';border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:700;color:#fff;display:inline-flex;align-items:center;justify-content:center;padding:0 5px;white-space:nowrap;transition:filter 0.1s;';
  b.addEventListener('mouseenter',function(){this.style.filter='brightness(1.2)';});
  b.addEventListener('mouseleave',function(){this.style.filter='';});
  return b;
}
function _showSel(el){
  _clear();_sel=el;
  el.style.outline='2px solid #7c3aed';el.style.outlineOffset='1px';
  _tb=document.createElement('div');_tb.id='__ve_tb__';
  _tb.style.cssText='position:fixed;display:inline-flex;align-items:center;gap:2px;z-index:2147483647;background:#7c3aed;border-radius:7px;padding:3px 4px;box-shadow:0 4px 20px rgba(124,58,237,0.4);pointer-events:all;user-select:none;';
  var drag=_btn('⠿','Maintenir pour déplacer');drag.style.cursor='grab';
  drag.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();_startDrag(e,el);});
  _tb.appendChild(drag);
  function _sep(){var d=document.createElement('div');d.style.cssText='width:1px;height:14px;background:rgba(255,255,255,0.3);margin:0 1px;flex-shrink:0;';return d;}
  _tb.appendChild(_sep());
  var zu=_btn('↑Z','Passer devant');zu.addEventListener('click',function(e){e.stopPropagation();_zAdj(el,1);});_tb.appendChild(zu);
  var zd=_btn('↓Z','Envoyer derrière');zd.addEventListener('click',function(e){e.stopPropagation();_zAdj(el,-1);});_tb.appendChild(zd);
  _tb.appendChild(_sep());
  var dup=_btn('⧉','Dupliquer');dup.addEventListener('click',function(e){e.stopPropagation();_dup(el);});_tb.appendChild(dup);
  var del=_btn('✕','Supprimer','rgba(220,38,38,0.85)');
  del.addEventListener('click',function(e){e.stopPropagation();if(el.parentNode)el.parentNode.removeChild(el);_clear();_notify();});
  _tb.appendChild(del);_tb.appendChild(_sep());
  var lnk=_btn('🔗','Modifier le lien');
  lnk.addEventListener('click',function(e){
    e.stopPropagation();
    var a=el.tagName==='A'?el:(el.closest?el.closest('a'):null);
    var hr=a?(a.getAttribute('href')||''):'';var tg=a?(a.getAttribute('target')||'_self'):'_self';
    window.parent.postMessage({type:'ve-link-click',href:hr,target:tg,hasLink:!!a},'*');
  });_tb.appendChild(lnk);
  var anc=_btn('#','Définir l\\'ID (ancre)','rgba(16,185,129,0.8)');
  anc.addEventListener('click',function(e){e.stopPropagation();window.parent.postMessage({type:'ve-anchor-click',currentId:el.id||''},'*');});
  _tb.appendChild(anc);
  document.body.appendChild(_tb);
  if(el.tagName==='IMG')_showRB(el);
  _rePos();
}
function _zAdj(el,d){var cur=parseInt(window.getComputedStyle(el).zIndex)||0;if(isNaN(cur))cur=0;if(!el.style.position||el.style.position==='static')el.style.position='relative';el.style.zIndex=cur+d;window.parent.postMessage({type:'ve-zindex',val:el.style.zIndex},'*');_notify();}
function _dup(el){var c=el.cloneNode(true);var m=c.style.transform&&c.style.transform.match(/translate\\(([^,]+)px,\\s*([^)]+)px\\)/);var dx=m?parseFloat(m[1]):0,dy=m?parseFloat(m[2]):0;c.style.transform='translate('+(dx+16)+'px,'+(dy+16)+'px)';if(!c.style.position||c.style.position==='static')c.style.position='relative';c.dataset.veId=++_idc;c.querySelectorAll('[data-ve-id]').forEach(function(ch){ch.dataset.veId=++_idc;});el.parentNode.insertBefore(c,el.nextSibling);_notify();_showSel(c);}
function _showRB(img){_rb=document.createElement('div');_rb.id='__ve_rb__';_rb.style.cssText='position:fixed;pointer-events:none;z-index:2147483646;';[['se','se-resize','bottom:-5px','right:-5px'],['sw','sw-resize','bottom:-5px','left:-5px'],['ne','ne-resize','top:-5px','right:-5px'],['nw','nw-resize','top:-5px','left:-5px']].forEach(function(cfg){var h=document.createElement('div');h.style.cssText='position:absolute;width:10px;height:10px;background:#7c3aed;border:2px solid #fff;border-radius:2px;pointer-events:all;cursor:'+cfg[1]+';'+cfg[2]+';'+cfg[3]+';';h.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();_startImgResize(e,img,cfg[0]);});_rb.appendChild(h);});document.body.appendChild(_rb);}
function _startImgResize(e,img,corner){var r=img.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,sw=r.width,sh=r.height;function mv(ev){var dx=ev.clientX-sx,dy=ev.clientY-sy,w=sw,h=sh;if(corner==='se'){w=Math.max(20,sw+dx);h=Math.max(20,sh+dy);}else if(corner==='sw'){w=Math.max(20,sw-dx);h=Math.max(20,sh+dy);}else if(corner==='ne'){w=Math.max(20,sw+dx);h=Math.max(20,sh-dy);}else{w=Math.max(20,sw-dx);h=Math.max(20,sh-dy);}img.style.width=w+'px';img.style.height=h+'px';if(!img.style.objectFit)img.style.objectFit='cover';_rePos();}function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);_notify();}document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);}
function _startDrag(e,el){var sx=e.clientX,sy=e.clientY;var m=el.style.transform&&el.style.transform.match(/translate\\(([^,]+)px,\\s*([^)]+)px\\)/);var ox=m?parseFloat(m[1]):0,oy=m?parseFloat(m[2]):0;if(!el.style.position||el.style.position==='static')el.style.position='relative';function mv(ev){var dx=ev.clientX-sx+ox,dy=ev.clientY-sy+oy;el.style.transform='translate('+dx+'px,'+dy+'px)';_rePos();}function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);_notify();}document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);}
function _dtxt(){if(_atext){_atext.contentEditable='false';_atext.style.outline='';_atext.style.outlineOffset='';_atext=null;_notify();}}
var _vs=document.createElement('style');_vs.id='__ve_style__';document.head.appendChild(_vs);
function _setMode(on){_em=on;window.parent.postMessage({type:'ve-mode',on:on},'*');if(on){_vs.textContent='[data-ve-id]:hover{outline:1px solid rgba(124,111,250,0.5)!important;outline-offset:1px!important;cursor:pointer!important;}#__ve_tb__,#__ve_tb__ *,#__ve_rb__,#__ve_rb__ *{outline:none!important;cursor:auto!important;}';}else{_vs.textContent='';_clear();_dtxt();}}
var TT=['P','H1','H2','H3','H4','H5','H6','SPAN','A','LI','TD','TH','BUTTON','LABEL','STRONG','EM','B','I','SMALL','CITE','DT','DD','FIGCAPTION'];
var BT=['DIV','SECTION','ARTICLE','HEADER','FOOTER','NAV','MAIN','UL','OL','TABLE','THEAD','TBODY','TR','FORM','FIGURE'];
function _hbc(el){for(var i=0;i<el.children.length;i++)if(BT.indexOf(el.children[i].tagName)!==-1)return true;return false;}
document.addEventListener('click',function(e){if(!_em)return;if(_tb&&_tb.contains(e.target))return;if(_rb&&_rb.contains(e.target))return;var el=e.target;if(!el||el===document.documentElement||el===document.body){_clear();return;}if(_atext&&!_atext.contains(el))_dtxt();e.stopPropagation();if(_sel!==el)_showSel(el);},true);
document.addEventListener('dblclick',function(e){if(!_em)return;if(_tb&&_tb.contains(e.target))return;if(_rb&&_rb.contains(e.target))return;var el=e.target;if(!el)return;if(el.tagName==='IMG'){e.preventDefault();e.stopPropagation();_pImg=el;_addImg=false;window.parent.postMessage({type:'ve-img-click',src:el.getAttribute('src')||'',isPlaceholder:false},'*');return;}var node=el;while(node&&node!==document.body){if(TT.indexOf(node.tagName)!==-1&&!_hbc(node)){e.preventDefault();e.stopPropagation();_dtxt();_atext=node;node.contentEditable='true';node.style.outline='2px dashed #7c3aed';node.style.outlineOffset='2px';node.focus();try{var rc=document.createRange(),sc=window.getSelection();rc.selectNodeContents(node);sc.removeAllRanges();sc.addRange(rc);}catch(x){}return;}node=node.parentElement;}},true);
document.addEventListener('blur',function(e){if(_atext&&e.target===_atext)_dtxt();},true);
document.addEventListener('input',function(){_notify();});
window.addEventListener('scroll',_rePos,true);window.addEventListener('resize',_rePos);
window.addEventListener('message',function(e){
  if(!e.data)return;
  if(e.data.type==='ve-toggle')_setMode(e.data.on);
  if(e.data.type==='ve-img-confirm'){if(_pImg){_pImg.src=e.data.url;_pImg=null;_notify();}else if(_addImg){var img=document.createElement('img');img.src=e.data.url;img.alt='Image';img.style.cssText='width:300px;height:200px;object-fit:cover;display:block;border-radius:4px;position:relative;';img.dataset.veId=++_idc;document.body.appendChild(img);_addImg=false;_notify();_showSel(img);}}
  if(e.data.type==='ve-add-text'){var div=document.createElement('div');div.textContent='Votre texte ici';div.style.cssText='position:relative;display:inline-block;padding:10px 16px;font-size:18px;color:#111111;background:rgba(255,255,255,0.95);border-radius:6px;min-width:100px;box-shadow:0 2px 10px rgba(0,0,0,0.14);margin:8px;';div.dataset.veId=++_idc;document.body.appendChild(div);_notify();_showSel(div);_atext=div;div.contentEditable='true';div.style.outline='2px dashed #7c3aed';div.style.outlineOffset='2px';div.focus();try{var rt=document.createRange(),st=window.getSelection();rt.selectNodeContents(div);st.removeAllRanges();st.addRange(rt);}catch(x){}}
  if(e.data.type==='ve-add-image'){_addImg=true;window.parent.postMessage({type:'ve-img-click',src:'',isPlaceholder:false},'*');}
  if(e.data.type==='ve-link-confirm'){var hr2=e.data.href||'';var tg2=e.data.target||'_self';var rm=e.data.remove;if(_sel){var existA=_sel.tagName==='A'?_sel:(_sel.closest?_sel.closest('a'):null);if(rm){if(existA&&existA.parentNode){while(existA.firstChild)existA.parentNode.insertBefore(existA.firstChild,existA);existA.parentNode.removeChild(existA);_clear();}else{_sel.removeAttribute('href');}}else if(existA){existA.setAttribute('href',hr2);if(tg2==='_blank'){existA.setAttribute('target','_blank');existA.setAttribute('rel','noopener noreferrer');}else{existA.removeAttribute('target');existA.removeAttribute('rel');}}else{var newA2=document.createElement('a');newA2.setAttribute('href',hr2);if(tg2==='_blank'){newA2.setAttribute('target','_blank');newA2.setAttribute('rel','noopener noreferrer');}newA2.style.textDecoration='none';newA2.style.color='inherit';newA2.dataset.veId=String(++_idc);_sel.parentNode.insertBefore(newA2,_sel);newA2.appendChild(_sel);_showSel(newA2);}_notify();}}
  if(e.data.type==='ve-anchor-confirm'){if(_sel){if(e.data.id){_sel.id=e.data.id;}else{_sel.removeAttribute('id');}_notify();}}
  if(e.data.type==='ve-get-anchors'){var anchors2=[];document.querySelectorAll('[id]').forEach(function(ae){if(ae.id&&!ae.id.startsWith('__'))anchors2.push({id:ae.id,tag:ae.tagName.toLowerCase()});});window.parent.postMessage({type:'ve-anchors',anchors:anchors2},'*');}
});
window.veSetMode=_setMode;
})()`

// ─── Block palette ────────────────────────────────────────────────────────────

interface BlockDef {
  id: string
  icon: string
  label: string
  html: string
}

const BLOCK_PALETTE: { category: string; blocks: BlockDef[] }[] = [
  {
    category: 'Texte',
    blocks: [
      {
        id: 'heading',
        icon: 'H',
        label: 'Titre',
        html: `<div style="padding:32px 40px;text-align:center"><h2 style="font-size:2.5rem;font-weight:800;color:#111;margin:0;line-height:1.2">Votre titre ici</h2></div>`,
      },
      {
        id: 'paragraph',
        icon: 'P',
        label: 'Paragraphe',
        html: `<div style="padding:24px 40px;max-width:720px;margin:0 auto"><p style="font-size:1.05rem;line-height:1.8;color:#444;margin:0">Votre texte ici. Double-cliquez pour modifier le contenu de ce paragraphe.</p></div>`,
      },
      {
        id: 'hero-text',
        icon: 'T',
        label: 'Bloc héro',
        html: `<section style="padding:80px 40px;text-align:center;background:linear-gradient(135deg,#7c3aed11,#2563eb11)"><h1 style="font-size:3rem;font-weight:900;color:#111;margin:0 0 16px">Titre principal</h1><p style="font-size:1.2rem;color:#555;margin:0 0 32px;max-width:600px;margin-left:auto;margin-right:auto">Sous-titre accrocheur qui explique votre proposition de valeur en une phrase.</p></section>`,
      },
    ],
  },
  {
    category: 'Boutons',
    blocks: [
      {
        id: 'button-primary',
        icon: '⬛',
        label: 'Bouton principal',
        html: `<div style="padding:24px 40px;text-align:center"><a href="#" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:16px;padding:14px 40px;border-radius:10px;text-decoration:none;box-shadow:0 4px 14px rgba(124,58,237,0.35)">Mon bouton</a></div>`,
      },
      {
        id: 'button-outline',
        icon: '⬜',
        label: 'Bouton contour',
        html: `<div style="padding:24px 40px;text-align:center"><a href="#" style="display:inline-block;background:transparent;color:#7c3aed;font-weight:700;font-size:16px;padding:13px 38px;border-radius:10px;text-decoration:none;border:2px solid #7c3aed">Mon bouton</a></div>`,
      },
      {
        id: 'button-group',
        icon: '▦',
        label: 'Groupe de boutons',
        html: `<div style="padding:24px 40px;text-align:center;display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a href="#" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:16px;padding:14px 36px;border-radius:10px;text-decoration:none">Principal</a><a href="#" style="display:inline-block;background:transparent;color:#7c3aed;font-weight:700;font-size:16px;padding:13px 34px;border-radius:10px;text-decoration:none;border:2px solid #7c3aed">Secondaire</a></div>`,
      },
    ],
  },
  {
    category: 'Médias',
    blocks: [
      {
        id: 'image',
        icon: '🖼',
        label: 'Image',
        html: `<div style="padding:24px 40px"><img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80" alt="Image" style="width:100%;height:360px;object-fit:cover;border-radius:12px;display:block"/></div>`,
      },
      {
        id: 'video',
        icon: '▶',
        label: 'Vidéo YouTube',
        html: `<div style="padding:24px 40px"><div style="position:relative;padding-bottom:56.25%;height:0;border-radius:12px;overflow:hidden"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen></iframe></div></div>`,
      },
      {
        id: 'image-text',
        icon: '◧',
        label: 'Image + texte',
        html: `<section style="padding:48px 40px;display:flex;gap:48px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:280px"><img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80" alt="Image" style="width:100%;height:300px;object-fit:cover;border-radius:12px"/></div><div style="flex:1;min-width:280px"><h2 style="font-size:1.8rem;font-weight:800;margin:0 0 16px;color:#111">Votre titre ici</h2><p style="font-size:1rem;line-height:1.8;color:#555;margin:0">Décrivez votre service, produit ou histoire ici. Ce texte peut être modifié librement.</p></div></section>`,
      },
    ],
  },
  {
    category: 'Sections',
    blocks: [
      {
        id: 'features',
        icon: '◈',
        label: 'Fonctionnalités',
        html: `<section style="padding:64px 40px;background:#f8f7ff"><div style="max-width:900px;margin:0 auto"><h2 style="text-align:center;font-size:2rem;font-weight:800;margin:0 0 48px;color:#111">Nos avantages</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:32px">${['Rapide', 'Fiable', 'Simple'].map(t => `<div style="background:#fff;border-radius:12px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06)"><div style="width:48px;height:48px;background:#7c3aed22;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px"><span style="font-size:22px">⚡</span></div><h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#111">${t}</h3><p style="font-size:0.95rem;line-height:1.6;color:#555;margin:0">Description de cet avantage clé de votre offre.</p></div>`).join('')}</div></div></section>`,
      },
      {
        id: 'testimonial',
        icon: '💬',
        label: 'Témoignage',
        html: `<section style="padding:64px 40px;background:#fff"><div style="max-width:700px;margin:0 auto;text-align:center"><div style="font-size:3rem;margin-bottom:16px">⭐⭐⭐⭐⭐</div><blockquote style="font-size:1.3rem;font-style:italic;line-height:1.7;color:#333;margin:0 0 24px">"Ce service a transformé notre façon de travailler. Résultats exceptionnels dès la première semaine."</blockquote><cite style="font-size:0.95rem;font-weight:600;color:#7c3aed;font-style:normal">— Marie Dupont, CEO chez TechCorp</cite></div></section>`,
      },
      {
        id: 'pricing-card',
        icon: '💳',
        label: 'Carte tarif',
        html: `<section style="padding:64px 40px"><div style="max-width:400px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 8px 32px rgba(0,0,0,0.1);border:2px solid #7c3aed"><div style="text-align:center;margin-bottom:32px"><h3 style="font-size:1.4rem;font-weight:800;margin:0 0 8px;color:#111">Pro</h3><div style="font-size:3rem;font-weight:900;color:#7c3aed;margin:16px 0">45 €<span style="font-size:1rem;color:#888;font-weight:400">/mois</span></div><p style="color:#666;margin:0">Pour les professionnels</p></div><ul style="list-style:none;padding:0;margin:0 0 32px;space-y:8px">${['Génération illimitée', 'Éditeur visuel', 'Export ZIP', 'Support prioritaire'].map(f => `<li style="padding:8px 0;color:#444;font-size:0.95rem;border-bottom:1px solid #f0f0f0">✓ ${f}</li>`).join('')}</ul><a href="#" style="display:block;text-align:center;background:#7c3aed;color:#fff;font-weight:700;font-size:16px;padding:14px;border-radius:10px;text-decoration:none">Commencer</a></div></section>`,
      },
      {
        id: 'faq',
        icon: '❓',
        label: 'FAQ',
        html: `<section style="padding:64px 40px;background:#f8f7ff"><div style="max-width:720px;margin:0 auto"><h2 style="text-align:center;font-size:2rem;font-weight:800;margin:0 0 48px;color:#111">Questions fréquentes</h2>${['Comment ça marche ?', 'Puis-je annuler à tout moment ?', 'Y a-t-il des frais cachés ?'].map((q, i) => `<div style="background:#fff;border-radius:10px;padding:20px 24px;margin-bottom:12px;box-shadow:0 1px 6px rgba(0,0,0,0.05)"><h3 style="font-size:1rem;font-weight:700;margin:0 0 8px;color:#111">${q}</h3><p style="font-size:0.95rem;line-height:1.6;color:#555;margin:0">Réponse détaillée à cette question importante pour vos visiteurs. Personnalisez ce contenu.</p></div>`).join('')}</div></section>`,
      },
    ],
  },
  {
    category: 'Mise en page',
    blocks: [
      {
        id: 'divider',
        icon: '─',
        label: 'Séparateur',
        html: `<div style="padding:16px 40px"><hr style="border:none;border-top:2px solid #e5e7eb;margin:0"/></div>`,
      },
      {
        id: 'spacer',
        icon: '↕',
        label: 'Espace',
        html: `<div style="height:64px"></div>`,
      },
      {
        id: 'two-cols',
        icon: '⊟',
        label: '2 Colonnes',
        html: `<section style="padding:48px 40px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:32px"><div style="background:#f8f7ff;border-radius:12px;padding:32px"><h3 style="font-size:1.2rem;font-weight:700;margin:0 0 12px;color:#111">Colonne gauche</h3><p style="font-size:0.95rem;line-height:1.7;color:#555;margin:0">Contenu de la première colonne. Double-cliquez pour modifier.</p></div><div style="background:#f8f7ff;border-radius:12px;padding:32px"><h3 style="font-size:1.2rem;font-weight:700;margin:0 0 12px;color:#111">Colonne droite</h3><p style="font-size:0.95rem;line-height:1.7;color:#555;margin:0">Contenu de la deuxième colonne. Double-cliquez pour modifier.</p></div></div></section>`,
      },
      {
        id: 'contact-form',
        icon: '📋',
        label: 'Formulaire',
        html: `<section style="padding:64px 40px;background:#f8f7ff"><div style="max-width:560px;margin:0 auto"><h2 style="text-align:center;font-size:1.8rem;font-weight:800;margin:0 0 32px;color:#111">Contactez-nous</h2><form style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.08)"><div style="margin-bottom:20px"><label style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:8px;color:#333">Nom</label><input type="text" placeholder="Votre nom" style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:8px;font-size:1rem;box-sizing:border-box"/></div><div style="margin-bottom:20px"><label style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:8px;color:#333">Email</label><input type="email" placeholder="votre@email.com" style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:8px;font-size:1rem;box-sizing:border-box"/></div><div style="margin-bottom:24px"><label style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:8px;color:#333">Message</label><textarea placeholder="Votre message…" rows="4" style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:8px;font-size:1rem;box-sizing:border-box;resize:vertical"></textarea></div><button type="submit" style="width:100%;background:#7c3aed;color:#fff;font-weight:700;font-size:1rem;padding:14px;border:none;border-radius:10px;cursor:pointer">Envoyer le message</button></form></div></section>`,
      },
    ],
  },
]

// ─── Image popup ──────────────────────────────────────────────────────────────

interface ImgPopupProps {
  siteId: string
  currentSrc: string
  onConfirm: (url: string) => void
  onClose: () => void
}

function ImgPopup({ siteId, currentSrc, onConfirm, onClose }: ImgPopupProps) {
  const [tab, setTab] = useState<'upload' | 'url' | 'unsplash'>('upload')
  const [url, setUrl] = useState(currentSrc)
  const [preview, setPreview] = useState(currentSrc)
  const [uploading, setUploading] = useState(false)
  const [uq, setUq] = useState('')
  const [results, setResults] = useState<{ preview: string; full: string; alt: string }[]>([])
  const [uLoading, setULoading] = useState(false)
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
    } catch (err) { toast.error((err as Error).message) }
    finally { setUploading(false) }
  }

  const searchUnsplash = async () => {
    if (!uq.trim()) return
    setULoading(true); setResults([])
    try {
      const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
      if (key) {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(uq)}&per_page=9&client_id=${key}`)
        const data = await res.json()
        setResults((data.results as Array<{ urls: { small: string; regular: string }; alt_description: string }>).map(p => ({
          preview: p.urls.small, full: `${p.urls.regular}&w=1200&q=80`, alt: p.alt_description || uq,
        })))
      } else {
        setResults(Array.from({ length: 9 }, (_, i) => ({
          preview: `https://source.unsplash.com/300x200/?${encodeURIComponent(uq)}&sig=${i + 1}`,
          full: `https://source.unsplash.com/1200x800/?${encodeURIComponent(uq)}&sig=${i + 1}`,
          alt: uq,
        })))
      }
    } catch { toast.error('Erreur Unsplash') }
    finally { setULoading(false) }
  }

  const inp: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div className="relative rounded-xl p-6 w-full max-w-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 1 }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--fg-subtle)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--fg)' }}>Ajouter une image</h3>
        <div className="flex gap-1 mb-4 rounded-lg p-1" style={{ background: 'var(--bg)' }}>
          {(['upload', 'url', 'unsplash'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-1.5 text-xs font-medium rounded-md transition-all"
              style={tab === t ? { background: 'var(--surface)', color: 'var(--accent)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : { color: 'var(--fg-muted)' }}>
              {t === 'upload' ? '📁 Upload' : t === 'url' ? '🔗 URL' : '🌄 Unsplash'}
            </button>
          ))}
        </div>
        {tab === 'upload' && (
          <div className="mb-4">
            <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />
            <div onClick={() => !uploading && fileRef.current?.click()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f) }} onDragOver={e => e.preventDefault()}
              className="w-full rounded-xl py-8 flex flex-col items-center gap-2 cursor-pointer transition-all text-sm"
              style={{ border: '2px dashed var(--border)', color: 'var(--fg-subtle)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)' }}>
              {uploading ? <><svg className="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span style={{ color: 'var(--accent)' }}>Upload…</span></> :
                <><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg><span>Glisser-déposer ou cliquer</span><span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>JPG, PNG, WebP · max 5MB</span></>}
            </div>
          </div>
        )}
        {tab === 'url' && (
          <input type="text" value={url} onChange={e => { setUrl(e.target.value); setPreview(e.target.value) }} placeholder="https://exemple.com/image.jpg" style={{ ...inp, marginBottom: 16 }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} autoFocus />
        )}
        {tab === 'unsplash' && (
          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              <input type="text" value={uq} onChange={e => setUq(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUnsplash()} placeholder="restaurant, nature…" style={{ ...inp, padding: '8px 12px', flex: 1, width: 'auto' }} onFocus={e => { e.target.style.borderColor = 'var(--accent)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} autoFocus />
              <button onClick={searchUnsplash} disabled={uLoading || !uq.trim()} className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-opacity disabled:opacity-40" style={{ background: 'var(--accent)' }}>{uLoading ? '…' : 'Chercher'}</button>
            </div>
            {results.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto rounded-xl">
                {results.map((r, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={r.preview} alt={r.alt} className="w-full h-20 object-cover rounded-lg cursor-pointer transition-opacity"
                    onClick={() => { setUrl(r.full); setPreview(r.full); setTab('url') }}
                    onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.outline = '2px solid var(--accent)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.outline = 'none' }} />
                ))}
              </div>
            )}
            {uLoading && <div className="flex justify-center py-4"><svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>}
          </div>
        )}
        {preview && tab !== 'unsplash' && (
          <div className="mb-4 rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: 100, background: 'var(--bg)', border: '1px solid var(--border)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" className="max-h-36 max-w-full object-contain" onError={() => setPreview('')} />
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>Annuler</button>
          <button onClick={() => { if (url) onConfirm(url) }} disabled={!url || uploading} className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-40" style={{ background: 'var(--accent)' }}>Confirmer</button>
        </div>
      </div>
    </div>
  )
}

// ─── Link popup ───────────────────────────────────────────────────────────────

interface LinkPopupState { href: string; target: string; hasLink: boolean; anchors: { id: string; tag: string }[] }

function LinkPopup({ state, onConfirm, onClose }: { state: LinkPopupState; onConfirm: (href: string, target: string) => void; onClose: () => void }) {
  const [href, setHref] = useState(state.href)
  const [newTab, setNewTab] = useState(state.target === '_blank')
  const inp: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div className="relative rounded-xl p-6 w-full max-w-md space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 1 }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--fg-subtle)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>🔗 Modifier le lien</h3>
        <div className="flex gap-1.5 flex-wrap">
          {['https://', '#', 'mailto:', 'tel:'].map(p => (
            <button key={p} onClick={() => setHref(p)} className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
              style={href.startsWith(p) ? { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.3)' } : { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>{p}</button>
          ))}
        </div>
        <input type="text" value={href} onChange={e => setHref(e.target.value)} placeholder="https://exemple.com ou #section-id" style={inp} autoFocus onFocus={e => { e.target.style.borderColor = 'var(--accent)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
        {state.anchors.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--fg-muted)' }}>Sections de cette page :</p>
            <div className="flex flex-wrap gap-1.5">
              {state.anchors.map(a => (
                <button key={a.id} onClick={() => setHref('#' + a.id)} className="px-2 py-1 rounded-md text-xs font-mono transition-all"
                  style={href === '#' + a.id ? { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.3)' } : { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>#{a.id}</button>
              ))}
            </div>
          </div>
        )}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={newTab} onChange={e => setNewTab(e.target.checked)} style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
          <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>Ouvrir dans un nouvel onglet</span>
        </label>
        <div className="flex gap-2 pt-1">
          {state.hasLink && (
            <button onClick={() => onConfirm('', 'remove')} className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>Supprimer</button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>Annuler</button>
          <button onClick={() => href && onConfirm(href, newTab ? '_blank' : '_self')} disabled={!href} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40" style={{ background: 'var(--accent)' }}>Confirmer</button>
        </div>
      </div>
    </div>
  )
}

// ─── Anchor popup ─────────────────────────────────────────────────────────────

function AnchorPopup({ current, onConfirm, onClose }: { current: string; onConfirm: (id: string) => void; onClose: () => void }) {
  const [val, setVal] = useState(current)
  const inp: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div className="relative rounded-xl p-6 w-full max-w-sm space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 1 }}>
        <h3 className="text-base font-semibold" style={{ color: 'var(--fg)' }}># Définir l'ID (ancre)</h3>
        <input type="text" value={val} onChange={e => setVal(e.target.value.replace(/\s+/g, '-').toLowerCase())} placeholder="section-contact" style={inp} autoFocus onFocus={e => { e.target.style.borderColor = 'var(--accent)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Utilisez cet ID comme lien de navigation : <code style={{ color: 'var(--accent)' }}>#{val || 'mon-id'}</code></p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>Annuler</button>
          <button onClick={() => onConfirm(val)} className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium" style={{ background: 'var(--accent)' }}>Confirmer</button>
        </div>
      </div>
    </div>
  )
}

// ─── Video popup ──────────────────────────────────────────────────────────────

function VideoPopup({ onConfirm, onClose }: { onConfirm: (html: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('')
  const inp: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }

  const handleConfirm = () => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
    const vm = url.match(/vimeo\.com\/(\d+)/)
    let embedUrl = ''
    if (yt) embedUrl = `https://www.youtube.com/embed/${yt[1]}`
    else if (vm) embedUrl = `https://player.vimeo.com/video/${vm[1]}`
    else { toast.error('URL YouTube ou Vimeo invalide'); return }
    onConfirm(`<div style="padding:24px 40px"><div style="position:relative;padding-bottom:56.25%;height:0;border-radius:12px;overflow:hidden"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen></iframe></div></div>`)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div className="relative rounded-xl p-6 w-full max-w-md space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 1 }}>
        <h3 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>▶ Ajouter une vidéo</h3>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=… ou https://vimeo.com/…" style={inp} autoFocus onFocus={e => { e.target.style.borderColor = 'var(--accent)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>YouTube et Vimeo supportés.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>Annuler</button>
          <button onClick={handleConfirm} disabled={!url.trim()} className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-40" style={{ background: 'var(--accent)' }}>Ajouter</button>
        </div>
      </div>
    </div>
  )
}

// ─── AI panel ─────────────────────────────────────────────────────────────────

function AiPanel({ siteId, tokensUsed, tokensLimit, onHtmlChange, onClose }: {
  siteId: string; tokensUsed: number; tokensLimit: number; onHtmlChange: (html: string) => void; onClose: () => void
}) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const remaining = tokensLimit === -1 ? Infinity : tokensLimit - tokensUsed

  const handleAi = async () => {
    if (!prompt.trim() || loading) return
    if (remaining <= 0) { toast.error('Plus de tokens disponibles. Upgradez votre plan.'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/ai-modify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur IA')
      if (data.html) { onHtmlChange(data.html); setPrompt(''); toast.success('Site modifié par l\'IA') }
    } catch (err) { toast.error((err as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 1 }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>✨ Modifier avec l'IA</h3>
          <button onClick={onClose} style={{ color: 'var(--fg-subtle)' }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAi() }}
          placeholder="Ex: Rends le header plus grand et change la couleur principale en bleu…"
          rows={4}
          className="w-full rounded-xl resize-none text-sm"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)', padding: '12px 14px', outline: 'none' }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          autoFocus
        />
        {tokensLimit !== -1 && (
          <p className="text-xs" style={{ color: remaining < 50000 ? '#ef4444' : 'var(--fg-muted)' }}>
            {remaining.toLocaleString()} tokens restants
          </p>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>Annuler</button>
          <button onClick={handleAi} disabled={!prompt.trim() || loading || remaining <= 0}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: 'var(--accent)' }}>
            {loading ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Génération…</> : '✨ Modifier'}
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
  prompt: string
  tokensUsed: number
  tokensLimit: number
}

export default function EditorClient({ siteId, siteName, initialHtml, tokensUsed, tokensLimit }: Props) {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const htmlRef = useRef<string>(initialHtml)
  const editModeRef = useRef(false)

  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const [showAi, setShowAi] = useState(false)

  const [imgPopup, setImgPopup] = useState<{ src: string } | null>(null)
  const [linkPopup, setLinkPopup] = useState<LinkPopupState | null>(null)
  const [anchorPopup, setAnchorPopup] = useState<{ current: string } | null>(null)
  const [videoPopup, setVideoPopup] = useState(false)

  const [tokensUsedState, setTokensUsedState] = useState(tokensUsed)
  const [name, setName] = useState(siteName)

  const buildSrcdoc = (html: string) => {
    let h = sanitizeForOffline(html)
    h = injectScrollFix(h)
    h = injectLinkGuard(h)
    return h
  }

  const [srcdoc, setSrcdoc] = useState(() => buildSrcdoc(initialHtml))

  // ── Inject VE_SCRIPT + VE_EXT_SCRIPT after iframe load ────────────────────
  const injectScripts = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc || !doc.body) return
    doc.getElementById('__ve__')?.remove()
    doc.getElementById('__ve_ext__')?.remove()
    const s = doc.createElement('script'); s.id = '__ve__'; s.textContent = VE_SCRIPT; doc.body.appendChild(s)
    const sx = doc.createElement('script'); sx.id = '__ve_ext__'; sx.textContent = VE_EXT_SCRIPT; doc.body.appendChild(sx)
    if (editModeRef.current) {
      setTimeout(() => iframe?.contentWindow?.postMessage({ type: 've-toggle', on: true }, '*'), 80)
    }
  }, [])

  // ── postMessage handler ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data) return
      const d = e.data

      if (d.type === 've-change') {
        htmlRef.current = d.html
      }

      if (d.type === 've-img-click') {
        setImgPopup({ src: d.src || '' })
      }

      if (d.type === 've-link-click') {
        iframeRef.current?.contentWindow?.postMessage({ type: 've-get-anchors' }, '*')
        setLinkPopup({ href: d.href || '', target: d.target || '_self', hasLink: !!d.hasLink, anchors: [] })
      }

      if (d.type === 've-anchors') {
        setLinkPopup(prev => prev ? { ...prev, anchors: d.anchors || [] } : null)
      }

      if (d.type === 've-anchor-click') {
        setAnchorPopup({ current: d.currentId || '' })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // ── Toggle edit mode ──────────────────────────────────────────────────────
  const toggleEdit = () => {
    const next = !editMode
    editModeRef.current = next
    setEditMode(next)
    iframeRef.current?.contentWindow?.postMessage({ type: 've-toggle', on: next }, '*')
  }

  // ── Insert block via postMessage ──────────────────────────────────────────
  const insertBlock = (html: string) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 've-insert-block', html }, '*')
    if (window.innerWidth < 768) setPanelOpen(false)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html_content: stripEditorMeta(htmlRef.current), name }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur sauvegarde') }
      toast.success('Sauvegardé !')
    } catch (err) { toast.error((err as Error).message) }
    finally { setSaving(false) }
  }

  // ── Export ZIP ────────────────────────────────────────────────────────────
  const exportZip = async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}/export`, { method: 'POST' })
      if (!res.ok) throw new Error('Erreur export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${name || 'site'}.zip`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { toast.error((err as Error).message) }
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-2 px-3 shrink-0" style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', zIndex: 50 }}>

        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0"
          style={{ color: 'var(--fg-muted)', background: 'transparent' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="hidden sm:inline">Retour</span>
        </button>

        <div className="w-px h-5 shrink-0" style={{ background: 'var(--border)' }} />

        {/* Panel toggle */}
        <button onClick={() => setPanelOpen(o => !o)}
          className="p-1.5 rounded-lg transition-all shrink-0"
          title={panelOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
          style={{ color: panelOpen ? 'var(--accent)' : 'var(--fg-muted)', background: panelOpen ? 'var(--accent-light)' : 'transparent' }}
          onMouseEnter={e => { if (!panelOpen) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)' }}
          onMouseLeave={e => { if (!panelOpen) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        </button>

        {/* Site name */}
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="min-w-0 flex-1 text-sm font-medium bg-transparent outline-none max-w-[200px] sm:max-w-xs truncate"
          style={{ color: 'var(--fg)', borderBottom: '1px solid transparent' }}
          onFocus={e => { e.target.style.borderBottomColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderBottomColor = 'transparent' }}
        />

        <div className="flex-1" />

        {/* Edit toggle */}
        <button onClick={toggleEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0"
          style={editMode
            ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 0 0 3px var(--accent-light)' }
            : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          <span className="hidden sm:inline">{editMode ? 'Édition ON' : 'Éditer'}</span>
        </button>

        {/* AI */}
        <button onClick={() => setShowAi(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}>
          ✨ <span className="hidden sm:inline">IA</span>
        </button>

        {/* Export */}
        <button onClick={exportZip}
          className="p-1.5 rounded-lg transition-all shrink-0 hidden sm:flex"
          title="Exporter en ZIP"
          style={{ color: 'var(--fg-muted)', background: 'transparent' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>

        {/* Save */}
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#fff' }}
          onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}>
          {saving ? <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
          <span className="hidden sm:inline">{saving ? 'Sauvegarde…' : 'Sauvegarder'}</span>
        </button>
      </header>

      {/* ── Body: panel + iframe ──────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left panel ───────────────────────────────────────────────── */}
        {panelOpen && (
          <aside className="flex flex-col shrink-0 overflow-y-auto" style={{ width: 228, background: 'var(--surface)', borderRight: '1px solid var(--border)', zIndex: 40 }}>

            <div className="px-3 py-2.5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>Blocs</p>
            </div>

            {BLOCK_PALETTE.map(cat => (
              <div key={cat.category}>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)', background: 'var(--surface-2)' }}>{cat.category}</div>
                <div className="p-2 grid grid-cols-2 gap-1.5">
                  {cat.blocks.map(block => (
                    <button
                      key={block.id}
                      onClick={() => {
                        if (block.id === 'image') { setImgPopup({ src: '' }); return }
                        if (block.id === 'video') { setVideoPopup(true); return }
                        insertBlock(block.html)
                      }}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-center transition-all"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-muted)' }}
                    >
                      <span className="text-base leading-none">{block.icon}</span>
                      <span className="text-[10px] font-medium leading-tight">{block.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quick actions */}
            <div className="p-2 mt-auto shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--fg-subtle)' }}>Actions rapides</p>
              <div className="flex flex-col gap-1">
                <button onClick={exportZip} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ color: 'var(--fg-muted)', background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Exporter ZIP
                </button>
                <button onClick={save} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Sauvegarder
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* ── iframe ───────────────────────────────────────────────────── */}
        <div className="flex-1 relative min-w-0">
          <iframe
            ref={iframeRef}
            srcDoc={srcdoc}
            className="w-full h-full border-0"
            style={{ display: 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={injectScripts}
            title="Éditeur de site"
          />
          {editMode && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold pointer-events-none"
              style={{ background: 'rgba(124,58,237,0.9)', color: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
              Mode édition — clic pour sélectionner, double-clic pour modifier
            </div>
          )}
        </div>
      </div>

      {/* ── Popups ───────────────────────────────────────────────────────── */}

      {imgPopup && (
        <ImgPopup
          siteId={siteId}
          currentSrc={imgPopup.src}
          onConfirm={url => {
            if (imgPopup.src === '') {
              insertBlock(`<div style="padding:24px 40px"><img src="${url}" alt="Image" style="width:100%;height:360px;object-fit:cover;border-radius:12px;display:block"/></div>`)
            } else {
              iframeRef.current?.contentWindow?.postMessage({ type: 've-img-confirm', url }, '*')
            }
            setImgPopup(null)
          }}
          onClose={() => setImgPopup(null)}
        />
      )}

      {linkPopup && (
        <LinkPopup
          state={linkPopup}
          onConfirm={(href, target) => {
            if (target === 'remove') {
              iframeRef.current?.contentWindow?.postMessage({ type: 've-link-confirm', remove: true }, '*')
            } else {
              iframeRef.current?.contentWindow?.postMessage({ type: 've-link-confirm', href, target, remove: false }, '*')
            }
            setLinkPopup(null)
          }}
          onClose={() => setLinkPopup(null)}
        />
      )}

      {anchorPopup && (
        <AnchorPopup
          current={anchorPopup.current}
          onConfirm={id => {
            iframeRef.current?.contentWindow?.postMessage({ type: 've-anchor-confirm', id }, '*')
            setAnchorPopup(null)
          }}
          onClose={() => setAnchorPopup(null)}
        />
      )}

      {videoPopup && (
        <VideoPopup
          onConfirm={html => { insertBlock(html); setVideoPopup(false) }}
          onClose={() => setVideoPopup(false)}
        />
      )}

      {showAi && (
        <AiPanel
          siteId={siteId}
          tokensUsed={tokensUsedState}
          tokensLimit={tokensLimit}
          onHtmlChange={html => {
            htmlRef.current = html
            setSrcdoc(buildSrcdoc(html))
            setTokensUsedState(t => t + 50000)
          }}
          onClose={() => setShowAi(false)}
        />
      )}
    </div>
  )
}

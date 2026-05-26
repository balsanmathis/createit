// ─── Shared visual-editor scripts ────────────────────────────────────────────
// Imported by SiteEditor (legacy) and the new /editor route.

export function sanitizeForOffline(html: string): string {
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

export function stripEditorMeta(html: string): string {
  return html
    .replace(/<script[^>]*id="__ve__"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*id="__ve_ext__"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*id="__link_guard__"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*id="__ve_style__"[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<style[^>]*id="__offline__"[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<style[^>]*id="__scroll_fix__"[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<div[^>]*id="__ve_tb__"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="__ve_rb__"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/\s*data-ve-id="\d+"/gi, '')
    .replace(/\s*contenteditable="(true|false)"/gi, '')
}

export function injectScrollFix(html: string): string {
  const fix = '<style id="__scroll_fix__">html,body{height:auto!important;overflow:auto!important;}</style>'
  return /<\/head>/i.test(html)
    ? html.replace(/(<\/head>)/i, fix + '\n$1')
    : fix + '\n' + html
}

export const LINK_GUARD_SCRIPT = `(function(){
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
})()`

export function injectLinkGuard(html: string): string {
  const tag = '<script id="__link_guard__">' + LINK_GUARD_SCRIPT + '</' + 'script>'
  const idx = html.toLowerCase().lastIndexOf('</body>')
  if (idx !== -1) return html.slice(0, idx) + tag + '\n' + html.slice(idx)
  return html + '\n' + tag
}

// Extension injected in addition to the base VE_SCRIPT (adds ve-insert-block)
export const VE_EXT_SCRIPT = `(function(){
window.addEventListener('message',function(e){
  if(!e.data)return;
  if(e.data.type==='ve-insert-block'){
    try{
      var tmp=document.createElement('div');
      tmp.innerHTML=e.data.html;
      var node=tmp.firstElementChild;
      if(!node)return;
      var idc=Date.now();
      node.dataset.veId=String(idc++);
      node.querySelectorAll('*').forEach(function(ch){ch.dataset.veId=String(idc++);});
      var anchor=document.querySelector('footer,#modal,#lightbox');
      if(anchor&&anchor.parentNode===document.body)document.body.insertBefore(node,anchor);
      else document.body.appendChild(node);
      var h=document.documentElement.outerHTML
        .replace(/\\s*contenteditable="[^"]*"/gi,'')
        .replace(/\\s*data-ve-id="[^"]*"/gi,'');
      window.parent.postMessage({type:'ve-change',html:h},'*');
      setTimeout(function(){
        if(window.veSetMode)window.veSetMode(true);
        if(node.click)node.click();
      },40);
    }catch(x){console.warn('ve-insert-block',x);}
  }
});
})()`

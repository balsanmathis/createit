import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Block } from '@/lib/builder/types'

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function defaultAnimation() {
  return { type: 'none' as const, duration: 0.6, delay: 0, trigger: 'scroll' as const, hover: 'none' as const }
}

function splitIntoSections(html: string): { sections: string[]; css: string } {
  // Extract CSS from <head>
  const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  const css = cssMatch?.[1]?.trim() ?? ''

  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  let body = bodyMatch?.[1]?.trim() ?? html

  // Remove inline scripts (they often reference DOM not present in isolated blocks)
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '')

  // Split at each top-level structural tag boundary
  const chunks = body
    .split(/(?=<(?:nav|header|section|article|main|footer)[\s\n>])/i)
    .map(s => s.trim())
    .filter(Boolean)

  return { sections: chunks.length > 0 ? chunks : [body], css }
}

export async function POST(request: Request) {
  try {
    const { siteId } = await request.json()
    if (!siteId) return NextResponse.json({ error: 'siteId requis' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Fetch the AI site
    const { data: site, error } = await supabase
      .from('sites')
      .select('name, html_content')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single()

    if (error || !site) return NextResponse.json({ error: 'Site introuvable' }, { status: 404 })

    const { sections, css } = splitIntoSections(site.html_content ?? '')

    // Build blocks — embed CSS in first block so styles apply everywhere in canvas
    const blocks: Block[] = sections.map((html, i) => ({
      id: genId(),
      type: 'html-embed',
      content: {
        html: i === 0 && css ? `<style>${css}</style>\n${html}` : html,
      },
      style: {},
      animation: defaultAnimation(),
    }))

    // Create builder site
    const { data: builderSite, error: insertError } = await supabase
      .from('builder_sites')
      .insert({
        user_id: user.id,
        name: `${site.name} (importé)`,
        blocks,
        styles: {},
      })
      .select('id')
      .single()

    if (insertError || !builderSite) throw new Error('Erreur création')

    return NextResponse.json({ id: builderSite.id })
  } catch (err) {
    console.error('Import from AI error:', err)
    return NextResponse.json({ error: 'Erreur import' }, { status: 500 })
  }
}

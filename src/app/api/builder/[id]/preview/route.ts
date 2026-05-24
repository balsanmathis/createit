import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import type { Block } from '@/lib/builder/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    const { id } = await params

    const { data, error } = await supabase
      .from('builder_sites')
      .select('name, blocks')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return new NextResponse('Site introuvable', { status: 404 })
    }

    const blocks: Block[] = data.blocks || []
    const bodyParts = blocks.map(block => {
      const def = BLOCK_DEFS.find(d => d.type === block.type)
      if (!def) return ''
      const html = def.render(block.content, block.style)
      if (block.style.anchor) return html.replace(/^(<\w+)/, `$1 id="${block.style.anchor}"`)
      return html
    }).join('\n')

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${data.name}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif}img{max-width:100%}</style>
</head>
<body>
${bodyParts}
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    console.error('Builder preview error:', err)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}

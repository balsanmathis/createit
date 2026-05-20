import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: site, error: fetchError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !site) return NextResponse.json({ error: 'Site introuvable' }, { status: 404 })

    const { data: copy, error: insertError } = await supabase
      .from('sites')
      .insert({
        user_id: user.id,
        name: `${site.name} (copie)`,
        prompt: site.prompt,
        html_content: site.html_content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError || !copy) return NextResponse.json({ error: 'Erreur lors de la duplication' }, { status: 500 })

    return NextResponse.json({ id: copy.id })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

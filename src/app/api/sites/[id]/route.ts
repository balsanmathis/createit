import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await request.json()
    const { html_content, name } = body

    if (!html_content && !name) return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })

    const update: Record<string, string> = { updated_at: new Date().toISOString() }
    if (html_content) update.html_content = html_content
    if (name) update.name = name

    const { error } = await supabase
      .from('sites')
      .update(update)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await params

    const { data, error } = await supabase
      .from('builder_sites')
      .select('id, name, blocks, styles, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Site introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      site: {
        id: data.id,
        name: data.name,
        blocks: data.blocks || [],
        styles: data.styles || {},
      },
    })
  } catch (err) {
    console.error('Builder get error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

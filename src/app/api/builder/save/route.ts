import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Block } from '@/lib/builder/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, blocks, styles = {} }: { id?: string; name: string; blocks: Block[]; styles: Record<string, string> } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    }

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Blocks invalides' }, { status: 400 })
    }

    const now = new Date().toISOString()

    if (id) {
      // Update existing
      const { error } = await supabase
        .from('builder_sites')
        .update({
          name: name.trim(),
          blocks,
          styles,
          updated_at: now,
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return NextResponse.json({ id })
    } else {
      // Create new
      const { data, error } = await supabase
        .from('builder_sites')
        .insert({
          user_id: user.id,
          name: name.trim(),
          blocks,
          styles,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single()

      if (error) throw error

      return NextResponse.json({ id: data.id })
    }
  } catch (err) {
    console.error('Builder save error:', err)
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

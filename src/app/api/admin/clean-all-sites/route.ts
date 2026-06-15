import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cleanHtml } from '@/lib/claude'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'
const BATCH_SIZE = 50

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST() {
  // Auth check via session (anon client)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Data operations via service role (bypasses RLS → accès à tous les sites)
  const admin = getServiceClient()

  let cleaned = 0
  let skipped = 0
  let errors = 0
  let cursor = 0
  const details: { id: string; name: string; status: string; removedChars?: number; error?: string }[] = []

  while (true) {
    const { data: sites, error } = await admin
      .from('sites')
      .select('id, name, prompt, html_content')
      .range(cursor, cursor + BATCH_SIZE - 1)
      .order('id')

    if (error) {
      console.error('[clean-all-sites] fetch error:', error)
      return NextResponse.json({ error: 'Erreur lecture Supabase', cleaned, skipped, errors }, { status: 500 })
    }

    if (!sites || sites.length === 0) break

    for (const site of sites) {
      const original = site.html_content as string | null
      if (!original) { skipped++; continue }

      const fixed = cleanHtml(original, (site.prompt as string | null) ?? undefined)

      if (fixed === original) {
        skipped++
        details.push({ id: site.id, name: site.name ?? '', status: 'already_clean' })
        continue
      }

      const { error: updateError } = await admin
        .from('sites')
        .update({ html_content: fixed })
        .eq('id', site.id)

      if (updateError) {
        console.error(`[clean-all-sites] update error for ${site.id}:`, updateError)
        errors++
        details.push({ id: site.id, name: site.name ?? '', status: 'error', error: updateError.message })
      } else {
        cleaned++
        details.push({ id: site.id, name: site.name ?? '', status: 'cleaned', removedChars: original.length - fixed.length })
      }
    }

    if (sites.length < BATCH_SIZE) break
    cursor += BATCH_SIZE
  }

  console.log(`[clean-all-sites] done — cleaned=${cleaned} skipped=${skipped} errors=${errors}`)
  return NextResponse.json({ ok: true, total: cleaned + skipped + errors, cleaned, skipped, errors, details })
}

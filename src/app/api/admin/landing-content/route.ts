import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const db = serviceClient()
  const { data } = await db
    .from('landing_content')
    .select('value')
    .eq('key', 'content')
    .single()

  if (!data) return NextResponse.json(null)

  try {
    return NextResponse.json(JSON.parse(data.value))
  } catch {
    return NextResponse.json(null)
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const content = await req.json()
  const db = serviceClient()

  const { error } = await db.from('landing_content').upsert(
    { key: 'content', value: JSON.stringify(content) },
    { onConflict: 'key' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

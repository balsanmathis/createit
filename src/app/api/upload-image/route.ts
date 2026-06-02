import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const maxDuration = 30

const BUCKET = 'site-images'

async function ensureBucketExists() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !url) {
    console.warn('[upload] missing service role key — skipping bucket check')
    return
  }
  try {
    const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false } })
    const { data: buckets } = await admin.storage.listBuckets()
    const existing = buckets?.find(b => b.name === BUCKET)
    if (!existing) {
      const { error } = await admin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
      })
      if (error && !error.message.includes('already exists')) throw error
    } else if (!existing.public) {
      await admin.storage.updateBucket(BUCKET, { public: true })
    }
  } catch (err) {
    console.warn('[upload] bucket check failed, attempting upload anyway:', err)
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const siteId = formData.get('siteId') as string | null

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Format non supporté (jpg, png, webp, gif)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const folder = siteId || user.id
  const path = `${folder}/${Date.now()}.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  await ensureBucketExists()

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('[upload-image]', uploadError)
    return NextResponse.json({ error: 'Erreur upload: ' + uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}

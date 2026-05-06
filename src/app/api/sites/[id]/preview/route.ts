import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: site } = await supabase
    .from('sites')
    .select('html_content')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!site) return new Response('Not Found', { status: 404 })

  return new Response(site.html_content, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, max-age=300',
    },
  })
}

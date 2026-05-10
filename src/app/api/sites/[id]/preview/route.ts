import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return new Response('Unauthorized', { status: 401 })

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('html_content')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (siteError || !site) return new Response('Not Found', { status: 404 })

    return new Response(site.html_content, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Cache 5 min privately — reduces repeated Supabase calls from multiple SiteCard iframes
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
      },
    })
  } catch {
    return new Response('Server Error', { status: 500 })
  }
}

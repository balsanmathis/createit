import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `Tu es un expert en copywriting web francophone. Tu améliores le contenu des blocs d'un site web pour maximiser l'engagement et les conversions.

Règles importantes :
- Réponds UNIQUEMENT en JSON valide, sans markdown ni balises de code
- Retourne les mêmes clés que currentContent mais avec du contenu amélioré
- Les textes doivent être en français, percutants et adaptés au web
- Garde des textes courts et impactants (titres < 10 mots, descriptions < 30 mots)
- Pour les URLs (image, src, href), ne les modifie pas sauf si explicitement demandé

Format de réponse attendu :
{"key1": "valeur améliorée", "key2": "valeur améliorée"}`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const {
      prompt,
      blockType,
      currentContent,
      action = 'improve',
    }: {
      prompt: string
      blockType: string
      currentContent: Record<string, string>
      action?: string
    } = await request.json()

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 })
    }

    const userMessage = `Bloc: ${blockType}
Action: ${action}
Contenu actuel: ${JSON.stringify(currentContent, null, 2)}

Demande: ${prompt}

Retourne le contenu amélioré en JSON pur (sans markdown).`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText = message.content
      .filter(c => c.type === 'text')
      .map(c => (c as { type: 'text'; text: string }).text)
      .join('')

    // Parse JSON response
    let improvedContent: Record<string, string> = {}
    let parseError = false

    try {
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        improvedContent = JSON.parse(jsonMatch[0])
      } else {
        parseError = true
      }
    } catch {
      parseError = true
    }

    if (parseError) {
      return NextResponse.json({
        content: currentContent,
        message: responseText,
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      })
    }

    // Filter: only return keys that exist in currentContent
    const filteredContent: Record<string, string> = {}
    for (const key of Object.keys(currentContent)) {
      if (improvedContent[key] !== undefined) {
        filteredContent[key] = String(improvedContent[key])
      }
    }

    const summary = Object.entries(filteredContent)
      .slice(0, 2)
      .map(([k, v]) => `**${k}**: ${String(v).slice(0, 50)}`)
      .join('\n')

    return NextResponse.json({
      content: filteredContent,
      message: `Voici les modifications suggérées pour votre bloc "${blockType}" :\n\n${summary}`,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    })
  } catch (err) {
    console.error('AI assist error:', err)
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

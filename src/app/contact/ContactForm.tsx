'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import GlassCard from '@/components/ui/GlassCard'
import { Send, Loader2 } from 'lucide-react'

interface Field {
  id: string
  label: string
  type: 'text' | 'email' | 'textarea' | 'select'
  placeholder: string
  required?: boolean
  options?: string[]
}

const FIELDS: Field[] = [
  { id: 'name',    label: 'Nom',    type: 'text',  placeholder: 'Votre nom', required: true },
  { id: 'email',   label: 'Email',  type: 'email', placeholder: 'vous@exemple.fr', required: true },
  {
    id: 'subject', label: 'Sujet', type: 'select', placeholder: 'Choisir…',
    options: ['Support technique', 'Question sur les tarifs', 'Partenariat', 'Presse', 'Autre'],
  },
  { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Décrivez votre demande…', required: true },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: 'var(--fg)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

export default function ContactForm() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (id: string, val: string) => setValues(v => ({ ...v, [id]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending || sent) return
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        setSent(true)
        toast.success('Message envoyé — nous répondons sous 24 h.')
      } else {
        toast.error('Erreur lors de l\'envoi. Réessayez ou écrivez-nous directement.')
      }
    } catch {
      toast.error('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <GlassCard className="p-10 text-center max-w-md mx-auto">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>Message envoyé !</h3>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Nous vous répondons sous 24 heures ouvrées. Vérifiez vos spams si besoin.
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {FIELDS.map(f => (
          <div key={f.id}>
            <label className="block text-sm font-medium mb-1.5" htmlFor={f.id} style={{ color: 'var(--fg)' }}>
              {f.label}{f.required && <span style={{ color: 'var(--accent)' }}> *</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                id={f.id}
                value={values[f.id] ?? ''}
                onChange={e => set(f.id, e.target.value)}
                placeholder={f.placeholder}
                required={f.required}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-ring)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            ) : f.type === 'select' ? (
              <select
                id={f.id}
                value={values[f.id] ?? ''}
                onChange={e => set(f.id, e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-ring)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <option value="">{f.placeholder}</option>
                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                id={f.id}
                type={f.type}
                value={values[f.id] ?? ''}
                onChange={e => set(f.id, e.target.value)}
                placeholder={f.placeholder}
                required={f.required}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-ring)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={e => { if (!sending) e.currentTarget.style.background = 'var(--accent-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
        >
          {sending ? <><Loader2 size={15} className="animate-spin" /> Envoi…</> : <><Send size={15} /> Envoyer le message</>}
        </button>
      </form>
    </GlassCard>
  )
}

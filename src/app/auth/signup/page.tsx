'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Vérifiez votre email pour confirmer votre compte !')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(124,109,250,0.12)_0%,transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L7 12L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">
              Create<span className="gradient-text">It</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Créer un compte</h1>
          <p className="text-white/50">Commencez à créer des sites web en secondes</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 border border-violet-500/20">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Mot de passe <span className="text-white/30">(min. 8 caractères)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-violet-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Création...
                </span>
              ) : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-4 text-xs text-white/30 text-center">
            En créant un compte, vous acceptez nos{' '}
            <Link href="#" className="text-violet-400 hover:underline">CGU</Link>
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

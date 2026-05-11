"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { SparklesCore } from "@/components/ui/sparkles";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Send welcome email with promo code (fire & forget — don't block navigation)
    if (data?.user) {
      fetch('/api/auth/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {/* non-blocking */})
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden" style={{ background: "#04040f" }}>
      {/* Sparkles */}
      <div className="absolute inset-0 z-0">
        <SparklesCore background="transparent" particleColor="#ffffff" particleDensity={30} speed={0.3} minSize={0.3} maxSize={1} />
      </div>

      {/* Lamp glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(55,48,163,0.35) 0%, transparent 70%)" }} />

      {/* Orb */}
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(46,16,101,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #5b21b6, #1d4ed8)" }}>
              <span className="text-white font-bold">✦</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: "#e2e8f0" }}>
              Create<span style={{ color: "#7c3aed" }}>It</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ color: "#e2e8f0" }}>Créer un compte</h1>
          <p style={{ color: "#64748b" }}>Commencez à créer des sites web en secondes</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#080820", border: "1px solid #1e1b4b" }}>
          {error && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(127,29,29,0.2)", border: "1px solid rgba(185,28,28,0.3)", color: "#fca5a5" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: "#0d0d2e", border: "1px solid #1e1b4b", color: "#e2e8f0" }}
                onFocus={(e) => (e.target.style.borderColor = "#5b21b6")}
                onBlur={(e) => (e.target.style.borderColor = "#1e1b4b")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                Mot de passe <span style={{ color: "#475569" }}>(min. 8 caractères)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: "#0d0d2e", border: "1px solid #1e1b4b", color: "#e2e8f0" }}
                onFocus={(e) => (e.target.style.borderColor = "#5b21b6")}
                onBlur={(e) => (e.target.style.borderColor = "#1e1b4b")}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#5b21b6" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#6d28d9"; }}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#5b21b6")}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Création...
                </span>
              ) : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "#475569" }}>
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="font-medium transition-colors hover:opacity-80" style={{ color: "#7c3aed" }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

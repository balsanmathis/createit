"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Suspense } from "react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "";
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

    if (data?.user) {
      fetch('/api/auth/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {});
    }

    if (plan) {
      router.push(`/pricing?plan=${plan}`);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.com"
            className="w-full rounded-md px-3.5 py-2.5 text-sm outline-none transition-all"
            style={{ background: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>
            Mot de passe <span style={{ color: "#94a3b8" }}>(min. 8 caractères)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full rounded-md px-3.5 py-2.5 text-sm outline-none transition-all"
            style={{ background: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-medium py-2.5 rounded-md transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          style={{ background: "#0f172a", height: 42 }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#1e293b"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#0f172a"; }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Création…
            </span>
          ) : "Créer mon compte"}
        </button>
      </form>
    </>
  );
}

export default function SignupPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
        backgroundImage: "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%), radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
        backgroundSize: "100% 100%, 32px 32px",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold" style={{ color: "#0f172a", letterSpacing: "-0.3px" }}>
              Create<span style={{ color: "#2563eb" }}>It</span>
            </span>
          </Link>
          <h1 className="text-xl font-semibold mb-1" style={{ color: "#0f172a" }}>Créer un compte</h1>
          <p className="text-sm" style={{ color: "#64748b" }}>Commencez à créer des sites en quelques secondes</p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)" }}
        >
          <Suspense fallback={<div className="h-48 rounded-lg animate-pulse" style={{ background: "#f1f5f9" }} />}>
            <SignupForm />
          </Suspense>

          <div className="mt-5 text-center">
            <p className="text-sm" style={{ color: "#64748b" }}>
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="font-medium transition-colors" style={{ color: "#2563eb" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#2563eb")}
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

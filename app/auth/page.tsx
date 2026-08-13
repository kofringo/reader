'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Save username into Supabase user metadata
          },
        },
      })
      if (error) setErrorMsg(error.message)
      else { router.push('/'); router.refresh() }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setErrorMsg(error.message)
      else { router.push('/'); router.refresh() }
    }

    setLoading(false)
  }

  return (
    <main className="max-w-md mx-auto my-16 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-xl">
      <Link href="/" className="text-sm text-blue-400 hover:underline mb-6 inline-block font-semibold">
        ← Back to Home
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">
        {isSignUp ? 'Create an Account' : 'Welcome Back'}
      </h1>
      <p className="text-xs text-gray-400 mb-6">
        {isSignUp ? 'Sign up to bookmark novels to your library' : 'Sign in to access your saved library'}
      </p>

      {errorMsg && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded mb-4">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-xs font-semibold text-gray-100 mb-1">Username</label>
            <input
              type="text"
              required={isSignUp}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 bg-gray-950 border border-gray-700 rounded text-white text-sm focus:border-blue-500 outline-none"
              placeholder="Your username"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-100 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 bg-gray-950 border border-gray-700 rounded text-white text-sm focus:border-blue-500 outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-100 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 bg-gray-950 border border-gray-700 rounded text-white text-sm focus:border-blue-500 outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-sm transition"
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-gray-800 pt-4">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs text-blue-400 hover:underline font-semibold"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </main>
  )
}
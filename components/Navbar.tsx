'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { Zap } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const router = useRouter()
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabaseRef.current.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg p-1.5">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">ContentCascade</span>
          </Link>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Dashboard</Link>
                <Link href="/billing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Billing</Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Login</Link>
                <Link href="/auth/signup" className="text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 px-4 py-2 rounded-lg transition-opacity">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

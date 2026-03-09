'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Copy, Sparkles, Clock } from 'lucide-react'

interface Generation {
  id: string
  input_text: string
  tone: string
  linkedin: { a: string; b: string; c: string }
  twitter: { a: string[]; b: string[]; c: string[] }
  tiktok: { a: string; b: string; c: string }
  created_at: string
}

interface Profile {
  plan: string
  generations_used_this_month: number
}

export default function DashboardContent({ generations, profile }: { generations: Generation[], profile: Profile | null }) {
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Content Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">All your generated content in one place</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Plan: <span className="font-semibold text-gray-900 capitalize">{profile?.plan || 'Free'}</span></p>
            <p className="text-xs text-gray-400">{profile?.generations_used_this_month || 0} generations used this month</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 text-sm"
          >
            <Sparkles className="h-4 w-4" />
            New Generation
          </Link>
        </div>
      </div>

      {generations.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No generations yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start creating content to see it here</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            Create Your First Generation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => (
            <div key={gen.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div 
                className="flex items-start justify-between p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === gen.id ? null : gen.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{gen.input_text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(gen.created_at).toLocaleDateString()}
                    </span>
                    {gen.tone && (
                      <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">{gen.tone}</span>
                    )}
                  </div>
                </div>
                <svg className={`h-5 w-5 text-gray-400 transition-transform ml-4 ${expandedId === gen.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {expandedId === gen.id && (
                <div className="border-t border-gray-100 p-6 space-y-6">
                  {gen.linkedin?.a && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">💼 LinkedIn Post</h4>
                        <button
                          onClick={() => handleCopy(gen.linkedin.a, `linkedin-${gen.id}`)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="h-3 w-3" />
                          {copied === `linkedin-${gen.id}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">{gen.linkedin.a}</p>
                    </div>
                  )}
                  
                  {gen.twitter?.a && gen.twitter.a.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">🐦 Twitter Thread</h4>
                        <button
                          onClick={() => handleCopy(gen.twitter.a.join('\n\n'), `twitter-${gen.id}`)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="h-3 w-3" />
                          {copied === `twitter-${gen.id}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {gen.twitter.a.slice(0, 3).map((tweet, i) => (
                          <div key={i} className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{tweet}</div>
                        ))}
                        {gen.twitter.a.length > 3 && (
                          <p className="text-xs text-gray-400 text-center">+{gen.twitter.a.length - 3} more tweets</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {gen.tiktok?.a && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">🎵 TikTok Script</h4>
                        <button
                          onClick={() => handleCopy(gen.tiktok.a, `tiktok-${gen.id}`)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="h-3 w-3" />
                          {copied === `tiktok-${gen.id}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">{gen.tiktok.a}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import { Sparkles, Copy, RefreshCw, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TONES = ['Professional', 'Viral / Creator', 'Storytelling', 'Educational', 'Controversial', 'Minimalist']
const PLATFORMS = ['LinkedIn', 'Twitter', 'TikTok'] as const

type Platform = typeof PLATFORMS[number]

interface GenerationResult {
  hooks: string[]
  linkedin: { a: string; b: string; c: string }
  twitter: { a: string[]; b: string[]; c: string[] }
  tiktok: { a: string; b: string; c: string }
}

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [tone, setTone] = useState('Professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [selectedHook, setSelectedHook] = useState<string>('')
  const [activeTab, setActiveTab] = useState<Platform>('LinkedIn')
  const [activeVersion, setActiveVersion] = useState<'a' | 'b' | 'c'>('a')
  const [copied, setCopied] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some content to generate from.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const supabase = createClient()
      await supabase.auth.getUser()
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputText, 
          tone,
          selectedHook: selectedHook || undefined
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        setError(data.error || 'Generation failed. Please try again.')
        return
      }
      
      setResult(data)
      if (data.hooks?.length > 0) setSelectedHook(data.hooks[0])
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getActiveContent = () => {
    if (!result) return ''
    if (activeTab === 'LinkedIn') return result.linkedin[activeVersion]
    if (activeTab === 'TikTok') return result.tiktok[activeVersion]
    if (activeTab === 'Twitter') {
      const tweets = result.twitter[activeVersion]
      return Array.isArray(tweets) ? tweets.join('\n\n') : tweets
    }
    return ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Content Generation
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Turn One Idea Into{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              a Week of Content
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Paste your idea and instantly get LinkedIn posts, Twitter threads, and TikTok scripts — all optimized for engagement.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Content</h2>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="appearance-none bg-gray-100 border-0 text-gray-700 text-sm font-medium px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {TONES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your blog post, article, notes, or any idea here..."
            className="w-full h-48 text-gray-800 placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed"
          />
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">{inputText.length} characters</p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Content
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hook Selector */}
        {result?.hooks && result.hooks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">🎣 Choose Your Hook</h2>
            <p className="text-sm text-gray-500 mb-4">Select a hook to apply to your content</p>
            <div className="space-y-2">
              {result.hooks.map((hook, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedHook(hook)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                    selectedHook === hook
                      ? 'border-purple-500 bg-purple-50 text-purple-900 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {hook}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Output Tabs */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Platform Tabs */}
            <div className="flex border-b border-gray-200">
              {PLATFORMS.map(platform => (
                <button
                  key={platform}
                  onClick={() => setActiveTab(platform)}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === platform
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {platform === 'LinkedIn' && '💼 '}
                  {platform === 'Twitter' && '🐦 '}
                  {platform === 'TikTok' && '🎵 '}
                  {platform}
                </button>
              ))}
            </div>
            
            {/* Version Switcher */}
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Version:</span>
              {(['a', 'b', 'c'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setActiveVersion(v)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    activeVersion === v
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
              <span className="text-xs text-gray-400 ml-2">
                {activeVersion === 'a' && (activeTab === 'LinkedIn' ? 'Story-driven' : activeTab === 'Twitter' ? 'Engaging' : 'Hook-focused')}
                {activeVersion === 'b' && (activeTab === 'LinkedIn' ? 'Contrarian' : activeTab === 'Twitter' ? 'Value-packed' : 'Tutorial style')}
                {activeVersion === 'c' && (activeTab === 'LinkedIn' ? 'Data-driven' : activeTab === 'Twitter' ? 'Thought-leadership' : 'Trending audio')}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'Twitter' ? (
                <div className="space-y-3">
                  {(result.twitter[activeVersion] || []).map((tweet, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-xs text-gray-400 font-mono mt-0.5 w-6 shrink-0">{i + 1}.</span>
                      <p className="text-sm text-gray-800 flex-1">{tweet}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {getActiveContent()}
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleCopy(getActiveContent(), `${activeTab}-${activeVersion}`)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  {copied === `${activeTab}-${activeVersion}` ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

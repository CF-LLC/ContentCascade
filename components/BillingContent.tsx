'use client'
import { useState } from 'react'
import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    description: 'Get started',
    features: ['5 generations/month', 'All platforms (LinkedIn, Twitter, TikTok)', 'Hook generator', 'Tone presets'],
    priceId: null as string | null,
    popular: false,
  },
  {
    name: 'Creator',
    price: 15,
    description: 'For active creators',
    features: ['100 generations/month', 'All platforms', 'Hook generator', 'Tone presets', 'Content multiplier (A/B/C)', 'Priority support'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID ?? null,
    popular: true,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For power users',
    features: ['Unlimited generations', 'All platforms', 'Hook generator', 'Tone presets', 'Content multiplier (A/B/C)', 'Priority support', 'API access (coming soon)'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? null,
    popular: false,
  },
]

interface BillingProfile {
  plan: string
  generations_used_this_month: number
  stripe_subscription_id: string | null
}

export default function BillingContent({ profile }: { profile: BillingProfile | null }) {
  const [loading, setLoading] = useState<string | null>(null)
  const currentPlan = profile?.plan || 'free'

  const handleUpgrade = async (priceId: string) => {
    setLoading(priceId)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  const handleManage = async () => {
    setLoading('portal')
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Simple, Transparent Pricing</h1>
        <p className="text-gray-500">Choose the plan that fits your content creation needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.name.toLowerCase()
          return (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-6 border-2 relative ${
                plan.popular ? 'border-purple-500 shadow-lg shadow-purple-100' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
                <div className="mt-3">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-500 text-sm">/month</span>}
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {isCurrentPlan ? (
                <div>
                  <div className="w-full py-2.5 text-center text-sm font-semibold text-green-700 bg-green-50 rounded-xl mb-2">
                    ✓ Current Plan
                  </div>
                  {currentPlan !== 'free' && (
                    <button
                      onClick={handleManage}
                      disabled={loading === 'portal'}
                      className="w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      {loading === 'portal' ? 'Loading...' : 'Manage Subscription'}
                    </button>
                  )}
                </div>
              ) : plan.priceId ? (
                <button
                  onClick={() => handleUpgrade(plan.priceId!)}
                  disabled={!!loading}
                  className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {loading === plan.priceId ? 'Loading...' : `Upgrade to ${plan.name}`}
                </button>
              ) : (
                <div className="w-full py-2.5 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-xl">
                  Free Forever
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <p className="text-center text-sm text-gray-400 mt-8">
        All plans include a 14-day money-back guarantee. Cancel anytime.
      </p>
    </div>
  )
}

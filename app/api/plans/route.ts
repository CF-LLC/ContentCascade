import { NextResponse } from 'next/server'
import type { Plan } from '@/lib/types'

export const dynamic = 'force-dynamic'

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: 0,
    description: 'Get started',
    features: ['5 generations/month', 'All platforms (LinkedIn, Twitter, TikTok)', 'Hook generator', 'Tone presets'],
    priceId: null,
    popular: false,
  },
  {
    name: 'Creator',
    price: 15,
    description: 'For active creators',
    features: ['100 generations/month', 'All platforms', 'Hook generator', 'Tone presets', 'Content multiplier (A/B/C)', 'Priority support'],
    priceId: process.env.STRIPE_CREATOR_PRICE_ID ?? null,
    popular: true,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For power users',
    features: ['Unlimited generations', 'All platforms', 'Hook generator', 'Tone presets', 'Content multiplier (A/B/C)', 'Priority support', 'API access (coming soon)'],
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    popular: false,
  },
]

export async function GET() {
  return NextResponse.json({ plans: PLANS })
}

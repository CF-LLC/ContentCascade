import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PRICE_TO_PLAN: Record<string, string> = {}
if (process.env.STRIPE_CREATOR_PRICE_ID) {
  PRICE_TO_PLAN[process.env.STRIPE_CREATOR_PRICE_ID] = 'creator'
}
if (process.env.STRIPE_PRO_PRICE_ID) {
  PRICE_TO_PLAN[process.env.STRIPE_PRO_PRICE_ID] = 'pro'
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed.', {
      message,
      sigPresent: !!sig,
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    })
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const subscriptionId = session.subscription as string
      
      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const plan = PRICE_TO_PLAN[priceId] || 'free'
        
        await supabase.from('profiles').update({
          stripe_subscription_id: subscriptionId,
          plan,
        }).eq('id', userId)
      }
      break
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0].price.id
      const plan = PRICE_TO_PLAN[priceId] || 'free'
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()
      
      if (profile) {
        await supabase.from('profiles').update({ plan }).eq('id', profile.id)
      }
      break
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()
      
      if (profile) {
        await supabase.from('profiles').update({ plan: 'free', stripe_subscription_id: null }).eq('id', profile.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

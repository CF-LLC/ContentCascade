import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BillingContent from '@/components/BillingContent'

export default async function Billing() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, generations_used_this_month, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  return <BillingContent profile={profile} />
}

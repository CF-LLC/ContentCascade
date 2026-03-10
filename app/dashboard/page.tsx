import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/DashboardContent'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/auth/login')
  
  const { data: generations } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, generations_used_this_month')
    .eq('id', user.id)
    .single()

  return <DashboardContent generations={generations || []} profile={profile} />
}

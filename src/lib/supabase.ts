import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  throw new Error('Supabase env vars missing. Check .env for VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
})

export type Subscription = {
  id: string
  customer_name: string
  email: string
  plan: 'Starter' | 'Pro' | 'Enterprise'
  mrr: number
  contract_duration_months: number
  status: 'Active' | 'Churned' | 'Trialing'
  start_date: string
  created_at: string
}

export type NewSubscription = Omit<Subscription, 'id' | 'created_at'>

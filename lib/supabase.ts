import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client component client (for use in client components)
export const createSupabaseClient = () => createClientComponentClient()

// Server component client (for use in server components)
// This will be created in individual server components as needed
export const createSupabaseServerClient = async () => {
  // Dynamic import to avoid client-side issues
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
  const { cookies } = await import('next/headers')
  
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Database table interfaces
export interface CreatorProfile {
  id: string
  user_id: string
  channel_id: string
  channel_name: string
  subscriber_count: number
  view_count: number
  estimated_rpm: number
  forecasted_yield: number
  created_at: string
  updated_at: string
  is_active: boolean
  metadata?: Record<string, any>
}

export interface VaultRecord {
  id: string
  vault_id: number
  creator_id: string
  target_amount: number
  current_invested: number
  current_yield: number
  maturity_date: string
  is_matured: boolean
  contract_address: string
  transaction_hash: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface InvestmentRecord {
  id: string
  investor_id: string
  vault_id: number
  amount: number
  expected_return: number
  investment_date: string
  is_active: boolean
  transaction_hash: string
  withdrawal_hash?: string
  created_at: string
  updated_at: string
}

export interface BadgeRecord {
  id: string
  badge_id: number
  recipient_id: string
  badge_type: string
  vault_id: number
  achievement_value: number
  minted_at: string
  transaction_hash: string
  metadata_uri: string
  created_at: string
}

export interface TransactionLog {
  id: string
  transaction_hash: string
  transaction_type: 'vault_creation' | 'investment' | 'yield_distribution' | 'badge_mint' | 'withdrawal'
  user_id: string
  vault_id?: number
  amount?: number
  gas_used?: number
  gas_price?: string
  block_number?: number
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
  error_message?: string
  metadata?: Record<string, any>
}

// Utility functions for database operations
export class SupabaseService {
  private client = supabase

  // Creator operations
  async createCreatorProfile(profile: Omit<CreatorProfile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.client
      .from('creator_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getCreatorProfile(userId: string) {
    const { data, error } = await this.client
      .from('creator_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateCreatorStats(creatorId: string, stats: Partial<CreatorProfile>) {
    const { data, error } = await this.client
      .from('creator_profiles')
      .update({ ...stats, updated_at: new Date().toISOString() })
      .eq('id', creatorId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Vault operations
  async createVaultRecord(vault: Omit<VaultRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.client
      .from('vaults')
      .insert(vault)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getVaultRecord(vaultId: number) {
    const { data, error } = await this.client
      .from('vaults')
      .select(`
        *,
        creator_profiles (*)
      `)
      .eq('vault_id', vaultId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateVaultRecord(vaultId: number, updates: Partial<VaultRecord>) {
    const { data, error } = await this.client
      .from('vaults')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('vault_id', vaultId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Investment operations
  async createInvestmentRecord(investment: Omit<InvestmentRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.client
      .from('investments')
      .insert(investment)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getInvestorInvestments(investorId: string) {
    const { data, error } = await this.client
      .from('investments')
      .select(`
        *,
        vaults (
          *,
          creator_profiles (*)
        )
      `)
      .eq('investor_id', investorId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getVaultInvestments(vaultId: number) {
    const { data, error } = await this.client
      .from('investments')
      .select('*')
      .eq('vault_id', vaultId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Badge operations
  async createBadgeRecord(badge: Omit<BadgeRecord, 'id' | 'created_at'>) {
    const { data, error } = await this.client
      .from('badges')
      .insert(badge)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserBadges(userId: string) {
    const { data, error } = await this.client
      .from('badges')
      .select('*')
      .eq('recipient_id', userId)
      .order('minted_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Transaction logging
  async logTransaction(transaction: Omit<TransactionLog, 'id'>) {
    const { data, error } = await this.client
      .from('transaction_logs')
      .insert(transaction)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateTransactionStatus(
    transactionHash: string, 
    status: TransactionLog['status'], 
    metadata?: Record<string, any>
  ) {
    const { data, error } = await this.client
      .from('transaction_logs')
      .update({ 
        status, 
        metadata: metadata || {},
        timestamp: new Date().toISOString() 
      })
      .eq('transaction_hash', transactionHash)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTransactionHistory(userId: string, limit: number = 50) {
    const { data, error } = await this.client
      .from('transaction_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // Analytics and reporting
  async getVaultAnalytics(vaultId: number) {
    const { data, error } = await this.client
      .rpc('get_vault_analytics', { p_vault_id: vaultId })

    if (error) throw error
    return data
  }

  async getInvestorAnalytics(investorId: string) {
    const { data, error } = await this.client
      .rpc('get_investor_analytics', { p_investor_id: investorId })

    if (error) throw error
    return data
  }

  async getPlatformStats() {
    const { data, error } = await this.client
      .rpc('get_platform_stats')

    if (error) throw error
    return data
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService()

// Helper hooks for React components
export const useSupabaseAuth = () => {
  const client = createSupabaseClient()
  
  return {
    signIn: async (email: string, password: string) => {
      return await client.auth.signInWithPassword({ email, password })
    },
    
    signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
      return await client.auth.signUp({ 
        email, 
        password,
        options: { data: metadata }
      })
    },
    
    signOut: async () => {
      return await client.auth.signOut()
    },
    
    getCurrentUser: async () => {
      const { data: { user } } = await client.auth.getUser()
      return user
    }
  }
}

export default supabase 
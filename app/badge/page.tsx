'use client'

// Prevent prerendering due to wagmi hooks
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Crown, 
  Star, 
  Target, 
  Diamond, 
  TrendingUp, 
  Users, 
  Award,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { useAccount } from 'wagmi'

interface BadgeData {
  id: string
  badge_id: number
  badge_type: string
  vault_id: number
  achievement_value: number
  minted_at: string
  transaction_hash: string
  metadata_uri: string
}

const BADGE_CONFIG = {
  EARLY_INVESTOR: {
    name: 'Early Investor',
    description: 'First 10 investors in a vault',
    icon: Trophy,
    color: 'bg-blue-500',
    rarity: 'Rare'
  },
  HIGH_ROLLER: {
    name: 'High Roller',
    description: 'Invested more than $1,000 USDC',
    icon: Crown,
    color: 'bg-purple-500',
    rarity: 'Epic'
  },
  YIELD_MASTER: {
    name: 'Yield Master',
    description: 'Earned more than $100 USDC in yield',
    icon: Star,
    color: 'bg-yellow-500',
    rarity: 'Legendary'
  },
  VAULT_PIONEER: {
    name: 'Vault Pioneer',
    description: 'Invested in 5+ different vaults',
    icon: Target,
    color: 'bg-green-500',
    rarity: 'Epic'
  },
  DIAMOND_HANDS: {
    name: 'Diamond Hands',
    description: 'Held investments for 6+ months',
    icon: Diamond,
    color: 'bg-cyan-500',
    rarity: 'Legendary'
  },
  YIELD_HUNTER: {
    name: 'Yield Hunter',
    description: 'Earned yield in 3+ vaults',
    icon: TrendingUp,
    color: 'bg-orange-500',
    rarity: 'Rare'
  },
  COMMUNITY_BUILDER: {
    name: 'Community Builder',
    description: 'Referred 5+ new investors',
    icon: Users,
    color: 'bg-pink-500',
    rarity: 'Epic'
  },
  MILESTONE_ACHIEVER: {
    name: 'Milestone Achiever',
    description: 'Helped vault reach funding milestone',
    icon: Award,
    color: 'bg-red-500',
    rarity: 'Common'
  }
}

export default function BadgePage() {
  const [isClient, setIsClient] = useState(false)
  const { address, isConnected } = isClient ? useAccount() : { address: undefined, isConnected: false }
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('earned')

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    const loadBadges = async () => {
      if (!isConnected || !address) {
        setIsLoading(false)
        return
      }

      try {
        const { supabaseService } = await import('@/lib/supabase')
        const userBadges = await supabaseService.getUserBadges(address)
        setBadges(userBadges)
      } catch (error) {
        console.error('Error loading badges:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBadges()
  }, [address, isConnected, isClient])

  const getBadgeIcon = (badgeType: string) => {
    const config = BADGE_CONFIG[badgeType as keyof typeof BADGE_CONFIG]
    return config?.icon || Award
  }

  const getBadgeConfig = (badgeType: string) => {
    return BADGE_CONFIG[badgeType as keyof typeof BADGE_CONFIG] || {
      name: 'Unknown Badge',
      description: 'Mystery achievement',
      icon: Award,
      color: 'bg-gray-500',
      rarity: 'Common'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-100 text-gray-800'
      case 'Rare': return 'bg-blue-100 text-blue-800'
      case 'Epic': return 'bg-purple-100 text-purple-800'
      case 'Legendary': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900">
                <Trophy className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Achievement Badges</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect your wallet to view your earned badges and track your investment achievements in the StreamFund ecosystem.
            </p>
            <Button size="lg" className="mt-6">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Achievement Badges</h1>
          <p className="text-xl text-muted-foreground">
            Showcase your investment milestones and achievements
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earned">My Badges ({badges.length})</TabsTrigger>
            <TabsTrigger value="available">All Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="earned" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading your badges...</span>
              </div>
            ) : badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge) => {
                  const config = getBadgeConfig(badge.badge_type)
                  const IconComponent = config.icon
                  
                  return (
                    <Card key={badge.id} className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
                      <div className={`absolute top-0 right-0 w-16 h-16 ${config.color} opacity-10 rounded-bl-full`} />
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-full ${config.color} text-white`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <Badge className={getRarityColor(config.rarity)}>
                            {config.rarity}
                          </Badge>
                        </div>
                        
                        <CardTitle className="text-xl">{config.name}</CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Earned: {formatDate(badge.minted_at)}</div>
                          <div>Vault: #{badge.vault_id}</div>
                          {badge.achievement_value > 0 && (
                            <div>Value: {badge.achievement_value.toLocaleString()}</div>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a 
                            href={`https://sepolia.arbiscan.io/tx/${badge.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            View on Arbiscan
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-muted">
                    <Trophy className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">No Badges Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start investing in vaults to earn your first achievement badge!
                </p>
                <Button asChild>
                  <a href="/marketplace">
                    Explore Vaults
                  </a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(BADGE_CONFIG).map(([type, config]) => {
                const IconComponent = config.icon
                const isEarned = badges.some(badge => badge.badge_type === type)
                
                return (
                  <Card 
                    key={type} 
                    className={`relative overflow-hidden border-2 transition-all ${
                      isEarned 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                        : 'border-gray-200 opacity-75'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-16 h-16 ${config.color} opacity-10 rounded-bl-full`} />
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-full ${config.color} text-white ${!isEarned && 'opacity-50'}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getRarityColor(config.rarity)}>
                            {config.rarity}
                          </Badge>
                          {isEarned && (
                            <Badge className="bg-green-100 text-green-800">
                              Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardTitle className={`text-xl ${!isEarned && 'text-muted-foreground'}`}>
                        {config.name}
                      </CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
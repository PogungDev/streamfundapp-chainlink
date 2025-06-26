'use client'

// Prevent prerendering due to client-side only features
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, TrendingUp, Users, DollarSign, Calendar, Loader2 } from 'lucide-react'

interface ImpactData {
  vaultId: number
  channelName: string
  totalInvested: number
  currentYield: number
  investorCount: number
  createdDate: string
  maturityDate: string
  impactMetrics: {
    contentSupported: number
    creatorsEmpowered: number
    communityGrowth: number
    economicImpact: number
  }
}

export default function ImpactSummaryPage() {
  const searchParams = useSearchParams()
  const vaultId = searchParams.get('vault')
  
  const [impactData, setImpactData] = useState<ImpactData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadImpactData = async () => {
      if (!vaultId) {
        setIsLoading(false)
        return
      }

      try {
        // Get vault data
        const { supabaseService } = await import('@/lib/supabase')
        const vault = await supabaseService.getVaultRecord(parseInt(vaultId))
        const analytics = await supabaseService.getVaultAnalytics(parseInt(vaultId))
        
        if (vault) {
          const data: ImpactData = {
            vaultId: vault.vault_id,
            channelName: vault.creator_profiles?.channel_name || 'Unknown Creator',
            totalInvested: vault.current_invested,
            currentYield: vault.current_yield,
            investorCount: analytics?.investor_count || 0,
            createdDate: vault.created_at,
            maturityDate: vault.maturity_date,
            impactMetrics: {
              contentSupported: Math.floor(vault.current_invested / 100), // Estimated videos supported
              creatorsEmpowered: 1,
              communityGrowth: analytics?.investor_count || 0,
              economicImpact: vault.current_invested + vault.current_yield
            }
          }
          setImpactData(data)
        }
      } catch (error) {
        console.error('Error loading impact data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadImpactData()
  }, [vaultId])

  const downloadReport = async () => {
    if (!impactData || typeof window === 'undefined') return

    // Generate PDF-style report content
    const reportContent = `
StreamFund Impact Report
Vault #${impactData.vaultId} - ${impactData.channelName}

=== INVESTMENT SUMMARY ===
Total Invested: $${impactData.totalInvested.toLocaleString()}
Current Yield: $${impactData.currentYield.toLocaleString()}
Number of Investors: ${impactData.investorCount}
Vault Created: ${new Date(impactData.createdDate).toLocaleDateString()}
Maturity Date: ${new Date(impactData.maturityDate).toLocaleDateString()}

=== IMPACT METRICS ===
Content Creation Supported: ${impactData.impactMetrics.contentSupported} videos estimated
Creators Empowered: ${impactData.impactMetrics.creatorsEmpowered}
Community Growth: ${impactData.impactMetrics.communityGrowth} investors
Economic Impact: $${impactData.impactMetrics.economicImpact.toLocaleString()}

=== ABOUT STREAMFUND ===
StreamFund is revolutionizing creator economy investments through:
- Transparent yield distribution
- Real-time performance tracking
- Cross-chain accessibility
- Creator empowerment

Generated on: ${new Date().toISOString()}
Powered by StreamFund AI & Chainlink
    `.trim()

    try {
      // Create downloadable file
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `streamfund-impact-report-vault-${impactData.vaultId}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Generating impact summary...</p>
        </div>
      </div>
    )
  }

  if (!impactData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Impact Data Not Found</h1>
          <p className="text-muted-foreground">Unable to generate impact summary.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Impact Summary</h1>
          <p className="text-xl text-muted-foreground">
            Vault #{impactData.vaultId} - {impactData.channelName}
          </p>
          <div className="mt-4">
            <Button onClick={downloadReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Investment Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Investment Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${impactData.totalInvested.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Invested</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${impactData.currentYield.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Yield</div>
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {impactData.investorCount}
                </div>
                <div className="text-sm text-muted-foreground">Active Investors</div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Creator Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <span className="font-medium">Content Supported</span>
                  <Badge variant="secondary">
                    ~{impactData.impactMetrics.contentSupported} videos
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                  <span className="font-medium">Creators Empowered</span>
                  <Badge variant="secondary">
                    {impactData.impactMetrics.creatorsEmpowered}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                  <span className="font-medium">Community Growth</span>
                  <Badge variant="secondary">
                    {impactData.impactMetrics.communityGrowth} investors
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <span className="font-medium">Economic Impact</span>
                  <Badge variant="secondary">
                    ${impactData.impactMetrics.economicImpact.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vault Created</span>
                  <span className="font-medium">
                    {new Date(impactData.createdDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Maturity Date</span>
                  <span className="font-medium">
                    {new Date(impactData.maturityDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Days Active</span>
                  <span className="font-medium">
                    {Math.floor((Date.now() - new Date(impactData.createdDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About StreamFund */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                About StreamFund
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                StreamFund is revolutionizing the creator economy by enabling transparent, 
                yield-generating investments in YouTube creators through blockchain technology.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time yield distribution</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Chainlink-powered data feeds</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Cross-chain accessibility</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Creator empowerment focus</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Report generated on {new Date().toLocaleDateString()} • 
            Powered by StreamFund AI & Chainlink • 
            Deploy on Arbitrum Sepolia
          </p>
        </div>
      </div>
    </div>
  )
} 
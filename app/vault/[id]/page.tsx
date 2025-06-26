'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, TrendingUp, Users, DollarSign, ExternalLink, Loader2 } from 'lucide-react'
import { useVault, type VaultData } from '@/lib/useVault'
import { supabaseService } from '@/lib/supabase'
import { toast } from 'sonner'

export default function VaultPage() {
  const params = useParams()
  const vaultId = parseInt(params.id as string)
  
  const {
    isLoading,
    isConnected,
    address,
    investInVault,
    approveUSDC,
    getUSDCBalance,
    getUSDCAllowance,
    needsApproval,
    formatUSDC
  } = useVault()

  const [vaultData, setVaultData] = useState<VaultData | null>(null)
  const [investAmount, setInvestAmount] = useState('')
  const [isLoadingVault, setIsLoadingVault] = useState(true)

  // Load vault data
  useEffect(() => {
    const loadVaultData = async () => {
      setIsLoadingVault(true)
      try {
        // Get vault data from Supabase (which includes on-chain data)
        const supabaseVault = await supabaseService.getVaultRecord(vaultId)
        
        if (supabaseVault) {
          const data: VaultData = {
            vaultId: supabaseVault.vault_id,
            creatorId: 0, // Will be fetched from contract
            channelName: supabaseVault.creator_profiles?.channel_name || '',
            channelId: supabaseVault.creator_profiles?.channel_id || '',
            targetAmount: BigInt(supabaseVault.target_amount * 1000000), // Convert to wei (6 decimals)
            totalInvested: BigInt(supabaseVault.current_invested * 1000000),
            currentYield: BigInt(supabaseVault.current_yield * 1000000),
            maturityDate: BigInt(Math.floor(new Date(supabaseVault.maturity_date).getTime() / 1000)),
            isMatured: supabaseVault.is_matured,
            metadataURI: '',
            totalInvestors: 0, // Will be calculated
            isFunded: supabaseVault.current_invested >= supabaseVault.target_amount
          }
          setVaultData(data)
        }
      } catch (error) {
        console.error('Error loading vault:', error)
        toast.error('Failed to load vault data')
      } finally {
        setIsLoadingVault(false)
      }
    }

    if (vaultId) {
      loadVaultData()
    }
  }, [vaultId])

  const handleInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      // Check if approval is needed
      if (needsApproval(investAmount)) {
        toast.info('Approving USDC spending...')
        await approveUSDC(investAmount)
        return
      }

      // Proceed with investment
      const txHash = await investInVault({
        vaultId,
        amount: investAmount
      })

      if (txHash) {
        toast.success('Investment successful! Transaction submitted.')
        setInvestAmount('')
        
        // Log investment to Supabase
        await supabaseService.createInvestmentRecord({
          investor_id: address!,
          vault_id: vaultId,
          amount: parseFloat(investAmount),
          expected_return: 0, // Will be calculated by smart contract
          investment_date: new Date().toISOString(),
          is_active: true,
          transaction_hash: txHash
        })
      }
    } catch (error) {
      console.error('Investment error:', error)
      toast.error('Investment failed')
    }
  }

  if (isLoadingVault) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading vault data...</p>
        </div>
      </div>
    )
  }

  if (!vaultData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Vault Not Found</h1>
          <p className="text-muted-foreground">The requested vault could not be found.</p>
        </div>
      </div>
    )
  }

  const fundingProgress = (Number(formatUSDC(vaultData.totalInvested)) / Number(formatUSDC(vaultData.targetAmount))) * 100
  const isMatured = vaultData.isMatured || Date.now() / 1000 > Number(vaultData.maturityDate)
  const daysToMaturity = Math.max(0, Math.floor((Number(vaultData.maturityDate) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{vaultData.channelName} Vault</h1>
              <p className="text-muted-foreground">Vault ID: #{vaultData.vaultId}</p>
            </div>
            <Badge variant={isMatured ? "secondary" : vaultData.isFunded ? "default" : "outline"}>
              {isMatured ? "Matured" : vaultData.isFunded ? "Funded" : "Funding"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {daysToMaturity > 0 ? `${daysToMaturity} days to maturity` : 'Matured'}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {vaultData.totalInvestors} investors
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Vault Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Funding Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Funding Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised</span>
                    <span className="font-medium">
                      ${formatUSDC(vaultData.totalInvested)} / ${formatUSDC(vaultData.targetAmount)}
                    </span>
                  </div>
                  <Progress value={fundingProgress} className="h-3" />
                  <div className="text-center text-sm text-muted-foreground">
                    {fundingProgress.toFixed(1)}% funded
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vault Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Vault Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">${formatUSDC(vaultData.targetAmount)}</div>
                    <div className="text-sm text-muted-foreground">Target</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">${formatUSDC(vaultData.totalInvested)}</div>
                    <div className="text-sm text-muted-foreground">Invested</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">${formatUSDC(vaultData.currentYield)}</div>
                    <div className="text-sm text-muted-foreground">Yield</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{vaultData.totalInvestors}</div>
                    <div className="text-sm text-muted-foreground">Investors</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>Creator Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Channel Name</label>
                    <p className="text-lg">{vaultData.channelName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Channel ID</label>
                    <p className="text-lg font-mono">{vaultData.channelId}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span>YouTube Channel</span>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://youtube.com/channel/${vaultData.channelId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Visit Channel
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Panel */}
          <div className="space-y-6">
            {/* Investment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Invest in Vault
                </CardTitle>
                <CardDescription>
                  Minimum investment: $10 USDC
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected ? (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="amount" className="text-sm font-medium">
                        Investment Amount (USDC)
                      </label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        min="10"
                        step="0.01"
                        disabled={isMatured || vaultData.isFunded}
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Your USDC Balance: ${getUSDCBalance()}</div>
                      <div>USDC Allowance: ${getUSDCAllowance()}</div>
                    </div>

                    <Button 
                      onClick={handleInvest}
                      disabled={isLoading || isMatured || vaultData.isFunded || !investAmount}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : needsApproval(investAmount) && investAmount ? (
                        'Approve USDC'
                      ) : (
                        'Invest Now'
                      )}
                    </Button>

                    {(isMatured || vaultData.isFunded) && (
                      <p className="text-xs text-center text-muted-foreground">
                        {isMatured ? 'This vault has matured' : 'This vault is fully funded'}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Connect your wallet to invest in this vault
                    </p>
                    <Button className="w-full">
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/impact-summary?vault=${vaultId}`}>
                    View Impact Summary
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <a 
                    href={`https://sepolia.arbiscan.io/address/${process.env.NEXT_PUBLIC_VAULT_NFT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Arbiscan
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Risk Disclaimer */}
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-200">
                  Risk Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                <p>
                  Investments in creator yield vaults carry risk. Past performance does not guarantee future results.
                </p>
                <p>
                  YouTube revenue can be volatile and affected by platform changes, audience behavior, and market conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 
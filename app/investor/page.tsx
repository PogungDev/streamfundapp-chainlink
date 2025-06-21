"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Users,
  Filter,
  Search,
  ArrowUpRight,
  Coins,
  Shield,
  Zap,
  Clock,
  BarChart3,
  Target,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Copy,
  Gift,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Vault {
  id: string
  creator: string
  channelName: string
  channelId: string
  category: string
  targetAmount: number
  currentFunding: number
  investorCount: number
  apr: number
  riskScore: number
  subscribers: number
  monthlyViews: number
  createdAt: Date
  isActive: boolean
  minInvestment: number
}

interface Investment {
  id: string
  vaultId: string
  vaultName: string
  amount: number
  sharesOwned: number
  nftTokenId: number
  investedAt: Date
  currentValue: number
  totalYieldClaimed: number
  pendingYield: number
  apr: number
}

export default function InvestorPage() {
  const [vaults, setVaults] = useState<Vault[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [filteredVaults, setFilteredVaults] = useState<Vault[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [isInvesting, setIsInvesting] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [usdcBalance, setUsdcBalance] = useState(25000)

  const { toast } = useToast()

  // Mock data initialization
  useEffect(() => {
    setVaults([
      {
        id: "vault-1",
        creator: "TechGaming Pro",
        channelName: "TechGaming Pro",
        channelId: "@techgamingpro",
        category: "Gaming",
        targetAmount: 150000,
        currentFunding: 89500,
        investorCount: 23,
        apr: 14.2,
        riskScore: 28,
        subscribers: 2400000,
        monthlyViews: 45200000,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        minInvestment: 100
      },
      {
        id: "vault-2",
        creator: "MusicMaven",
        channelName: "MusicMaven Studio",
        channelId: "@musicmaven",
        category: "Music",
        targetAmount: 200000,
        currentFunding: 156800,
        investorCount: 45,
        apr: 11.8,
        riskScore: 35,
        subscribers: 1800000,
        monthlyViews: 32100000,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        isActive: true,
        minInvestment: 250
      },
      {
        id: "vault-3",
        creator: "EduTech Academy",
        channelName: "EduTech Academy",
        channelId: "@edutechacademy",
        category: "Education",
        targetAmount: 300000,
        currentFunding: 234600,
        investorCount: 67,
        apr: 9.5,
        riskScore: 22,
        subscribers: 3200000,
        monthlyViews: 28700000,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        minInvestment: 500
      },
      {
        id: "vault-4",
        creator: "DIY Workshop",
        channelName: "DIY Workshop",
        channelId: "@diyworkshop",
        category: "DIY & Crafts",
        targetAmount: 120000,
        currentFunding: 67300,
        investorCount: 34,
        apr: 13.7,
        riskScore: 42,
        subscribers: 890000,
        monthlyViews: 18400000,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isActive: true,
        minInvestment: 150
      }
    ])

    setInvestments([
      {
        id: "inv-1",
        vaultId: "vault-1",
        vaultName: "TechGaming Pro",
        amount: 2500,
        sharesOwned: 2500,
        nftTokenId: 1001,
        investedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        currentValue: 2687,
        totalYieldClaimed: 87,
        pendingYield: 29.75,
        apr: 14.2
      },
      {
        id: "inv-2",
        vaultId: "vault-2",
        vaultName: "MusicMaven Studio",
        amount: 1000,
        sharesOwned: 1000,
        nftTokenId: 1002,
        investedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        currentValue: 1098,
        totalYieldClaimed: 32,
        pendingYield: 9.83,
        apr: 11.8
      }
    ])

    // Simulate wallet connection
    setConnectedWallet("0x742d35Cc6634C0532925a3b8D399C3e2DE8a5B61")
  }, [])

  // Filter vaults based on search and filters
  useEffect(() => {
    let filtered = vaults.filter(vault => vault.isActive)

    if (searchTerm) {
      filtered = filtered.filter(vault =>
        vault.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vault.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vault.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(vault => vault.category === categoryFilter)
    }

    if (riskFilter !== "all") {
      if (riskFilter === "low") {
        filtered = filtered.filter(vault => vault.riskScore <= 30)
      } else if (riskFilter === "medium") {
        filtered = filtered.filter(vault => vault.riskScore > 30 && vault.riskScore <= 60)
      } else if (riskFilter === "high") {
        filtered = filtered.filter(vault => vault.riskScore > 60)
      }
    }

    setFilteredVaults(filtered)
  }, [vaults, searchTerm, categoryFilter, riskFilter])

  const handleInvest = async () => {
    if (!selectedVault || !investmentAmount || !connectedWallet) return

    const amount = parseFloat(investmentAmount)
    if (amount < selectedVault.minInvestment) {
      toast({
        title: "❌ Investment Too Small",
        description: `Minimum investment is $${selectedVault.minInvestment}`,
        variant: "destructive"
      })
      return
    }

    if (amount > usdcBalance) {
      toast({
        title: "❌ Insufficient Balance",
        description: "You don't have enough USDC for this investment",
        variant: "destructive"
      })
      return
    }

    setIsInvesting(true)

    try {
      // Simulate investment process
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Update vault funding
      setVaults(prev => prev.map(vault =>
        vault.id === selectedVault.id
          ? {
            ...vault,
            currentFunding: vault.currentFunding + amount,
            investorCount: vault.investorCount + 1
          }
          : vault
      ))

      // Add new investment
      const newInvestment: Investment = {
        id: `inv-${Date.now()}`,
        vaultId: selectedVault.id,
        vaultName: selectedVault.channelName,
        amount,
        sharesOwned: amount, // 1:1 ratio for simplicity
        nftTokenId: Math.floor(Math.random() * 9000) + 1000,
        investedAt: new Date(),
        currentValue: amount,
        totalYieldClaimed: 0,
        pendingYield: 0,
        apr: selectedVault.apr
      }

      setInvestments(prev => [newInvestment, ...prev])
      setUsdcBalance(prev => prev - amount)

      toast({
        title: "🎉 Investment Successful!",
        description: `Invested $${amount} in ${selectedVault.channelName}. NFT #${newInvestment.nftTokenId} minted.`,
      })

      setIsInvestModalOpen(false)
      setInvestmentAmount("")
      setSelectedVault(null)
    } catch (error) {
      toast({
        title: "❌ Investment Failed",
        description: "Unable to process investment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsInvesting(false)
    }
  }

  const handleClaimYield = async (investment: Investment) => {
    if (investment.pendingYield <= 0) return

    setIsClaiming(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      setInvestments(prev => prev.map(inv =>
        inv.id === investment.id
          ? {
            ...inv,
            totalYieldClaimed: inv.totalYieldClaimed + inv.pendingYield,
            pendingYield: 0
          }
          : inv
      ))

      setUsdcBalance(prev => prev + investment.pendingYield)

      toast({
        title: "💰 Yield Claimed!",
        description: `Claimed $${investment.pendingYield.toFixed(2)} yield from ${investment.vaultName}`,
      })
    } catch (error) {
      toast({
        title: "❌ Claim Failed",
        description: "Unable to claim yield. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsClaiming(false)
    }
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 30) return "text-green-400 bg-green-500/20"
    if (riskScore <= 60) return "text-yellow-400 bg-yellow-500/20"
    return "text-red-400 bg-red-500/20"
  }

  const getRiskLabel = (riskScore: number) => {
    if (riskScore <= 30) return "Low"
    if (riskScore <= 60) return "Medium"
    return "High"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "📋 Copied",
      description: "Address copied to clipboard",
    })
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalPendingYield = investments.reduce((sum, inv) => sum + inv.pendingYield, 0)
  const totalYieldClaimed = investments.reduce((sum, inv) => sum + inv.totalYieldClaimed, 0)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">
                💰 Investor Dashboard
              </h1>
              <p className="text-zinc-400">
                Discover vaults, invest USDC, and earn yield from creator economy
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500/20 text-green-400 px-4 py-2">
                <Wallet className="h-4 w-4 mr-2" />
                ${usdcBalance.toLocaleString()} USDC
              </Badge>
              {connectedWallet && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-zinc-400">
                    {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(connectedWallet)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="marketplace" className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto bg-zinc-900">
            <TabsTrigger value="marketplace" className="font-mono">
              <Search className="h-4 w-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="font-mono">
              <BarChart3 className="h-4 w-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="yield" className="font-mono">
              <Gift className="h-4 w-4 mr-2" />
              Yield Claims
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Filters */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Search vaults, creators, categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="DIY & Crafts">DIY & Crafts</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk (≤30)</SelectItem>
                      <SelectItem value="medium">Medium Risk (31-60)</SelectItem>
                      <SelectItem value="high">High Risk (>60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Vault Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVaults.map((vault) => (
                <Card key={vault.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{vault.channelName}</CardTitle>
                        <p className="text-zinc-400 text-sm">{vault.creator}</p>
                      </div>
                      <Badge className={`${getRiskColor(vault.riskScore)} px-2 py-1`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {getRiskLabel(vault.riskScore)}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {vault.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Funding Progress</span>
                        <span>{((vault.currentFunding / vault.targetAmount) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(vault.currentFunding / vault.targetAmount) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-zinc-400">
                        <span>${vault.currentFunding.toLocaleString()}</span>
                        <span>${vault.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-400">{vault.apr}%</div>
                        <div className="text-xs text-zinc-400">APR</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">{vault.investorCount}</div>
                        <div className="text-xs text-zinc-400">Investors</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-400">
                          ${vault.minInvestment}
                        </div>
                        <div className="text-xs text-zinc-400">Min Invest</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Subscribers:</span>
                        <span>{(vault.subscribers / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Monthly Views:</span>
                        <span>{(vault.monthlyViews / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedVault(vault)
                        setIsInvestModalOpen(true)
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Invest in Vault
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid lg:grid-cols-4 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    ${totalInvested.toLocaleString()}
                  </div>
                  <div className="text-sm text-zinc-400">Total Invested</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    ${totalCurrentValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-zinc-400">Current Value</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">
                    ${totalYieldClaimed.toFixed(2)}
                  </div>
                  <div className="text-sm text-zinc-400">Total Yield Claimed</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">
                    ${totalPendingYield.toFixed(2)}
                  </div>
                  <div className="text-sm text-zinc-400">Pending Yield</div>
                </CardContent>
              </Card>
            </div>

            {/* Investment List */}
            <div className="space-y-4">
              {investments.map((investment) => (
                <Card key={investment.id} className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                          <Coins className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{investment.vaultName}</h3>
                          <p className="text-sm text-zinc-400">
                            NFT #{investment.nftTokenId} • {investment.sharesOwned.toLocaleString()} shares
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          {investment.apr}% APR
                        </div>
                        <div className="text-sm text-zinc-400">
                          Invested: ${investment.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-zinc-800">
                      <div className="text-center">
                        <div className="text-sm text-zinc-400">Current Value</div>
                        <div className="font-semibold">${investment.currentValue.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-zinc-400">Total Claimed</div>
                        <div className="font-semibold text-green-400">${investment.totalYieldClaimed.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-zinc-400">Pending Yield</div>
                        <div className="font-semibold text-yellow-400">${investment.pendingYield.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-zinc-400">Days Invested</div>
                        <div className="font-semibold">
                          {Math.floor((Date.now() - investment.investedAt.getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Yield Claims Tab */}
          <TabsContent value="yield" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Yield Claims</h2>
              <p className="text-zinc-400">
                Claim your pending yields from active investments
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {investments.filter(inv => inv.pendingYield > 0).map((investment) => (
                <Card key={investment.id} className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{investment.vaultName}</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        <Gift className="h-3 w-3 mr-1" />
                        Yield Available
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6 bg-zinc-800/50 rounded-lg">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">
                        ${investment.pendingYield.toFixed(2)}
                      </div>
                      <div className="text-sm text-zinc-400">Available to Claim</div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">NFT Token ID:</span>
                        <span>#{investment.nftTokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Shares Owned:</span>
                        <span>{investment.sharesOwned.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">APR:</span>
                        <span>{investment.apr}%</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleClaimYield(investment)}
                      disabled={isClaiming}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Gift className="h-4 w-4 mr-2" />
                          Claim Yield
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {investments.filter(inv => inv.pendingYield > 0).length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-400 mb-2">No Pending Yields</h3>
                  <p className="text-zinc-500">
                    You don't have any pending yields to claim at the moment.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Investment Modal */}
      <Dialog open={isInvestModalOpen} onOpenChange={setIsInvestModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-green-400">
              Invest in {selectedVault?.channelName}
            </DialogTitle>
          </DialogHeader>
          {selectedVault && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">APR:</span>
                    <span className="text-green-400">{selectedVault.apr}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Risk:</span>
                    <span className={getRiskColor(selectedVault.riskScore)}>
                      {getRiskLabel(selectedVault.riskScore)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Min Investment:</span>
                    <span>${selectedVault.minInvestment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Your Balance:</span>
                    <span>${usdcBalance.toLocaleString()} USDC</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment-amount">Investment Amount (USDC)</Label>
                <Input
                  id="investment-amount"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder={`Min: ${selectedVault.minInvestment}`}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsInvestModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInvest}
                  disabled={isInvesting || !investmentAmount}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isInvesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Investing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Invest & Mint NFT
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 
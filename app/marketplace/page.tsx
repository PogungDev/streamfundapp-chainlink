"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { AISearchSummary } from "@/components/ai-search-summary"
import { Shield, DollarSign, Gamepad2, Music, BookOpen, Wrench } from "lucide-react"
import { AISearchEnhanced } from "@/components/ai-search-enhanced"
import { EngineMappingBadges } from "@/components/engine-mapping-badges"
import { USDCInjectModal } from "@/components/usdc-inject-modal"
import { useSearchParams } from "next/navigation"

const vaultData = [
  {
    id: 1,
    creator: "TechGaming Pro",
    channel: "@techgamingpro",
    category: "Gaming",
    icon: Gamepad2,
    apr: "14.2%",
    term: "12 months",
    minInvestment: "$100",
    totalRaised: "$89,500",
    maxFunding: "$150,000",
    riskScore: "Low",
    subscribers: "2.4M",
    monthlyViews: "45.2M",
  },
  {
    id: 2,
    creator: "MusicMaven",
    channel: "@musicmaven",
    category: "Music",
    icon: Music,
    apr: "11.8%",
    term: "18 months",
    minInvestment: "$250",
    totalRaised: "$156,800",
    maxFunding: "$200,000",
    riskScore: "Medium",
    subscribers: "1.8M",
    monthlyViews: "32.1M",
  },
  {
    id: 3,
    creator: "EduTech Academy",
    channel: "@edutechacademy",
    category: "Education",
    icon: BookOpen,
    apr: "9.5%",
    term: "24 months",
    minInvestment: "$500",
    totalRaised: "$234,600",
    maxFunding: "$300,000",
    riskScore: "Low",
    subscribers: "3.2M",
    monthlyViews: "28.7M",
  },
  {
    id: 4,
    creator: "DIY Workshop",
    channel: "@diyworkshop",
    category: "DIY & Crafts",
    icon: Wrench,
    apr: "13.7%",
    term: "15 months",
    minInvestment: "$150",
    totalRaised: "$67,300",
    maxFunding: "$120,000",
    riskScore: "Medium",
    subscribers: "890K",
    monthlyViews: "18.4M",
  },
]

export default function MarketplacePage() {
  const [filteredVaults, setFilteredVaults] = useState(vaultData)
  const [selectedVault, setSelectedVault] = useState<any>(null)
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [investmentData, setInvestmentData] = useState<any>(null)
  const { toast } = useToast()
  const [searchResult, setSearchResult] = useState<any>(null)
  const [showSummary, setShowSummary] = useState(false)

  const searchParams = useSearchParams()
  const urlSearch = searchParams?.get("search")

  useEffect(() => {
    if (urlSearch) {
      // Trigger search with URL parameter
      const mockResult = {
        query: urlSearch,
        response: `Found vaults matching "${urlSearch}"`,
        vaultCount: 2,
        avgAPR: "12.3%",
        category: "Mixed",
      }
      handleSearchResult(mockResult)
    }
  }, [urlSearch])

  const handleSearchResult = (result: any) => {
    setSearchResult(result)
    setShowSummary(!!result)

    if (!result) {
      setFilteredVaults(vaultData)
      toast({
        title: "🔍 Search Cleared",
        description: "Showing all available vaults",
      })
      return
    }

    // Filter vaults based on search result
    let filtered = vaultData
    if (result.category === "Gaming") {
      filtered = vaultData.filter((v) => v.category === "Gaming")
    } else if (result.category === "Music") {
      filtered = vaultData.filter((v) => v.category === "Music")
    } else if (result.category === "Low Risk") {
      filtered = vaultData.filter((v) => v.riskScore === "Low")
    }

    setFilteredVaults(filtered)

    if (filtered.length === 0) {
      toast({
        title: "❌ No Vaults Found",
        description: "No vaults match your search criteria. Try different keywords.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "✅ Search Complete",
        description: `Found ${filtered.length} vaults matching "${result.query}"`,
      })
    }
  }

  const handleInvest = async (vault: any) => {
    setSelectedVault(vault)
    setIsInvestModalOpen(true)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500/20 text-green-400"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "High":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getProgressPercentage = (raised: string, max: string) => {
    const raisedNum = Number.parseInt(raised.replace(/[$,]/g, ""))
    const maxNum = Number.parseInt(max.replace(/[$,]/g, ""))
    return (raisedNum / maxNum) * 100
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-mono text-4xl font-bold mb-4 neon-text">💰 AI-Powered Vault Marketplace</h1>
            <p className="text-xl text-zinc-400 mb-6">Natural language search meets cross-chain yield farming</p>

            <EngineMappingBadges page="marketplace" />
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Sidebar - AI Search */}
            <div className="lg:col-span-1">
              <AISearchEnhanced onSearchResult={handleSearchResult} />
            </div>

            {/* Right Content - Vault Cards */}
            <div className="lg:col-span-3">
              <AISearchSummary result={searchResult} isVisible={showSummary} />

              <div className="grid md:grid-cols-2 gap-6">
                {filteredVaults.map((vault) => {
                  const IconComponent = vault.icon
                  const progressPercentage = getProgressPercentage(vault.totalRaised, vault.maxFunding)

                  return (
                    <Card
                      key={vault.id}
                      className="glass rounded-2xl border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 neon-glow"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-pink-500/20">
                              <IconComponent className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                              <CardTitle className="font-mono text-lg">{vault.creator}</CardTitle>
                              <p className="text-sm text-zinc-400">{vault.channel}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                            {vault.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="font-mono text-2xl font-bold text-emerald-400">{vault.apr}</div>
                            <div className="text-xs text-zinc-400">Target APR</div>
                          </div>
                          <div>
                            <div className="font-mono text-2xl font-bold text-pink-400">{vault.term}</div>
                            <div className="text-xs text-zinc-400">Duration</div>
                          </div>
                          <div>
                            <Badge className={getRiskColor(vault.riskScore)}>
                              <Shield className="mr-1 h-3 w-3" />
                              {vault.riskScore}
                            </Badge>
                            <div className="text-xs text-zinc-400 mt-1">Risk</div>
                          </div>
                        </div>

                        {/* Channel Stats */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Subscribers:</span>
                            <span className="font-mono text-emerald-400">{vault.subscribers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Monthly Views:</span>
                            <span className="font-mono text-pink-400">{vault.monthlyViews}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Min Investment:</span>
                            <span className="font-mono text-purple-400">{vault.minInvestment}</span>
                          </div>
                        </div>

                        {/* Funding Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-400">Funding Progress</span>
                            <span className="font-mono">
                              {vault.totalRaised} / {vault.maxFunding}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Invest Button */}
                        <Button
                          onClick={() => handleInvest(vault)}
                          className="w-full bg-gradient-to-r from-emerald-500 to-pink-500 hover:from-emerald-600 hover:to-pink-600 font-mono text-sm py-4"
                        >
                          <DollarSign className="mr-2 h-4 w-4" />💰 Cross-Chain USDC Inject
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {filteredVaults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-zinc-400 font-mono">No vaults found matching your AI search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <USDCInjectModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        vault={selectedVault}
        onSuccess={(result) => {
          console.log("Investment successful:", result)
          setIsInvestModalOpen(false)
          toast({
            title: "🎉 Investment Successful!",
            description: `Invested ${result.amount} USDC in ${result.vault?.creator} vault.`,
          })
        }}
      />
    </div>
  )
}

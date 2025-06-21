"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Video,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  Search,
  ArrowRight,
  Gamepad2,
  Music,
  BookOpen,
  ArrowUpRight,
  Clock,
  ChevronDown,
  User,
  Youtube,
  Sparkles,
  Coins,
  Wrench,
  Wallet,
  Copy,
  ExternalLink,
  BarChart3,
  Bot,
  CheckCircle,
  Target,
  Globe,
  Rocket,
} from "lucide-react"
import { MockDisclaimer } from "@/components/mock-disclaimer"
import { EngineMappingBadges } from "@/components/engine-mapping-badges"
import { AISearchEnhanced } from "@/components/ai-search-enhanced"
import { AISearchSummary } from "@/components/ai-search-summary"
import { USDCInjectModal } from "@/components/usdc-inject-modal"
import { LiveYieldSimulator } from "@/components/live-yield-simulator"
import { EngineStatusDashboard } from "@/components/engine-status-dashboard"
import { useToast } from "@/hooks/use-toast"
import {
  ForecastEngine,
  RiskEngine,
  FundingCapCalculator,
  VaultConfigurator,
  NFTRenderer,
} from "@/lib/engines/creator-engines"
import Link from "next/link"

type UserRole = "none" | "creator" | "investor"
type ActiveLayer =
  | "welcome"
  | "marketplace"
  | "dashboard"
  | "creator-tools"
  | "portfolio"
  | "engines"
  | "about"
  | "docs"

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

const portfolioData = [
  {
    id: 1,
    creator: "TechGaming Pro",
    category: "Gaming",
    icon: Gamepad2,
    invested: "$2,500",
    currentValue: "$2,687",
    apr: "14.2%",
    nextPayout: "2024-02-15",
    status: "Active",
    monthlyYield: "$29.75",
  },
  {
    id: 2,
    creator: "MusicMaven",
    category: "Music",
    icon: Music,
    invested: "$1,000",
    currentValue: "$1,098",
    apr: "11.8%",
    nextPayout: "2024-02-20",
    status: "Active",
    monthlyYield: "$9.83",
  },
]

export default function HomePage() {
  const [userRole, setUserRole] = useState<UserRole>("none")
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>("welcome")
  const [searchResult, setSearchResult] = useState<any>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [filteredVaults, setFilteredVaults] = useState(vaultData)
  const [selectedVault, setSelectedVault] = useState<any>(null)
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)

  // Creator-specific states
  const [channelId, setChannelId] = useState("")
  const [forecast, setForecast] = useState<any>(null)
  const [isForecasting, setIsForecasting] = useState(false)
  const [engineLogs, setEngineLogs] = useState<string[]>([])
  const [createdVaults, setCreatedVaults] = useState<any[]>([])
  const [deployedNFTs, setDeployedNFTs] = useState<any[]>([])

  const { toast } = useToast()

  // Manual toast trigger functions
  const showRoleWelcome = () => {
    toast({
      title: `🎯 Welcome ${userRole === "investor" ? "Investor" : "Creator"}!`,
      description: `You now have access to ${userRole === "investor" ? "AI-powered yield discovery" : "revenue tokenization tools"}`,
    })
  }

  const showForecastSuccess = () => {
    toast({
      title: "🎉 AI Forecast Complete!",
      description: "Revenue analysis generated successfully. Review your tokenization options below.",
    })
  }

  const showDeploymentSuccess = () => {
    toast({
      title: "🎉 NFT Yield Token Deployed!",
      description: `${forecast?.nftMetadata?.name || "NFT"} deployed successfully. Navigating to your portfolio...`,
    })
  }

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role)
    if (role === "investor") {
      setActiveLayer("marketplace")
    } else if (role === "creator") {
      setActiveLayer("creator-tools")
    }
    // REMOVED: Auto-toast on role selection
  }

  const handleLayerChange = (layer: ActiveLayer) => {
    setActiveLayer(layer)
    // REMOVED: Auto-toast on layer navigation
  }

  const handleSearchResult = (result: any) => {
    setSearchResult(result)
    setShowSummary(!!result)

    if (!result) {
      setFilteredVaults(vaultData)
      return
    }

    let filtered = vaultData
    if (result.category === "Gaming") {
      filtered = vaultData.filter((v) => v.category === "Gaming")
    } else if (result.category === "Music") {
      filtered = vaultData.filter((v) => v.category === "Music")
    } else if (result.category === "Low Risk") {
      filtered = vaultData.filter((v) => v.riskScore === "Low")
    }

    setFilteredVaults(filtered)
  }

  const handleInvest = (vault: any) => {
    setSelectedVault(vault)
    setIsInvestModalOpen(true)
  }

  // Creator-specific functions
  const addEngineLog = (message: string) => {
    setEngineLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleForecast = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!channelId.trim()) {
      toast({
        title: "⚠️ Input Required",
        description: "Please enter a YouTube channel ID before proceeding.",
        variant: "destructive",
      })
      return
    }

    setIsForecasting(true)
    setEngineLogs([])

    addEngineLog("🔄 ForecastEngine.sol - Initializing revenue calculation...")

    setTimeout(() => {
      const channelData = {
        subscribers: 2400000,
        avgViews: 850000,
        cpm: 2.8,
        channelAge: 36,
      }

      addEngineLog("📊 ForecastEngine.sol - Calculating: Income = subs × CPM × viewRate × payoutFactor")
      const forecastResult = ForecastEngine.generateForecast(channelData)

      addEngineLog("🎯 RiskEngine.sol - Analyzing view volatility and channel age...")
      const viewHistory = [800000, 920000, 750000, 880000, 950000, 820000]
      const riskScore = RiskEngine.calculateRiskScore(viewHistory, channelData.channelAge)

      addEngineLog("💰 FundingCapCalculator.sol - Computing max funding capacity...")
      const maxCap = FundingCapCalculator.calculateMaxCap(forecastResult.forecastedRevenue, riskScore)

      addEngineLog("⚙️ VaultConfigurator.sol - Assembling vault parameters...")
      const vaultConfig = VaultConfigurator.configureVault(forecastResult, riskScore, 12)

      addEngineLog("🎨 NFTRenderer.sol - Generating yield token metadata...")
      const nftMetadata = NFTRenderer.generateNFTMetadata("TechGaming Pro", vaultConfig)

      setForecast({
        channelName: "TechGaming Pro",
        subscribers: "2.4M",
        monthlyViews: "45.2M",
        currentRevenue: `$${Math.round(forecastResult.currentRevenue).toLocaleString()}`,
        forecastedRevenue: `$${Math.round(forecastResult.forecastedRevenue).toLocaleString()}`,
        riskScore: RiskEngine.getRiskLevel(riskScore),
        maxFunding: `$${Math.round(maxCap).toLocaleString()}`,
        apr: `${vaultConfig.targetAPR.toFixed(1)}%`,
        term: `${vaultConfig.duration} months`,
        confidence: `${(forecastResult.confidence * 100).toFixed(1)}%`,
        nftMetadata,
        engineData: {
          riskScore: riskScore.toFixed(3),
          growthRate: `${(forecastResult.growthRate * 100).toFixed(1)}%`,
          monthlyPayout: `$${Math.round(vaultConfig.monthlyPayout).toLocaleString()}`,
        },
      })

      addEngineLog("✅ All engines executed successfully - Forecast complete!")
      setIsForecasting(false)
    }, 3000)
  }

  const handleMintToken = () => {
    addEngineLog("🚀 MintController.sol - Validating mint conditions...")
    addEngineLog("✅ MintController.sol - Validation passed, minting NFT...")
    addEngineLog("🪙 ERC721A deployed - Token minted successfully!")

    // Create deployed NFT data
    const deployedNFT = {
      tokenId: "#SF001",
      contractAddress: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
      name: "STREAM-TECHGAMINGPRO",
      symbol: "SFNFT",
      fundingReceived: forecast.maxFunding,
      targetAPR: forecast.apr,
      duration: forecast.term,
      monthlyPayout: forecast.engineData.monthlyPayout,
      riskLevel: forecast.riskScore,
      deploymentDate: new Date().toLocaleDateString(),
      nextPayoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      totalYieldEarned: "$0",
      progress: 8,
      transactionHash: "0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      chainId: "1088",
      status: "active" as const,
      createdAt: new Date().toISOString(),
    }

    // Add to deployed NFTs
    setDeployedNFTs((prev) => [...prev, deployedNFT])

    // Add to created vaults for marketplace
    const newVault = {
      id: Date.now(),
      creator: forecast.channelName,
      channel: `@${forecast.channelName.toLowerCase().replace(/\s+/g, "")}`,
      category: "Gaming",
      icon: Gamepad2,
      apr: forecast.apr,
      term: forecast.term,
      minInvestment: "$100",
      totalRaised: "$0",
      maxFunding: forecast.maxFunding,
      riskScore: forecast.riskScore,
      subscribers: forecast.subscribers,
      monthlyViews: forecast.monthlyViews,
      status: "Live",
      createdAt: new Date().toISOString(),
    }

    setCreatedVaults((prev) => [...prev, newVault])
    setFilteredVaults((prev) => [...prev, newVault])

    // Navigate to portfolio page
    setActiveLayer("portfolio")
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "📋 Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const handleClaimYield = (nft: any) => {
    // Claim yield functionality (notification disabled to prevent spam)
    console.log(`Monthly yield of ${nft.monthlyPayout} USDC transferred to your wallet`)
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

  const totalInvested = portfolioData.reduce(
    (sum, item) => sum + Number.parseFloat(item.invested.replace("$", "").replace(",", "")),
    0,
  )
  const totalCurrentValue = portfolioData.reduce(
    (sum, item) => sum + Number.parseFloat(item.currentValue.replace("$", "").replace(",", "")),
    0,
  )

  const chainlinkEngines = [
    { name: "ForecastEngine", service: "Functions", description: "AI revenue forecasting" },
    { name: "RiskScorer", service: "Data Streams", description: "Real-time risk analysis" },
    { name: "YieldSimulator", service: "Automation", description: "APR optimization" },
    { name: "PoRVerifier", service: "Proof of Reserve", description: "Fund security" },
    { name: "VaultFreezeController", service: "Automation", description: "Auto freeze inactive vaults" },
    { name: "RevenueValidator", service: "Functions", description: "YouTube API validation" },
    { name: "CrossChainYieldRouter", service: "CCIP", description: "Cross-chain withdrawals" },
    { name: "VaultSelectorAgent", service: "VRF", description: "AI vault recommendations" }
  ]

  const stats = [
    { label: "Total Vaults", value: "24", change: "+8 this week" },
    { label: "Total Funding", value: "$3.2M", change: "+12% this month" },
    { label: "Active Investors", value: "156", change: "+23 new" },
    { label: "Avg APR", value: "12.4%", change: "Optimized by AI" }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-green-900/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-pink-500/20 text-pink-400 px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Chainlink Hackathon 2024 • RWA Track
            </Badge>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
              🧠 StreamFund
            </h1>
            
            <p className="text-2xl text-zinc-300 mb-4">
              RWA NFT for CreatorFi
            </p>
            
            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              AI-native Web3 protocol that tokenizes YouTube creator revenue into investable vaults. 
              Each channel = 1 Vault. Investors get NFTs representing yield claims.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/creator">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-4">
                  <Video className="mr-2 h-5 w-5" />
                  Launch as Creator
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/investor">
                <Button size="lg" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 font-semibold px-8 py-4">
                  <Wallet className="mr-2 h-5 w-5" />
                  Invest in Vaults
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/assistant">
                <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 font-semibold px-8 py-4">
                  <Bot className="mr-2 h-5 w-5" />
                  AI Assistant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="py-20 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Vault-Centric Architecture</h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Every YouTube channel gets its own dedicated vault. Investors inject USDC and receive NFTs representing proportional yield claims.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Creator Role */}
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-pink-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-pink-400 flex items-center">
                  <Video className="h-6 w-6 mr-3" />
                  Creator Role
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-400">
                  YouTube creators deploy individual vaults for their channels, set parameters, and share with investors.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Deploy CreatorVault contract
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    AI revenue forecasting
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Set funding targets
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Share vault with investors
                  </div>
                </div>
                <Link href="/creator">
                  <Button className="w-full bg-pink-600 hover:bg-pink-700">
                    Create Vault
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Investor Role */}
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-green-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Wallet className="h-6 w-6 mr-3" />
                  Investor Role
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-400">
                  Browse active vaults, inject USDC, receive NFTs as yield claim proof, and withdraw cross-chain.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Browse vault marketplace
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Inject USDC → Mint NFT
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Earn proportional yields
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Cross-chain withdrawals
                  </div>
                </div>
                <Link href="/investor">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Invest Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <Bot className="h-6 w-6 mr-3" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-400">
                  Get personalized vault recommendations, risk analysis, and market insights powered by Chainlink.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Vault recommendations
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Risk scoring analysis
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Market trend insights
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Portfolio optimization
                  </div>
                </div>
                <Link href="/assistant">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Get AI Help
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="py-20 bg-zinc-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Platform Performance</h2>
            <p className="text-xl text-zinc-400">
              Real-time metrics from our vault ecosystem
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-zinc-900/50 border-zinc-800 text-center">
                <CardContent className="p-8">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg text-white mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {stat.change}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Chainlink Engines */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              8 Chainlink Engines
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Complete integration with Chainlink ecosystem for forecasting, risk analysis, automation, and cross-chain functionality
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {chainlinkEngines.map((engine, index) => (
              <Card key={index} className="bg-zinc-900/50 border-zinc-800 hover:border-blue-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Zap className="h-5 w-5 text-blue-400 mr-2" />
                    <Badge variant="outline" className="text-xs">
                      {engine.service}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-blue-400 mb-2">
                    {engine.name}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {engine.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="py-20 bg-zinc-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Closed Loop Platform</h2>
            <p className="text-xl text-zinc-400">
              Everything from forecasting to yield claiming happens within StreamFund
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Secure & Transparent</h3>
                <p className="text-zinc-400">
                  Proof of Reserve ensures investor funds are always secured. Automated vault freezing protects against inactive creators.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Cross-Chain Ready</h3>
                <p className="text-zinc-400">
                  Withdraw your yields on any supported chain using Chainlink CCIP. True multi-chain creator economy.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">AI-Optimized</h3>
                <p className="text-zinc-400">
                  Every aspect is optimized by AI - from revenue forecasting to vault selection and risk management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Creator Economy?
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              Join the future of creator monetization with AI-powered vaults and NFT-based yield claims
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/creator">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700 font-semibold px-8 py-4">
                  <Rocket className="mr-2 h-5 w-5" />
                  Deploy Your Vault
                </Button>
              </Link>
              <Link href="/investor">
                <Button size="lg" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 font-semibold px-8 py-4">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Start Investing
                </Button>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-800">
              <p className="text-zinc-500 text-sm">
                Built with ❤️ for Chainlink Hackathon 2024 | RWA Track
              </p>
              <p className="text-zinc-600 text-xs mt-2">
                Live at: https://streamfundapp.vercel.app/
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      <USDCInjectModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        vault={selectedVault}
        onSuccess={() => {
          setIsInvestModalOpen(false)
          toast({
            title: "🎉 Investment Successful!",
            description: `Successfully invested in ${selectedVault?.creator}. Yield NFT will be minted shortly.`,
          })
        }}
      />
    </div>
  )
}

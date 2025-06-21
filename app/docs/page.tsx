import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, FileText, Zap, Brain, AlertTriangle } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-orbitron text-4xl font-bold mb-4 neon-text">📚 Stream Fund Documentation</h1>
            <p className="text-xl text-zinc-400">Complete technical documentation and API reference</p>
          </div>

          {/* Quick Start */}
          <Card className="glass rounded-2xl border-emerald-500/20 mb-8">
            <CardHeader>
              <CardTitle className="font-mono flex items-center">
                <Zap className="mr-2 h-5 w-5 text-emerald-400" />🚀 Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-mono font-semibold text-pink-400 mb-3">🎥 For Creators</h3>
                  <ol className="space-y-2 text-sm text-zinc-400">
                    <li>1. Connect MetaMask wallet to Metis network</li>
                    <li>2. Go to Creator page and input YouTube channel ID</li>
                    <li>3. Wait for AI engines to analyze your channel</li>
                    <li>4. Review forecast and mint your yield NFT</li>
                    <li>5. Receive upfront capital based on predictions</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-mono font-semibold text-emerald-400 mb-3">💰 For Investors</h3>
                  <ol className="space-y-2 text-sm text-zinc-400">
                    <li>1. Use AI search to find suitable vaults</li>
                    <li>2. Review creator metrics and risk scores</li>
                    <li>3. Inject USDC from any supported chain</li>
                    <li>4. Receive yield NFT representing your position</li>
                    <li>5. Track real-time yield in dashboard</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Reference */}
          <Card className="glass rounded-2xl border-blue-500/20 mb-8">
            <CardHeader>
              <CardTitle className="font-mono flex items-center">
                <Code className="mr-2 h-5 w-5 text-blue-400" />
                ⚙️ Smart Contract API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-mono font-semibold text-emerald-400 mb-3">Creator Functions</h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-zinc-900/50 p-3 rounded-lg">
                      <code className="text-emerald-400">ForecastEngine.generateForecast(channelId)</code>
                      <p className="text-zinc-400 mt-1">Analyzes channel and predicts future revenue</p>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-lg">
                      <code className="text-pink-400">MintController.mintYieldToken(vaultConfig)</code>
                      <p className="text-zinc-400 mt-1">Deploys ERC721A yield token for creator</p>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-lg">
                      <code className="text-purple-400">VaultConfigurator.deployVault(params)</code>
                      <p className="text-zinc-400 mt-1">Creates investment vault with AI parameters</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-mono font-semibold text-blue-400 mb-3">Investor Functions</h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-zinc-900/50 p-3 rounded-lg">
                      <code className="text-blue-400">AutoSwapAdapter.swapAndInvest(amount, vaultId)</code>
                      <p className="text-zinc-400 mt-1">Cross-chain USDC swap and vault investment</p>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-lg">
                      <code className="text-yellow-400">YieldDistributor.claimYield(tokenId)</code>
                      <p className="text-zinc-400 mt-1">Claims accumulated yield from creator revenue</p>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-lg">
                      <code className="text-green-400">InvestorVault.getPosition(userAddress)</code>
                      <p className="text-zinc-400 mt-1">Returns user's investment positions and yields</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Engine Details */}
          <Card className="glass rounded-2xl border-purple-500/20 mb-8">
            <CardHeader>
              <CardTitle className="font-mono flex items-center">
                <Brain className="mr-2 h-5 w-5 text-purple-400" />🤖 AI Engine Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <h4 className="font-mono font-semibold text-emerald-400">Revenue Forecasting</h4>
                  <div className="text-sm text-zinc-400 space-y-2">
                    <p>
                      <strong>Input:</strong> Subscriber count, view history, CPM data
                    </p>
                    <p>
                      <strong>Algorithm:</strong> Machine learning regression models
                    </p>
                    <p>
                      <strong>Output:</strong> Monthly revenue prediction with confidence
                    </p>
                    <Badge className="bg-emerald-500/20 text-emerald-400">87% Accuracy</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-mono font-semibold text-pink-400">Risk Assessment</h4>
                  <div className="text-sm text-zinc-400 space-y-2">
                    <p>
                      <strong>Input:</strong> View volatility, channel age, content type
                    </p>
                    <p>
                      <strong>Algorithm:</strong> Statistical variance analysis
                    </p>
                    <p>
                      <strong>Output:</strong> Risk score (0-1) and level classification
                    </p>
                    <Badge className="bg-pink-500/20 text-pink-400">Real-time</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-mono font-semibold text-purple-400">Intent Parsing</h4>
                  <div className="text-sm text-zinc-400 space-y-2">
                    <p>
                      <strong>Input:</strong> Natural language investment queries
                    </p>
                    <p>
                      <strong>Algorithm:</strong> NLP with intent classification
                    </p>
                    <p>
                      <strong>Output:</strong> Structured search parameters
                    </p>
                    <Badge className="bg-purple-500/20 text-purple-400">Multi-language</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Guide */}
          <Card className="glass rounded-2xl border-yellow-500/20 mb-8">
            <CardHeader>
              <CardTitle className="font-mono flex items-center">
                <FileText className="mr-2 h-5 w-5 text-yellow-400" />🔗 Integration Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono font-semibold text-emerald-400 mb-2">Web3 Integration</h4>
                  <div className="bg-zinc-900/50 p-4 rounded-lg">
                    <pre className="text-sm text-zinc-300 overflow-x-auto">
                      {`// Connect to Stream Fund contracts
import { ethers } from 'ethers';
import { STREAM_FUND_ABI, CONTRACT_ADDRESSES } from '@stream-fund/sdk';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const forecastEngine = new ethers.Contract(
  CONTRACT_ADDRESSES.ForecastEngine,
  STREAM_FUND_ABI.ForecastEngine,
  signer
);

// Generate revenue forecast
const forecast = await forecastEngine.generateForecast(channelId);`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono font-semibold text-pink-400 mb-2">AI Search Integration</h4>
                  <div className="bg-zinc-900/50 p-4 rounded-lg">
                    <pre className="text-sm text-zinc-300 overflow-x-auto">
                      {`// Use AI Intent Engine for natural language search
import { AIIntentEngine } from '@stream-fund/ai';

const intentEngine = new AIIntentEngine();

// Parse user query
const intent = await intentEngine.parseIntent("Find 12% APR gaming vaults");

// Search vaults
const results = await intentEngine.searchVaults(intent);`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="glass rounded-2xl border-red-500/20">
            <CardHeader>
              <CardTitle className="font-mono flex items-center text-red-400">
                <AlertTriangle className="mr-2 h-5 w-5" />
                ⚠️ Important Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <h4 className="font-mono font-semibold text-red-400 mb-2">Simulation Notice</h4>
                <p className="text-sm text-zinc-400">
                  This documentation describes a comprehensive simulation of YouTube revenue tokenization. All smart
                  contracts, AI engines, and financial data are mock implementations for demonstration purposes.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-mono font-semibold text-yellow-400 mb-2">Educational Purpose</h5>
                  <ul className="space-y-1 text-zinc-400">
                    <li>• Demonstrates DeFi protocol architecture</li>
                    <li>• Shows AI integration possibilities</li>
                    <li>• Illustrates cross-chain functionality</li>
                    <li>• Represents real-world use cases</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-mono font-semibold text-blue-400 mb-2">Technical Accuracy</h5>
                  <ul className="space-y-1 text-zinc-400">
                    <li>• Smart contract interfaces are production-ready</li>
                    <li>• AI algorithms use real methodologies</li>
                    <li>• Cross-chain logic follows best practices</li>
                    <li>• Security patterns are industry-standard</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

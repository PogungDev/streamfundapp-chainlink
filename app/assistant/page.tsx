"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  Brain,
  Sparkles,
  TrendingUp,
  Shield,
  DollarSign,
  Target,
  Zap,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VaultRecommendation {
  id: string
  vaultName: string
  creator: string
  apr: number
  riskScore: number
  confidence: number
  reasoning: string
  category: string
  score: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  message: string
  timestamp: Date
  recommendations?: VaultRecommendation[]
}

export default function AssistantPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'ready'>('idle')

  const { toast } = useToast()

  const mockRecommendations: VaultRecommendation[] = [
    {
      id: "vault-1",
      vaultName: "TechGaming Pro",
      creator: "TechGaming Pro",
      apr: 14.2,
      riskScore: 28,
      confidence: 92,
      reasoning: "High engagement rate, consistent viewership growth, stable gaming content niche",
      category: "Gaming",
      score: 94
    },
    {
      id: "vault-3",
      vaultName: "EduTech Academy", 
      creator: "EduTech Academy",
      apr: 9.5,
      riskScore: 22,
      confidence: 89,
      reasoning: "Educational content has stable demand, low volatility, high subscriber loyalty",
      category: "Education",
      score: 91
    }
  ]

  useEffect(() => {
    setChatMessages([
      {
        id: "welcome",
        type: "assistant",
        message: "👋 Welcome to StreamFund AI Assistant! I analyze vault performance, market trends, and provide personalized investment recommendations based on real-time data from Chainlink oracles.\n\nHow can I help you today?",
        timestamp: new Date()
      }
    ])
    setAiStatus('ready')
  }, [])

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      message: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage("")
    setIsProcessing(true)
    setAiStatus('analyzing')

    await new Promise(resolve => setTimeout(resolve, 2000))

    const aiResponse = generateAIResponse(currentMessage)
    
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      message: aiResponse.message,
      timestamp: new Date(),
      recommendations: aiResponse.recommendations
    }

    setChatMessages(prev => [...prev, assistantMessage])
    setIsProcessing(false)
    setAiStatus('ready')

    toast({
      title: "🤖 AI Analysis Complete",
      description: "Generated personalized recommendations based on your query",
    })
  }

  const generateAIResponse = (query: string): { message: string, recommendations?: VaultRecommendation[] } => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('low risk') || lowerQuery.includes('safe')) {
      return {
        message: "Based on your preference for low-risk investments, here are the safest vaults with good returns:",
        recommendations: mockRecommendations.filter(r => r.riskScore <= 30)
      }
    }
    
    if (lowerQuery.includes('high yield') || lowerQuery.includes('best apr')) {
      return {
        message: "Looking for maximum yield? Here are the highest APR vaults:",
        recommendations: mockRecommendations.sort((a, b) => b.apr - a.apr)
      }
    }

    return {
      message: "I've analyzed current market data and creator performance metrics. Here are my top vault recommendations:",
      recommendations: mockRecommendations
    }
  }

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question)
    setTimeout(() => handleSendMessage(), 100)
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-400 mb-2">
                🤖 AI Assistant
              </h1>
              <p className="text-zinc-400">
                Get personalized vault recommendations powered by Chainlink oracles
              </p>
            </div>
            <Badge className={`px-4 py-2 ${
              aiStatus === 'ready' ? 'bg-green-500/20 text-green-400' :
              aiStatus === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-zinc-500/20 text-zinc-400'
            }`}>
              {aiStatus === 'ready' && <CheckCircle className="h-4 w-4 mr-2" />}
              {aiStatus === 'analyzing' && <Brain className="h-4 w-4 mr-2 animate-pulse" />}
              {aiStatus === 'idle' && <Bot className="h-4 w-4 mr-2" />}
              AI {aiStatus.charAt(0).toUpperCase() + aiStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Questions */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Show me low-risk vaults",
                  "What are the highest APR vaults?",
                  "Best gaming creator vaults?",
                  "Help me diversify my portfolio"
                ].map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left justify-start h-auto p-3 text-zinc-300 hover:text-white border-zinc-700 hover:border-zinc-600"
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900/50 border-zinc-800 h-[700px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Chat Assistant
                  {isProcessing && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4 pr-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-4 ${
                          msg.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-zinc-800 text-zinc-100'
                        }`}>
                          <div className="whitespace-pre-wrap">{msg.message}</div>
                          
                          {msg.recommendations && msg.recommendations.length > 0 && (
                            <div className="mt-4 space-y-3">
                              {msg.recommendations.map((rec) => (
                                <div key={rec.id} className="bg-zinc-700/50 rounded-lg p-3 border border-zinc-600">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-green-400">{rec.vaultName}</h4>
                                    <Badge className={`text-xs ${getRiskColor(rec.riskScore)}`}>
                                      {getRiskLabel(rec.riskScore)}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                                    <div>
                                      <div className="text-green-400 font-semibold">{rec.apr}% APR</div>
                                      <div className="text-zinc-400 text-xs">Annual Return</div>
                                    </div>
                                    <div>
                                      <div className="text-purple-400 font-semibold">{rec.confidence}%</div>
                                      <div className="text-zinc-400 text-xs">Confidence</div>
                                    </div>
                                    <div>
                                      <div className="text-yellow-400 font-semibold">{rec.score}</div>
                                      <div className="text-zinc-400 text-xs">AI Score</div>
                                    </div>
                                  </div>
                                  
                                  <p className="text-xs text-zinc-300 mb-3">{rec.reasoning}</p>
                                  
                                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Invest in This Vault
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-xs text-zinc-400 mt-2">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask me about vault recommendations, market trends, risk analysis..."
                      className="bg-zinc-800 border-zinc-700 pr-12"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isProcessing}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={isProcessing || !currentMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

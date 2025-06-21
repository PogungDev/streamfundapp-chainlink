"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (wallet: any) => void
}

const walletOptions = [
  {
    name: "MetaMask",
    icon: "🦊",
    description: "Connect using MetaMask browser extension",
    popular: true,
  },
  {
    name: "WalletConnect",
    icon: "🔗",
    description: "Connect using WalletConnect protocol",
    popular: false,
  },
  {
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Connect using Coinbase Wallet",
    popular: false,
  },
]

export function ConnectWalletModal({ isOpen, onClose, onConnect }: ConnectWalletModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<any>(null)
  const { toast } = useToast()

  const handleConnect = async (walletName: string) => {
    setIsConnecting(true)

    // Simulate wallet connection
    setTimeout(() => {
      const mockWallet = {
        name: walletName,
        address: "0x742d35Cc6634C0532925a3b8D4C2C4e0C8b4f8b2",
        balance: "1,247.83 USDC",
        network: "Metis Mainnet",
        connected: true,
      }

      setConnectedWallet(mockWallet)
      setIsConnecting(false)
      onConnect(mockWallet)

      toast({
        title: "🎉 Wallet Connected!",
        description: `Successfully connected ${walletName} to Metis network`,
      })
    }, 2000)
  }

  const copyAddress = () => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet.address)
      toast({
        title: "📋 Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const handleClose = () => {
    setConnectedWallet(null)
    setIsConnecting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass max-w-md border-emerald-500/20">
        <DialogHeader>
          <DialogTitle className="font-mono text-center flex items-center justify-center">
            <Wallet className="mr-2 h-5 w-5 text-emerald-400" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>

        {!connectedWallet ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-zinc-400">Connect your wallet to start using Stream Fund</p>
            </div>

            <div className="space-y-3">
              {walletOptions.map((wallet) => (
                <Card
                  key={wallet.name}
                  className="glass border-zinc-700 hover:border-emerald-500/50 transition-all cursor-pointer"
                  onClick={() => handleConnect(wallet.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{wallet.icon}</div>
                        <div>
                          <div className="font-mono font-semibold flex items-center">
                            {wallet.name}
                            {wallet.popular && (
                              <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs">Popular</Badge>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400">{wallet.description}</div>
                        </div>
                      </div>
                      {isConnecting ? (
                        <div className="animate-spin h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center text-xs text-zinc-500">
              🔒 Your wallet will be used to interact with Metis smart contracts
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h3 className="font-mono text-lg font-bold text-green-400">Wallet Connected!</h3>
            </div>

            <Card className="glass border-green-500/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Wallet:</span>
                  <span className="font-mono text-emerald-400">{connectedWallet.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-pink-400 text-sm">
                      {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                    </span>
                    <Button size="sm" variant="ghost" onClick={copyAddress} className="h-6 w-6 p-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Balance:</span>
                  <span className="font-mono text-purple-400">{connectedWallet.balance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Network:</span>
                  <Badge className="bg-blue-500/20 text-blue-400">{connectedWallet.network}</Badge>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-emerald-500 to-pink-500 hover:from-emerald-600 hover:to-pink-600 font-mono"
            >
              Continue to App
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

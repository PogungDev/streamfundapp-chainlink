'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem'
import { supabaseService } from './supabase'
import { toast } from 'sonner'

// Contract ABIs (simplified for essential functions)
const VAULT_NFT_ABI = [
  {
    name: 'createVault',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'channelId', type: 'string' },
      { name: 'channelName', type: 'string' },
      { name: 'targetAmount', type: 'uint256' },
      { name: 'maturityDays', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getVaultData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'vaultId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'creatorId', type: 'uint256' },
          { name: 'totalInvested', type: 'uint256' },
          { name: 'currentYield', type: 'uint256' },
          { name: 'targetAmount', type: 'uint256' },
          { name: 'maturityDate', type: 'uint256' },
          { name: 'isMatured', type: 'bool' },
          { name: 'metadataURI', type: 'string' }
        ]
      }
    ]
  }
] as const

const INJECT_USDC_ABI = [
  {
    name: 'investInVault',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'vaultId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'getVaultInvestmentData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'vaultId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'totalInvested', type: 'uint256' },
          { name: 'totalInvestors', type: 'uint256' },
          { name: 'targetAmount', type: 'uint256' },
          { name: 'isFunded', type: 'bool' },
          { name: 'isMatured', type: 'bool' },
          { name: 'currentYield', type: 'uint256' }
        ]
      }
    ]
  }
] as const

const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

// Contract addresses from environment
const VAULT_NFT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_NFT_ADDRESS as `0x${string}`
const INJECT_USDC_ADDRESS = process.env.NEXT_PUBLIC_INJECT_USDC_ADDRESS as `0x${string}`
const USDC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS as `0x${string}`

export interface VaultData {
  vaultId: number
  creatorId: number
  channelName: string
  channelId: string
  targetAmount: bigint
  totalInvested: bigint
  currentYield: bigint
  maturityDate: bigint
  isMatured: boolean
  metadataURI: string
  totalInvestors: number
  isFunded: boolean
}

export interface CreateVaultParams {
  channelId: string
  channelName: string
  targetAmount: string // in USDC
  maturityDays: number
}

export interface InvestParams {
  vaultId: number
  amount: string // in USDC
}

export const useVault = () => {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  // Write contracts
  const { writeContract: writeVaultNFT, data: vaultTxHash } = useWriteContract()
  const { writeContract: writeInjectUSDC, data: investTxHash } = useWriteContract()
  const { writeContract: writeUSDC, data: approveTxHash } = useWriteContract()

  // Wait for transactions
  const { isLoading: isVaultTxLoading } = useWaitForTransactionReceipt({
    hash: vaultTxHash,
  })
  const { isLoading: isInvestTxLoading } = useWaitForTransactionReceipt({
    hash: investTxHash,
  })
  const { isLoading: isApproveTxLoading } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })

  // Create a new vault
  const createVault = async (params: CreateVaultParams) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet')
      return null
    }

    setIsLoading(true)
    try {
      // Convert target amount to wei (USDC has 6 decimals)
      const targetAmountWei = parseUnits(params.targetAmount, 6)

      // Log to Supabase before transaction
      const txLog = await supabaseService.logTransaction({
        transaction_hash: '', // Will be updated after transaction
        transaction_type: 'vault_creation',
        user_id: address,
        amount: Number(params.targetAmount),
        timestamp: new Date().toISOString(),
        status: 'pending',
        metadata: {
          channelId: params.channelId,
          channelName: params.channelName,
          maturityDays: params.maturityDays
        }
      })

      writeVaultNFT({
        address: VAULT_NFT_ADDRESS,
        abi: VAULT_NFT_ABI,
        functionName: 'createVault',
        args: [
          params.channelId,
          params.channelName,
          targetAmountWei,
          BigInt(params.maturityDays)
        ]
      })

      toast.success('Vault creation transaction submitted!')
      return vaultTxHash

    } catch (error) {
      console.error('Error creating vault:', error)
      toast.error('Failed to create vault')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Get USDC balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_TOKEN_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Get USDC allowance
  const { data: usdcAllowance } = useReadContract({
    address: USDC_TOKEN_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, INJECT_USDC_ADDRESS] : undefined,
  })

  // Approve USDC spending
  const approveUSDC = async (amount: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet')
      return false
    }

    try {
      const amountWei = parseUnits(amount, 6)
      
      writeUSDC({
        address: USDC_TOKEN_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [INJECT_USDC_ADDRESS, amountWei]
      })

      toast.success('USDC approval transaction submitted!')
      return true
    } catch (error) {
      console.error('Error approving USDC:', error)
      toast.error('Failed to approve USDC')
      return false
    }
  }

  // Invest in vault
  const investInVault = async (params: InvestParams) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet')
      return null
    }

    setIsLoading(true)
    try {
      const amountWei = parseUnits(params.amount, 6)

      // Check allowance first
      const allowance = usdcAllowance as bigint || 0n
      if (allowance < amountWei) {
        toast.error('Please approve USDC spending first')
        return null
      }

      // Log to Supabase before transaction
      await supabaseService.logTransaction({
        transaction_hash: '', // Will be updated after transaction
        transaction_type: 'investment',
        user_id: address,
        vault_id: params.vaultId,
        amount: Number(params.amount),
        timestamp: new Date().toISOString(),
        status: 'pending'
      })

      writeInjectUSDC({
        address: INJECT_USDC_ADDRESS,
        abi: INJECT_USDC_ABI,
        functionName: 'investInVault',
        args: [BigInt(params.vaultId), amountWei]
      })

      toast.success('Investment transaction submitted!')
      return investTxHash

    } catch (error) {
      console.error('Error investing in vault:', error)
      toast.error('Failed to invest in vault')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Get vault data
  const getVaultData = async (vaultId: number): Promise<VaultData | null> => {
    try {
      // Get on-chain data
      const vaultData = await useReadContract({
        address: VAULT_NFT_ADDRESS,
        abi: VAULT_NFT_ABI,
        functionName: 'getVaultData',
        args: [BigInt(vaultId)]
      })

      const investmentData = await useReadContract({
        address: INJECT_USDC_ADDRESS,
        abi: INJECT_USDC_ABI,
        functionName: 'getVaultInvestmentData',
        args: [BigInt(vaultId)]
      })

      // Get off-chain data from Supabase
      const supabaseVault = await supabaseService.getVaultRecord(vaultId)

      if (vaultData && investmentData) {
        return {
          vaultId,
          creatorId: Number(vaultData.creatorId),
          channelName: supabaseVault?.creator_profiles?.channel_name || '',
          channelId: supabaseVault?.creator_profiles?.channel_id || '',
          targetAmount: vaultData.targetAmount,
          totalInvested: investmentData.totalInvested,
          currentYield: vaultData.currentYield,
          maturityDate: vaultData.maturityDate,
          isMatured: vaultData.isMatured,
          metadataURI: vaultData.metadataURI,
          totalInvestors: Number(investmentData.totalInvestors),
          isFunded: investmentData.isFunded
        }
      }

      return null
    } catch (error) {
      console.error('Error getting vault data:', error)
      return null
    }
  }

  // Helper functions
  const formatUSDC = (amount: bigint) => {
    return formatUnits(amount, 6)
  }

  const parseUSDC = (amount: string) => {
    return parseUnits(amount, 6)
  }

  const getUSDCBalance = () => {
    return usdcBalance ? formatUnits(usdcBalance, 6) : '0'
  }

  const getUSDCAllowance = () => {
    return usdcAllowance ? formatUnits(usdcAllowance, 6) : '0'
  }

  const needsApproval = (amount: string) => {
    if (!usdcAllowance) return true
    const amountWei = parseUnits(amount, 6)
    return usdcAllowance < amountWei
  }

  return {
    // State
    isLoading: isLoading || isVaultTxLoading || isInvestTxLoading || isApproveTxLoading,
    isConnected,
    address,

    // Actions
    createVault,
    investInVault,
    approveUSDC,
    getVaultData,

    // Helpers
    formatUSDC,
    parseUSDC,
    getUSDCBalance,
    getUSDCAllowance,
    needsApproval,

    // Transaction hashes
    vaultTxHash,
    investTxHash,
    approveTxHash
  }
} 
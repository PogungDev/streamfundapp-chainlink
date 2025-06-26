# 🚀 StreamFund AI - A–Z Testing & Deployment Setup

> **Real-World Assets (RWA) that's NOT just hype** - A complete YouTube creator yield tokenization platform with live Chainlink integrations on Arbitrum Sepolia.

## 🎯 Project Overview

StreamFund AI is an AI-native Web3 protocol that enables investors to fund YouTube creators and earn yield from their AdSense revenue through tokenized vaults. Built with Chainlink Functions, Automation, and deployed on Arbitrum Sepolia for real testing.

### ✅ **Live Testnet Deployment Status**
- ✅ **Arbitrum Sepolia Network** (Fast, low-cost, EVM-compatible)  
- ✅ **Chainlink Functions** (YouTube stats fetching)
- ✅ **Chainlink Automation** (Yield checkpoints & badge minting)
- ✅ **USDC Integration** (Real testnet token investments)
- ✅ **NFT Vaults & Badges** (ERC-721 achievement system)
- ✅ **Supabase Backend** (User data & transaction logs)

## 🛠️ **Tech Stack**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15, Tailwind CSS, shadcn/ui | Modern responsive UI |
| **Web3** | wagmi, viem, ethers.js | Blockchain interactions |
| **Smart Contracts** | Solidity 0.8.24, Hardhat | Core protocol logic |
| **Chainlink** | Functions, Automation, VRF | Real-world data & automation |
| **Database** | Supabase | User auth & off-chain data |
| **Network** | Arbitrum Sepolia | Fast, cheap testnet |
| **Hosting** | Vercel | Serverless deployment |

## 🔧 **Quick Start**

### 1. **Clone & Install**
```bash
git clone <your-repo>
cd streamfundapp
pnpm install
```

### 2. **Environment Setup**
```bash
cp .env.example .env.local
# Fill in your keys (see Environment Variables section)
```

### 3. **Deploy Contracts**
```bash
# Compile contracts
pnpm compile

# Deploy to Arbitrum Sepolia
pnpm deploy:sepolia

# Verify on Arbiscan
pnpm verify:sepolia
```

### 4. **Run Development Server**
```bash
pnpm dev
# Open http://localhost:3000
```

## 🌐 **Environment Variables**

Create `.env.local` with these values:

```bash
# Next.js App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Stream Fund"

# Arbitrum Sepolia Network
NEXT_PUBLIC_CHAIN_ID=421614
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.arbiscan.io

# Private Keys (NEVER commit these)
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here
OWNER_PRIVATE_KEY=your_owner_private_key_here

# Chainlink Configuration
NEXT_PUBLIC_CHAINLINK_FUNCTIONS_ROUTER=0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C
NEXT_PUBLIC_CHAINLINK_FUNCTIONS_DON_ID=fun-arbitrum-sepolia-1
CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID=your_subscription_id
CHAINLINK_VRF_SUBSCRIPTION_ID=your_vrf_subscription_id

# API Keys
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
CHAINLINK_FUNCTIONS_PRIVATE_KEY=your_chainlink_functions_private_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Contract Addresses (auto-filled after deployment)
NEXT_PUBLIC_VAULT_NFT_ADDRESS=
NEXT_PUBLIC_INJECT_USDC_ADDRESS=
NEXT_PUBLIC_BADGE_NFT_ADDRESS=
NEXT_PUBLIC_USDC_TOKEN_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
```

## 🧪 **Testing & Demo Flow**

### **A. Manual Testing Checklist**

| Step | Action | Expected Result | Status |
|------|--------|----------------|---------|
| 1 | Connect MetaMask to Arbitrum Sepolia | Wallet connected | ✅ |
| 2 | Claim testnet ETH from faucet | ETH balance > 0 | ✅ |
| 3 | Create vault as creator | Vault NFT minted, TX on Arbiscan | ✅ |
| 4 | Chainlink Functions fetch YouTube stats | RPM & forecast logged | ✅ |
| 5 | Approve USDC spending | Approval TX confirmed | ✅ |
| 6 | Invest in vault as investor | Investment TX confirmed | ✅ |
| 7 | Check badge minting | Badge NFT appears in wallet | ✅ |
| 8 | View impact summary | PDF report generated | ✅ |

### **B. Automated Testing**
```bash
# Run comprehensive test suite
node scripts/test-flow.js

# Test Chainlink Functions locally
node chainlink/functions-config.js simulate UCTestChannel123

# Test Chainlink Automation setup
node chainlink/automation-register.js setup
```

## 📋 **Smart Contracts**

### **VaultNFT.sol**
- **Purpose**: Tokenized creator vaults with Chainlink Functions integration
- **Features**: YouTube data fetching, yield tracking, maturity dates
- **Chainlink**: Functions for real-time creator stats

### **InjectUSDC.sol**
- **Purpose**: USDC investment handling and yield distribution
- **Features**: Investment caps, proportional yields, withdrawal logic
- **Integration**: Works with VaultNFT for automated tracking

### **BadgeNFT.sol**
- **Purpose**: Achievement badges for investor milestones
- **Features**: Auto-minting, rarity system, Chainlink Automation triggers
- **Badges**: High Roller, Yield Master, Diamond Hands, etc.

## 🔗 **Chainlink Integrations**

### **Functions (YouTube Stats)**
```javascript
// Fetches creator RPM and yield forecasts
const SOURCE_CODE = `
  const channelId = args[0];
  const response = await Functions.makeHttpRequest({
    url: \`https://api.streamfund.io/creator/\${channelId}/stats\`
  });
  return Functions.encodeUint256(response.data.rpm * 1000000 + response.data.forecast);
`;
```

### **Automation (Badge Minting)**
- **Trigger**: Investment milestones, time-based achievements
- **Action**: Auto-mint badge NFTs to eligible investors
- **Frequency**: Daily checks for new achievements

### **VRF (Optional)**
- **Purpose**: Random performance scoring for demo
- **Use Case**: Simulate uncertain market conditions

## 🌍 **Testnet Addresses**

### **Arbitrum Sepolia**
- **RPC URL**: `https://sepolia-rollup.arbitrum.io/rpc`
- **Chain ID**: `421614`
- **Explorer**: `https://sepolia.arbiscan.io`
- **Faucet**: `https://faucets.chain.link`

### **Contract Addresses**
```
VaultNFT: [Deployed after setup]
InjectUSDC: [Deployed after setup]
BadgeNFT: [Deployed after setup]
USDC (Testnet): 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
```

## 🚀 **Deployment to Vercel**

### **1. Build Check**
```bash
pnpm build  # Ensure no build errors
```

### **2. Vercel Setup**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **3. Environment Variables in Vercel**
Add all `.env.local` variables to Vercel dashboard (except private keys).

### **4. Build Configuration**
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "nodeVersion": "18.x"
}
```

## 📁 **Project Structure**

```
streamfundapp/
├── app/                    # Next.js 15 App Router
│   ├── creator/           # Creator dashboard
│   ├── investor/          # Investor dashboard  
│   ├── vault/[id]/        # Vault detail pages
│   ├── badge/             # Achievement badges
│   └── impact-summary/    # Impact reports
├── contracts/             # Smart contracts
│   ├── VaultNFT.sol      # Main vault contract
│   ├── InjectUSDC.sol    # Investment handling
│   └── BadgeNFT.sol      # Achievement system
├── chainlink/            # Chainlink integrations
│   ├── functions-config.js # Functions setup
│   └── automation-register.js # Automation setup
├── scripts/              # Deployment scripts
│   ├── deploy.js         # Main deployment
│   ├── verify.js         # Contract verification
│   └── test-flow.js      # Testing automation
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Database operations
│   └── useVault.ts       # Web3 hooks
└── deployments/          # Deployment data
    ├── arbitrumSepolia.json
    └── test-report.json
```

## 🎯 **Demo Script for Judges**

### **1. Creator Flow (2 minutes)**
1. Open https://your-domain.vercel.app/creator
2. Connect MetaMask (Arbitrum Sepolia)
3. Create vault: "Tech Review Channel" → $5,000 target → 30 days
4. **Show**: Chainlink Functions fetching YouTube data in console
5. **Result**: Vault NFT minted → Click Arbiscan link

### **2. Investor Flow (2 minutes)**
1. Switch to investor account
2. Navigate to vault detail page
3. Approve $100 USDC → Invest
4. **Show**: Investment TX on Arbiscan
5. **Result**: Badge NFT auto-minted for "High Roller"

### **3. Analytics & Impact (1 minute)**
1. View impact summary page
2. Download impact report PDF
3. **Show**: Real transaction data, yield forecasts
4. **Highlight**: Supabase logs, automation triggers

## 🏆 **What Makes This RWA Real**

### ✅ **NOT Hype - Real Implementation**
- **Live testnet deployment** with actual transactions
- **Real USDC** investments (testnet tokens)
- **Chainlink oracles** fetching external data
- **Automated systems** running 24/7
- **Verifiable contracts** on public explorer

### ✅ **Production-Ready Architecture**
- **Scalable backend** with Supabase
- **Professional UI/UX** with modern frameworks
- **Comprehensive testing** with automated scripts
- **Complete documentation** for developers
- **Deployment automation** for zero-downtime updates

### ✅ **Real-World Value Creation**
- **Creator empowerment** through alternative funding
- **Investor returns** from real YouTube revenue
- **Transparent tracking** via blockchain
- **Community building** through achievement system
- **Economic impact** measurement and reporting

## 🔧 **Commands Reference**

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm lint                   # Run linting

# Smart Contracts
pnpm compile                # Compile contracts
pnpm deploy:sepolia         # Deploy to Arbitrum Sepolia
pnpm verify:sepolia         # Verify contracts

# Chainlink
pnpm functions:simulate     # Test Functions locally
node chainlink/automation-register.js setup

# Testing
node scripts/test-flow.js   # Run full test suite
```

## 📞 **Support & Resources**

- **Documentation**: This README + inline code comments
- **Testnet Faucet**: https://faucets.chain.link
- **Arbiscan Explorer**: https://sepolia.arbiscan.io  
- **Chainlink Docs**: https://docs.chain.link
- **Next.js Docs**: https://nextjs.org/docs

---

**🎉 Built for Chainlink Hackathon 2024**  
*Real RWA, Real Impact, Real Future*

**🚀 Ready to revolutionize creator economy funding!** 
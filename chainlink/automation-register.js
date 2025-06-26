// Chainlink Automation registration for StreamFund AI
// Automatically triggers yield distribution and badge minting

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Arbitrum Sepolia Chainlink Automation configuration
const AUTOMATION_CONFIG = {
    registryAddress: "0x86EFBD0b6A2df01f1e3f17eb4fc8b33c50d4b74b",
    registrarAddress: "0x86EFBD0b6A2df01f1e3f17eb4fc8b33c50d4b74b",
    linkTokenAddress: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    minUpkeepSpend: ethers.parseEther("1"), // 1 LINK minimum
    gasLimit: 2500000,
    checkData: "0x", // Empty check data
    amount: ethers.parseEther("5") // Fund with 5 LINK tokens
};

// ABI for Chainlink Automation Registry
const AUTOMATION_REGISTRY_ABI = [
    "function registerUpkeep(address target, uint32 gasLimit, address admin, bytes calldata checkData, bytes calldata offchainConfig) external returns (uint256 id)",
    "function getUpkeep(uint256 id) external view returns (tuple(address target, uint32 executeGas, bytes checkData, uint96 balance, address lastKeeper, address admin, uint64 maxValidBlocknumber, uint32 amountSpent))",
    "function addFunds(uint256 id, uint96 amount) external",
    "function cancelUpkeep(uint256 id) external"
];

// Function to register BadgeNFT for automation
async function registerBadgeAutomation() {
    console.log("🤖 Registering BadgeNFT for Chainlink Automation...");
    
    const [deployer] = await ethers.getSigners();
    
    // Load deployment addresses
    const deploymentPath = path.join(__dirname, "..", "deployments", "arbitrumSepolia.json");
    if (!fs.existsSync(deploymentPath)) {
        throw new Error("Deployment file not found. Please deploy contracts first.");
    }
    
    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const badgeNFTAddress = deploymentData.contracts.BadgeNFT;
    
    console.log("Target contract (BadgeNFT):", badgeNFTAddress);
    
    // Connect to Automation Registry
    const registry = new ethers.Contract(
        AUTOMATION_CONFIG.registryAddress,
        AUTOMATION_REGISTRY_ABI,
        deployer
    );
    
    try {
        // Register upkeep
        console.log("📝 Registering upkeep...");
        const tx = await registry.registerUpkeep(
            badgeNFTAddress,
            AUTOMATION_CONFIG.gasLimit,
            deployer.address, // admin
            AUTOMATION_CONFIG.checkData,
            "0x" // offchain config
        );
        
        const receipt = await tx.wait();
        console.log("✅ Upkeep registered! Transaction:", receipt.hash);
        
        // Find the upkeep ID from events
        const upkeepId = receipt.logs[0].topics[1]; // Assuming first log contains upkeep ID
        console.log("🆔 Upkeep ID:", upkeepId);
        
        // Fund the upkeep
        console.log("💰 Funding upkeep with LINK tokens...");
        const fundTx = await registry.addFunds(upkeepId, AUTOMATION_CONFIG.amount);
        await fundTx.wait();
        console.log("✅ Upkeep funded with", ethers.formatEther(AUTOMATION_CONFIG.amount), "LINK");
        
        // Save automation data
        const automationData = {
            network: "arbitrumSepolia",
            timestamp: new Date().toISOString(),
            registry: AUTOMATION_CONFIG.registryAddress,
            upkeepId: upkeepId,
            target: badgeNFTAddress,
            admin: deployer.address,
            gasLimit: AUTOMATION_CONFIG.gasLimit,
            fundingAmount: ethers.formatEther(AUTOMATION_CONFIG.amount),
            explorerUrl: `https://sepolia.arbiscan.io/tx/${receipt.hash}`
        };
        
        const automationPath = path.join(__dirname, "..", "deployments", "automation.json");
        fs.writeFileSync(automationPath, JSON.stringify(automationData, null, 2));
        
        console.log("📁 Automation data saved to:", automationPath);
        
        return {
            upkeepId,
            transactionHash: receipt.hash
        };
        
    } catch (error) {
        console.error("❌ Failed to register automation:", error);
        throw error;
    }
}

// Function to check upkeep status
async function checkUpkeepStatus(upkeepId) {
    console.log("🔍 Checking upkeep status...");
    
    const [deployer] = await ethers.getSigners();
    const registry = new ethers.Contract(
        AUTOMATION_CONFIG.registryAddress,
        AUTOMATION_REGISTRY_ABI,
        deployer
    );
    
    try {
        const upkeepInfo = await registry.getUpkeep(upkeepId);
        
        console.log("📊 Upkeep Status:");
        console.log("- Target:", upkeepInfo.target);
        console.log("- Gas Limit:", upkeepInfo.executeGas.toString());
        console.log("- Balance:", ethers.formatEther(upkeepInfo.balance), "LINK");
        console.log("- Admin:", upkeepInfo.admin);
        console.log("- Last Keeper:", upkeepInfo.lastKeeper);
        console.log("- Amount Spent:", upkeepInfo.amountSpent.toString());
        
        return upkeepInfo;
    } catch (error) {
        console.error("❌ Failed to check upkeep status:", error);
        throw error;
    }
}

// Function to cancel upkeep
async function cancelUpkeep(upkeepId) {
    console.log("🛑 Cancelling upkeep...");
    
    const [deployer] = await ethers.getSigners();
    const registry = new ethers.Contract(
        AUTOMATION_CONFIG.registryAddress,
        AUTOMATION_REGISTRY_ABI,
        deployer
    );
    
    try {
        const tx = await registry.cancelUpkeep(upkeepId);
        await tx.wait();
        console.log("✅ Upkeep cancelled");
        
        return tx.hash;
    } catch (error) {
        console.error("❌ Failed to cancel upkeep:", error);
        throw error;
    }
}

// Function to setup complete automation flow
async function setupAutomationFlow() {
    console.log("🚀 Setting up complete Chainlink Automation flow...");
    
    try {
        // Register BadgeNFT automation
        const result = await registerBadgeAutomation();
        
        console.log("\n🎉 Automation setup completed!");
        console.log("📋 Summary:");
        console.log("- Upkeep ID:", result.upkeepId);
        console.log("- Transaction:", result.transactionHash);
        console.log("- Registry:", AUTOMATION_CONFIG.registryAddress);
        console.log("- Funded with:", ethers.formatEther(AUTOMATION_CONFIG.amount), "LINK");
        
        console.log("\n🔗 Useful links:");
        console.log("- Automation Dashboard: https://automation.chain.link");
        console.log("- Transaction:", `https://sepolia.arbiscan.io/tx/${result.transactionHash}`);
        
        console.log("\n⚡ Next steps:");
        console.log("1. Monitor automation dashboard");
        console.log("2. Test badge minting triggers");
        console.log("3. Add more LINK if needed");
        
        return result;
    } catch (error) {
        console.error("❌ Automation setup failed:", error);
        throw error;
    }
}

// Export functions
module.exports = {
    registerBadgeAutomation,
    checkUpkeepStatus,
    cancelUpkeep,
    setupAutomationFlow,
    AUTOMATION_CONFIG
};

// CLI usage
if (require.main === module) {
    async function main() {
        const command = process.argv[2];
        const upkeepId = process.argv[3];
        
        switch (command) {
            case "register":
                await registerBadgeAutomation();
                break;
            case "status":
                if (!upkeepId) {
                    console.error("Please provide upkeep ID");
                    process.exit(1);
                }
                await checkUpkeepStatus(upkeepId);
                break;
            case "cancel":
                if (!upkeepId) {
                    console.error("Please provide upkeep ID");
                    process.exit(1);
                }
                await cancelUpkeep(upkeepId);
                break;
            case "setup":
                await setupAutomationFlow();
                break;
            default:
                console.log("Usage:");
                console.log("  node automation-register.js register");
                console.log("  node automation-register.js status <upkeepId>");
                console.log("  node automation-register.js cancel <upkeepId>");
                console.log("  node automation-register.js setup");
        }
    }
    
    main().catch((error) => {
        console.error("❌ Command failed:", error);
        process.exit(1);
    });
} 
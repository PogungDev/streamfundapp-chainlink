const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Starting contract verification on Arbiscan...");
    
    // Load deployment data
    const deploymentPath = path.join(__dirname, "..", "deployments", "arbitrumSepolia.json");
    
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ Deployment file not found. Please run deployment first.");
        process.exit(1);
    }
    
    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const { contracts, chainlink } = deploymentData;
    
    console.log("📋 Verifying contracts from deployment:", deploymentData.timestamp);
    
    // Verification parameters
    const CHAINLINK_FUNCTIONS_ROUTER = chainlink.functionsRouter;
    const CHAINLINK_DON_ID = chainlink.donId;
    const CHAINLINK_SUBSCRIPTION_ID = chainlink.subscriptionId;
    const USDC_TOKEN_ADDRESS = contracts.USDC;
    
    try {
        // Verify VaultNFT
        console.log("\n🔍 Verifying VaultNFT...");
        await run("verify:verify", {
            address: contracts.VaultNFT,
            constructorArguments: [
                CHAINLINK_FUNCTIONS_ROUTER,
                ethers.encodeBytes32String(CHAINLINK_DON_ID),
                CHAINLINK_SUBSCRIPTION_ID
            ],
        });
        console.log("✅ VaultNFT verified");
        
    } catch (error) {
        console.log("⚠️  VaultNFT verification failed (might already be verified):", error.message);
    }
    
    try {
        // Verify InjectUSDC
        console.log("\n🔍 Verifying InjectUSDC...");
        await run("verify:verify", {
            address: contracts.InjectUSDC,
            constructorArguments: [
                USDC_TOKEN_ADDRESS,
                contracts.VaultNFT
            ],
        });
        console.log("✅ InjectUSDC verified");
        
    } catch (error) {
        console.log("⚠️  InjectUSDC verification failed (might already be verified):", error.message);
    }
    
    try {
        // Verify BadgeNFT
        console.log("\n🔍 Verifying BadgeNFT...");
        await run("verify:verify", {
            address: contracts.BadgeNFT,
            constructorArguments: [],
        });
        console.log("✅ BadgeNFT verified");
        
    } catch (error) {
        console.log("⚠️  BadgeNFT verification failed (might already be verified):", error.message);
    }
    
    console.log("\n🎉 Verification process completed!");
    console.log("\n🔗 Verified contract links:");
    console.log("- VaultNFT:", `https://sepolia.arbiscan.io/address/${contracts.VaultNFT}#code`);
    console.log("- InjectUSDC:", `https://sepolia.arbiscan.io/address/${contracts.InjectUSDC}#code`);
    console.log("- BadgeNFT:", `https://sepolia.arbiscan.io/address/${contracts.BadgeNFT}#code`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    }); 
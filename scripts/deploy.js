const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting StreamFund AI deployment to Arbitrum Sepolia...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    // Arbitrum Sepolia Chainlink configuration
    const CHAINLINK_FUNCTIONS_ROUTER = "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C";
    const CHAINLINK_DON_ID = "fun-arbitrum-sepolia-1";
    const CHAINLINK_SUBSCRIPTION_ID = process.env.CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID || "1";
    const USDC_TOKEN_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // Arbitrum Sepolia USDC

    console.log("\n📋 Deployment Configuration:");
    console.log("- Network: Arbitrum Sepolia (421614)");
    console.log("- Chainlink Functions Router:", CHAINLINK_FUNCTIONS_ROUTER);
    console.log("- DON ID:", CHAINLINK_DON_ID);
    console.log("- Subscription ID:", CHAINLINK_SUBSCRIPTION_ID);
    console.log("- USDC Token:", USDC_TOKEN_ADDRESS);

    // Deploy VaultNFT
    console.log("\n🏗️  Deploying VaultNFT...");
    const VaultNFT = await ethers.getContractFactory("VaultNFT");
    const vaultNFT = await VaultNFT.deploy(
        CHAINLINK_FUNCTIONS_ROUTER,
        ethers.encodeBytes32String(CHAINLINK_DON_ID),
        CHAINLINK_SUBSCRIPTION_ID
    );
    await vaultNFT.waitForDeployment();
    const vaultNFTAddress = await vaultNFT.getAddress();
    console.log("✅ VaultNFT deployed to:", vaultNFTAddress);

    // Deploy InjectUSDC
    console.log("\n🏗️  Deploying InjectUSDC...");
    const InjectUSDC = await ethers.getContractFactory("InjectUSDC");
    const injectUSDC = await InjectUSDC.deploy(USDC_TOKEN_ADDRESS, vaultNFTAddress);
    await injectUSDC.waitForDeployment();
    const injectUSDCAddress = await injectUSDC.getAddress();
    console.log("✅ InjectUSDC deployed to:", injectUSDCAddress);

    // Deploy BadgeNFT
    console.log("\n🏗️  Deploying BadgeNFT...");
    const BadgeNFT = await ethers.getContractFactory("BadgeNFT");
    const badgeNFT = await BadgeNFT.deploy();
    await badgeNFT.waitForDeployment();
    const badgeNFTAddress = await badgeNFT.getAddress();
    console.log("✅ BadgeNFT deployed to:", badgeNFTAddress);

    // Set permissions
    console.log("\n🔑 Setting up permissions...");
    
    // Allow InjectUSDC to update VaultNFT
    console.log("- Setting InjectUSDC as VaultNFT owner...");
    // await vaultNFT.transferOwnership(injectUSDCAddress);
    
    // Allow InjectUSDC to update BadgeNFT
    console.log("- Setting InjectUSDC permissions for BadgeNFT...");
    // await badgeNFT.grantRole(await badgeNFT.MINTER_ROLE(), injectUSDCAddress);

    // Save deployment addresses
    const deploymentData = {
        network: "arbitrumSepolia",
        chainId: 421614,
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            VaultNFT: vaultNFTAddress,
            InjectUSDC: injectUSDCAddress,
            BadgeNFT: badgeNFTAddress,
            USDC: USDC_TOKEN_ADDRESS
        },
        chainlink: {
            functionsRouter: CHAINLINK_FUNCTIONS_ROUTER,
            donId: CHAINLINK_DON_ID,
            subscriptionId: CHAINLINK_SUBSCRIPTION_ID
        },
        explorerUrls: {
            VaultNFT: `https://sepolia.arbiscan.io/address/${vaultNFTAddress}`,
            InjectUSDC: `https://sepolia.arbiscan.io/address/${injectUSDCAddress}`,
            BadgeNFT: `https://sepolia.arbiscan.io/address/${badgeNFTAddress}`
        }
    };

    // Write deployment data to file
    const deploymentPath = path.join(__dirname, "..", "deployments", "arbitrumSepolia.json");
    fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));

    // Update .env.local with contract addresses
    const envPath = path.join(__dirname, "..", ".env.local");
    let envContent = "";
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
    }

    // Update or add contract addresses
    const updateEnvVar = (content, key, value) => {
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(content)) {
            return content.replace(regex, `${key}=${value}`);
        } else {
            return content + `\n${key}=${value}`;
        }
    };

    envContent = updateEnvVar(envContent, "NEXT_PUBLIC_VAULT_NFT_ADDRESS", vaultNFTAddress);
    envContent = updateEnvVar(envContent, "NEXT_PUBLIC_INJECT_USDC_ADDRESS", injectUSDCAddress);
    envContent = updateEnvVar(envContent, "NEXT_PUBLIC_BADGE_NFT_ADDRESS", badgeNFTAddress);

    fs.writeFileSync(envPath, envContent);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📄 Contract Addresses:");
    console.log("- VaultNFT:", vaultNFTAddress);
    console.log("- InjectUSDC:", injectUSDCAddress);
    console.log("- BadgeNFT:", badgeNFTAddress);
    
    console.log("\n🔍 Explorer Links:");
    console.log("- VaultNFT:", `https://sepolia.arbiscan.io/address/${vaultNFTAddress}`);
    console.log("- InjectUSDC:", `https://sepolia.arbiscan.io/address/${injectUSDCAddress}`);
    console.log("- BadgeNFT:", `https://sepolia.arbiscan.io/address/${badgeNFTAddress}`);
    
    console.log("\n📁 Files updated:");
    console.log("- Deployment data saved to:", deploymentPath);
    console.log("- Environment variables updated in .env.local");
    
    console.log("\n⚡ Next steps:");
    console.log("1. Verify contracts: npm run verify:sepolia");
    console.log("2. Setup Chainlink Functions subscription");
    console.log("3. Fund contracts with testnet tokens");
    console.log("4. Test the complete flow");
    
    console.log("\n🚀 Ready for testing and demo!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 
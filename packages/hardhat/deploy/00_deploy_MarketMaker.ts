import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "MarketMaker" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMarketMaker: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log(deployer + " is deploying the MarketMaker contract");

  await deploy("MarketMaker", {
    from: deployer,
    // Contract constructor arguments
    args: ["0x1C588962D0855d3204DcC4C9A0fD7fa544F6b525", "0xD1092a65338d049DB68D7Be6bD89d17a0929945e", "0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF", "0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5", "0xdD7c06561689c73f0A67F2179e273cCF45EFc964", "0x11cA3127182f7583EfC416a8771BD4d11Fae4334", false, "0xe29ddD8F8a8AB5D44a39EF90E1143C26b437f039"],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const marketMaker = await hre.ethers.getContract<Contract>("MarketMaker", deployer);
  console.log("👋 Initial greeting:", await marketMaker.greeting());
};

export default deployMarketMaker;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags MarketMaker
deployMarketMaker.tags = ["MarketMaker"];
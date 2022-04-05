const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const SBTNFT = await hre.ethers.getContractFactory("SBTNFT");
  const sbtNFT = await SBTNFT.deploy();
  await sbtNFT.deployed();
  console.log("nftMarket deployed to:", sbtNFT.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(sbtNFT.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

let config = `
export const nftmarketaddress = "${sbtNFT.address}"
export const nftaddress = "${nft.address}"
`

let data = JSON.stringify(config)
fs.writeFileSync('./src/components/templates/config.js', JSON.parse(data))

}
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
   
  
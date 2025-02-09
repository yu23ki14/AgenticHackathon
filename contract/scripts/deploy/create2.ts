import { ethers, network } from "hardhat"
import type { Address } from "viem"
import { deployFractionToken } from "../../helpers/deploy/FractionToken"
import { writeContractAddress } from "../../helpers/deploy/contractsJsonHelper"

const deploy = async () => {
  console.log(
    "##################################### [Create2 Deploy START] #####################################"
  )

  // Deploy FractionToken implementation and proxy
  console.log("Deploying FractionToken...")

  const { FractionToken, FractionTokenImplAddress, FractionTokenInitData } =
    await deployFractionToken("", 10000n, process.env.HATS_ADDRESS as Address)
  const fractionTokenAddress = FractionToken.address

  // Deploy SplitsCreatorFactory implementation and proxy
  console.log("Deploying SplitsCreatorFactory...")

  console.log("Successfully deployed contracts!🎉")
  console.log("Verify contract with these commands...\n")

  console.log(
    "FractionToken:\n",
    `npx hardhat verify ${FractionTokenImplAddress} --network ${network.name} &&`,
    `npx hardhat verify ${fractionTokenAddress} ${FractionTokenImplAddress} ${FractionTokenInitData} --network ${network.name}\n`
  )

  // Save upgradeable contracts implementations
  writeContractAddress({
    group: "implementations",
    name: "FractionToken_Implementation",
    value: FractionTokenImplAddress,
    network: network.name,
  })

  // Save upgradeable contracts proxies
  writeContractAddress({
    group: "contracts",
    name: "FractionToken",
    value: fractionTokenAddress,
    network: network.name,
  })

  console.log(
    "\n##################################### [Create2 Deploy END] #####################################"
  )
}

deploy()

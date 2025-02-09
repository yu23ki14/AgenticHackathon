import { ethers, viem } from "hardhat"
import { Address, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import { FractionToken } from "../helpers/deploy/FractionToken"

const gentestdata = async () => {
  const [signer] = await ethers.getSigners()
  const wallets = []

  for (const element of wallets.filter((wallet) => wallet.role)) {
    const account = privateKeyToAccount(element.privateKey as `0x${string}`)

    const otherWallets = wallets
      .filter((wallet) => wallet.address !== element.address)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((wallet) => wallet.address)

    const contract: FractionToken = await viem.getContractAt(
      "FractionToken",
      "0x2939D7Dd2dF88f901A2de4B282367134480bBdC2"
    )

    const tokenId = await contract.read.getTokenId([
      element.hatId,
      element.address,
    ])

    for (const ow of otherWallets) {
      const randomAmount = Math.floor(Math.random() * (300 - 50 + 1)) + 50
      await contract.write.safeTransferFrom(
        [element.address, ow, tokenId, BigInt(randomAmount), "0x"],
        { account }
      )
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }

  // const provider = ethers.getDefaultProvider()
  // for (let i = 0; i < 15; i++) {
  //   const wallet = ethers.Wallet.createRandom(provider)
  //   const address = await wallet.getAddress()
  //   const privateKey = wallet.privateKey

  //   console.log(`{address: "${address}", privateKey: "${privateKey}"}`)
  // }
}

gentestdata()

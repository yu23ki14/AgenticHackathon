import type { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox-viem"

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          viaIR: true,
          optimizer: {
            runs: 200,
          },
        },
      },
    ],
  },
}

export default config

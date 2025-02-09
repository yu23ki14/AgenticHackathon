import axios from "axios"
import { Address, encodeFunctionData, http } from "viem"
import { sepolia } from "viem/chains"
import { ASSISTCREDIT_ABI } from "../abi/assistcredit.js"

const client = axios.create({
  baseURL: "https://api-qa.collab.land/accountkit/v1",
  headers: {
    "X-API-KEY": process.env.COLLABLAND_API_KEY || "",
    "X-TG-BOT-TOKEN": process.env.TELEGRAM_BOT_TOKEN || "",
    "Content-Type": "application/json",
  },
  timeout: 5 * 60 * 1000,
})

export const sendAssistCredit = async (
  sender: Address,
  receiver: Address,
  tokenId: bigint,
  amount: bigint
) => {
  const txData = encodeFunctionData({
    abi: ASSISTCREDIT_ABI,
    functionName: "safeTransferFrom",
    args: [sender, receiver, tokenId, amount, "0x"],
  })

  console.log("txData:", txData)

  try {
    const { data }: { data: { userOperationHash: string; chainId: string } } =
      await client.post(
        "/telegrambot/evm/submitUserOperation?chainId=11155111",
        {
          target: "0x2939d7dd2df88f901a2de4b282367134480bbdc2",
          calldata: txData,
          value: "0x0",
        }
      )

    console.log("data:", data)

    return data
  } catch (error) {
    throw new Error(`Failed to send Assist Credit: ${error}`)
  }
}

export const sendETH = async () => {
  const res = await client.get("/telegrambot/accounts")
  console.log("res:", res.data)

  // const { data }: { data: { userOperationHash: string; chainId: string } } =
  //   await client.post("/telegrambot/evm/submitUserOperation?chainId=11155111", {
  //     target: "0xdCb93093424447bF4FE9Df869750950922F1E30B",
  //     calldata: "0x",
  //     value: BigInt(1).toString(16),
  //   })

  // return data
}

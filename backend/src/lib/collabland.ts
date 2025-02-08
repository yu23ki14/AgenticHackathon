import axios from "axios"

const client = axios.create({
  baseURL: "https://api-qa.collab.land/accountkit/v1",
  headers: {
    "X-API-KEY": process.env.COLLABLAND_API_KEY || "",
    "X-TG-BOT-TOKEN": process.env.TELEGRAM_BOT_TOKEN || "",
    "Content-Type": "application/json",
  },
  timeout: 5 * 60 * 1000,
})

export const sendETH = async () => {
  // const res = await client.get("/telegrambot/accounts")
  // console.log("res:", res.data)

  const { data }: { data: { userOperationHash: string; chainId: string } } =
    await client.post("/telegrambot/evm/submitUserOperation?chainId=11155111", {
      target: "0xdCb93093424447bF4FE9Df869750950922F1E30B",
      calldata: "0x",
      value: BigInt(1).toString(16),
    })

  return data
}

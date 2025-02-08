import { Action, composeContext, generateText, ModelClass } from "@elizaos/core"

const FormatTransferAssistCreditTemplate = `
Respond with a text containing only the extracted values. Use null for any values that cannot be determined.
Recent messages are provided for context.

# Output Format:
<amount>{{amount_of_assist_credit}}</amount>
<senderUserId>{{sender_user_id}}</senderUserId>
<receiverUserId>{{receiver_user_id}}</receiverUserId>
<assistCreditTokenId>{{assist_credit_token_id}}</assistCreditTokenId>
<anouncement>Please wait for a while</anouncement>

# Example Response:
<amount>100</amount>
<senderUserId>123456</senderUserId>
<receiverUserId>654321</receiverUserId>
<assistCreditTokenId>123456</assistCreditTokenId>
<anouncement>Please wait for a while</anouncement>

# Explanation of the above fields:
- amount: The amount of Assist Credit.
- senderUserId: The telegram user ID of the sender.
- receiverUserId: The telegram user ID of the receiver.
- assistCreditTokenId: The token ID of the Assist Credit.
- announcement: The announcement message to be sent to the sender.

# Recent Messages
{{recentMessages}}
`

export const sendFractionToken: Action = {
  name: "ASSIST_CREDIT_TRANSFER",
  similes: ["TRANSFER_ASSIST_CREDIT", "SEND_ASSIST_CREDIT"],
  description:
    "Send a assist credit of a given amount to receiver user from sender user",
  examples: [
    [
      {
        user: "{{agentName}}",
        content: {
          text: "Why don't you send some assist credit to John?",
        },
      },
      {
        user: "{{user1}}",
        content: {
          text: "Please send 100 assist credit to user1",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Could you send some assist credit to user2?",
        },
      },
    ],
  ],
  handler: async (runtime, message, state) => {
    const contextForFormat = composeContext({
      state,
      template: FormatTransferAssistCreditTemplate,
    })
    const transferInfo = await generateText({
      runtime: runtime,
      context: contextForFormat,
      modelClass: ModelClass.MEDIUM,
    })
    console.log(transferInfo)
    console.log(`Sending `)
  },
  validate: async (context) => {
    console.log(`Validating`)
    return true
  },
}

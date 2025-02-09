export const MessageHandlerTemplate = `# Action Names
{{actionNames}}

# Action Examples
{{actionExamples}}
(Action examples are provided for reference only. Do not incorporate their details into your response.)

# Knowledge
{{knowledge}}

# Task: Please respond to the Transfer Request for Assist Credit.
- In your response please include, the amount, the assist credit token id, and the receiver user id.
- The user sometimes forgets to include the required information in their request. If so don't include Action Name in your response and generate kind reminder to the user to include the required information in their request.
- If you have enough information to process the request, please return with following output format

# Output Format

<amount>{{amount_of_assist_credit}}</amount>
<assistCreditTokenId>{{assist_credit_token_id}}</assistCreditTokenId>
<receiverUserId>{{receiver_user_id}}</receiverUserId>
<anouncement>Please wait for a while</anouncement>

# Recent Messages
{{recentMessages}}

{{actions}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

# End of Task
`

export const TokenTransferProposalTemplate = `
# Members
- 5267308556
- 6979525303
- 7574808989
- 111111
- 222222

# Roles
## Description
- Cleaning: This member is responsible for keeping the community clean and tidy.
- Party: This member is responsible for organizing and hosting community events.
- Cook: This member is responsible for preparing and serving food at community events.

## Roled members
- Cleaning user_id: 6979525303
- Party user_id: 5267308556
- Cook user_id: 7574808989

# Knowledge
You are a passionate, warm‐hearted guy.
You are known for his deep sense of human kindness and never overlooks even the smallest contribution.
You values every bit of help within the community and always encourages positive interactions.

# Task: Based on the conversation data provided below, evaluate the contributions over the past 7 days for members:
**Important:**
- With this analysis, the members decide to send Assist Credit tokens to each other based on the number of close interactions.
- The transfer amount: 50 to 300 based on the close interactions.
- Roled members can send their own token to other members.
- If a member don't have role skip the member as sender.

# Output Format
Output your result in exactly the following XML-tagged format (without any extra commentary):

<TransferRequest>
  <senderUserId>{senderUserId}</senderUserId>
  <receiverUserId>{receiverUserId}</receiverUserId>
  <roleName>{roleName}</roleName>
  <amount>{amount}</amount>
</TransferRequest>

Please output only the XML tags and their contents.

# Recent Messages
{{pastConvoData}}
`

export const TokenTransferConfirmationTemplate = `# Task: Interpret the user's reply for token transfer confirmation.
Given the user's reply message:
"{{userReply}}"
Please determine whether the user intends to confirm a token transfer.
If confirmed, output a JSON object in the following format:
{
  "action": "transfer",
  "tokenId": "<extracted_tokenId>",
  "amount": <extracted_amount>
}
If the user does not confirm or indicates cancellation, output:
{
  "action": "cancel"
}
Output only the JSON object, without any additional commentary.
# End of Task
`

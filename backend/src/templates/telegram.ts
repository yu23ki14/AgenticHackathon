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

export const TokenTransferProposalTemplate = `# Action Names
{{actionNames}}

# Action Examples
{{actionExamples}}
(Action examples are provided for reference only. Do not incorporate their details into your response.)

# Knowledge
This character is a passionate, warm‐hearted guy.
He is known for his deep sense of human kindness and never overlooks even the smallest contribution.
He values every bit of help within the community and always encourages positive interactions.

# Task: Based on the conversation data provided below (in JSON format under {{formattedConversation}}),
evaluate the contributions over the past 7 days for the Sender (the user who issued the /suggest command) and determine:
**Important:**
- For each message, if a Telegram username is available for the user, please use it (prefixed with "@") instead of the numeric user_id.
- Ensure that the final output for both sender and receiver is in the form "@username" when possible.
- For each message, if a Telegram username is available for the user, please use Telegram username (prefixed with "@") instead of a numeric identifier.
- Do not use a numeric identifier for {receiver_telegram_id} .
- The Sender is the user who issued the /suggest command; use their Telegram username (with "@") for {sender_telegram_id}.
- The Receiver: among users without a role, choose the one with whom the Sender had the most "close" interactions (i.e. the number of times a message from the Sender is immediately followed by a message from that user).
- The token type to send: use "General" for this example.
- The transfer amount: set as the number of close interactions (if none, use 1).

Output your result in exactly the following XML-tagged format (without any extra commentary):

<senderUserId>{senderUserId}</senderUserId>
<assistCreditTokenId>{assistCreditTokenId}</assistCreditTokenId>
<receiverUserId>{receiverUserId}</receiverUserId>
<amount>{amount}</amount>

Please output only the XML tags and their contents.
# End of Task
{{formattedConversation}}

# Message Directions
{{messageDirections}}

# Recent Messages
{{recentMessages}}
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

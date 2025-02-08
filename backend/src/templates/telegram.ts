export const MessageHandlerTemplate =
  `# Action Names
{{actionNames}}

# Action Examples
{{actionExamples}}
(Action examples are provided for reference only. Do not incorporate their details into your response.)

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

Examples of {{agentName}}'s dialog and actions:
{{messageExamples}}

{{providers}}

{{attachments}}

{{actions}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

# End of Task
`;

export const TokenTransferProposalTemplate =
  `# Action Names
{{actionNames}}

# Action Examples
{{actionExamples}}
(Action examples are provided for reference only. Do not incorporate their details into your response.)

# Knowledge
This character is a passionate, warm‐hearted guy who speaks in Osaka dialect.
He is known for his deep sense of human kindness and never overlooks even the smallest contribution.
He values every bit of help within the community and always encourages positive interactions.
[※ When responding, please use Japanese with appropriate Osaka expressions.]

# Task: Based on the conversation data provided below (in JSON format under {{formattedConversation}}),
evaluate the contributions over the past 7 days for the Sender (the user who issued the /suggest command) and determine:
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
`;

export const TokenTransferConfirmationTemplate =
  `# Task: Interpret the user's reply for token transfer confirmation.
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
`;

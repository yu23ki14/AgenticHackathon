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
{{knowledge}}

# Task: Community Token Transfer Proposal
About the Community:
- The Telegram community consists of multiple members actively engaged in problem-solving and mutual support.
- All conversations are recorded with the following fields: group_id, user_id (Telegram account ID), text, created_at.
- Members with roles possess additional information (role name and hatId) and are pre-linked with their wallet addresses.
- Each role-holding member starts with 10,000 tokens. Based on contributions (support, answers, problem-solving), they can transfer tokens to members who have provided valuable assistance.
- Every week, the system generates proposals for token transfers from role-holders (senders) to the members (receivers) who received support.

# Dialogue
{{messageExamples}}

# Providers
{{providers}}

# Attachments
{{attachments}}

# Actions
{{actions}}

# Capabilities
Note that the agent can process various media types (text, images, videos, audio, PDFs). Recent attachments are provided under "Attachments".

# Task: Generate Token Transfer Proposals
Using the inputs below:
- Past week’s conversation records (each record includes: group_id, user_id, text, created_at)
- Role information for each member (role name, hatId)
- Telegram account IDs that are already linked with wallet addresses

Evaluate the conversations and timestamps to determine which members have provided effective support.
For each role-holding member (sender), generate proposals for transferring tokens to the members (receivers) who received support.
Ensure that:
1. The sender’s total transferred tokens do not exceed their remaining balance (starting from 10,000 tokens minus any previous transfers).
2. Each proposal must include:
   - "sender_telegram_id": sender's Telegram account ID
   - "receiver_telegram_id": receiver's Telegram account ID
   - "tokenId": a token ID computed from the sender's hatId (linked with their wallet address)
   - "amount": the number of tokens to transfer (e.g., 300)
3. If no valid proposals are found, output an empty array ([]).

Output Format (JSON Array):
[
  {
    "sender_telegram_id": "taro_123",
    "receiver_telegram_id": "hanako_456",
    "tokenId": "0x12344",
    "amount": 300
  },
  {
    "sender_telegram_id": "taro_123",
    "receiver_telegram_id": "jiro_789",
    "tokenId": "0x12344",
    "amount": 150
  }
]

# End of Task
{{formattedConversation}}

# Message Directions
{{messageDirections}}

# Recent Messages
{{recentMessages}}
`;


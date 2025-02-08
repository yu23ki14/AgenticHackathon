export const MessageHandlerTemplate = `
# Action Names
{{actionNames}}

# Action Examples
{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

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

{{formattedConversation}}
`

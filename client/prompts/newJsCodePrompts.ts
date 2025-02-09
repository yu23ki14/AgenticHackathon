import { transactions } from "@/utils/GenerateDependenciesGraphData/transactions";

/**
 * Generates a new JavaScript code prompt for analyzing community token transaction data.
 * @param count - The number of transactions to be included in the prompt.
 * @returns A string containing the generated prompt.
 */
export function newJsCodePrompt(count: number) {
  const startPart = `
# Community Token Transaction Network Analysis

## Overview

- Assume a situation where members of a community send tokens tied to roles to each other.
- By sending tokens, members can assign roles to others, and by receiving tokens, they can take on roles.
- The total amount of tokens tied to one role is \`10,000\`, and the distribution ratio determines the weight of role assignment.
- Analyze the transaction trends and consider how to reflect them.

## Sample Transaction Data

  `;

  const endPart = `

## Data Structure and Type Definitions

### Transaction Data

\`\`\`typescript
interface Transaction {
  sender: string;
  receiver: string;
  amount: string;
  tokenId: string;
  roleName: string;
  blockTimestamp: string;
  roleAssignee: string;
}
\`\`\`

### Graph Data

\`\`\`typescript
interface GraphNode {
  id: number;
  label: string;
  title: string;
}

interface GraphEdge {
  from: GraphNode["id"];
  to: GraphNode["id"];
  width: number;
}
\`\`\`

### Function Type to Output

\`\`\`typescript
declare function update(
  transactions: Transaction[],
  nodeMap: Map<string, GraphNode>,
  edgeMap: Map<string, GraphEdge>
): void;
\`\`\`

## Task

1. Analyze and evaluate the trends in the **sample transaction data**.

   - This data is randomly extracted from past transactions.
   - Each field has the following meanings:
     - \`sender\`: Address of the token sender
     - \`receiver\`: Address of the token receiver
     - \`amount\`: Amount of tokens (up to \`10,000\`)
     - \`tokenId\`: Unique ID of the token
     - \`roleName\`: Name of the role
     - \`blockTimestamp\`: Timestamp of the transaction
     - \`roleAssignee\`: Address of the person initially assigned the role (often the \`sender\`)
   - For example, the following analysis and evaluation of trends can be considered:
     - The frequency of transactions varies by token, and for tokens with fewer transactions, it can be judged that they are important roles that only specific people can perform, so the relationship is highly valued.
     - The frequency of transactions is high, and the \`amount\` is specified in detail, so it can be judged that the amount of tokens is delicately determined to divide roles, and the difference in \`amount\` is directly linked to the evaluation.

2. Implement the evaluation method obtained from the data analysis as a JavaScript function.

   - The actual transaction data is already formatted and stored in a data structure that can be visualized as a dependency graph.
   - A dependency graph is a graph structure consisting of nodes (points) and edges (lines), where nodes represent community members and edges represent relationships between members.
   - The arguments are \`transactions\`, \`nodeMap\`, and \`edgeMap\`:
     - \`transactions\`: The type is \`Transaction[]\`, containing all transaction data.
     - \`nodeMap\`: The type is \`Map<string, GraphNode>\`, containing node data.
     - \`edgeMap\`: The type is \`Map<string, GraphEdge>\`, containing edge data. The \`width\` field is the evaluation value of the edge and is set to \`0\`.
   - Design a function to update the \`width\` field of \`GraphEdge\` using each argument and implement the evaluation method.
   - The simplest example of a function is as follows:

     \`\`\`javascript
     function update(transactions, nodeMap, edgeMap) {
       transactions.forEach(function (tx) {
         const senderNode = nodeMap.get(tx.sender);
         const receiverNode = nodeMap.get(tx.receiver);

         const edgeKey = \`\${senderNode.id}-\${receiverNode.id}\`;
         const edge = edgeMap.get(edgeKey);

         edge.width += 1;
       });
     }
     \`\`\`

   - Explain how the given data is evaluated and what each function is intended to achieve.

## Output Constraints

- The function name must always be \`update\`, and no descriptive words should be included in the function name.
- Follow the format shown below for output. Remove all other text.

  \`\`\`text
  {
    "function": {generated function},
    "description": {description of generated function}
  }
  \`\`\`

  `;

  const randomPart = getRandomItems(transactions, count);

  return startPart + randomPart.join("\n") + endPart;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  if (count >= array.length) return [...array];
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

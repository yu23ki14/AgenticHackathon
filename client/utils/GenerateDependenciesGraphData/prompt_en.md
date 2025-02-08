# Community Token Transaction Network Analysis

## Overview

- Assume a community consisting of multiple members, where tokens tied to roles are exchanged between members.
- By sending tokens, you can assign roles to others, and by receiving tokens, you can take on roles.
- The total amount of tokens tied to one role is `10,000`, and the distribution ratio determines the weight of the role assignment.
- Analyze transaction trends and consider methods to reflect them.

## Sample Transaction Data

We experimented with the values in ./transactions.ts

## Data Structure and Type Definitions

### Transaction Data

```typescript
interface Transaction {
  sender: string;
  receiver: string;
  amount: number;
  tokenId: string;
  roleName: string;
  roleDescription: string;
  roleAssignee: string;
}
```

### Graph Data

```typescript
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
```

### Function Type to Output

```typescript
declare function update(
  transactions: Transaction[],
  nodeMap: { [key: string]: GraphNode },
  edgeMap: { [key: string]: GraphEdge }
): void;
```

## Tasks

1. Analyze and evaluate the trends of **sample transaction data**.

   - This data is randomly extracted from past transaction data.
   - Each field has the following meanings:
     - `sender`: Address of the token sender
     - `receiver`: Address of the token receiver
     - `amount`: Amount of tokens (up to `10,000`)
     - `tokenId`: Unique ID for the token
     - `roleName`: Name of the role
     - `roleDescription`: Description of the role
     - `roleAssignee`: Address of the person initially assigned the role (often the `sender`)
   - For example, the following analysis and evaluation of trends can be considered:
     - The frequency of transactions varies by token, and for tokens with fewer transactions, it can be judged that they are important roles that only specific people can perform, so the relationship is highly valued.
     - The frequency of transactions is high, and the `amount` is specified in detail, so it can be judged that the amount of tokens is delicately determined to share roles, and the difference in `amount` is directly linked to the evaluation.

2. Implement the evaluation method obtained from the data analysis as a JavaScript function.

   - The actual transaction data is already formatted and stored in a data structure that can be visualized as a dependency graph.
   - A dependency graph is a graph structure consisting of nodes (points) and edges (lines), where nodes represent community members and edges represent relationships between members.
   - The arguments are `transactions`, `nodeMap`, and `edgeMap`:
     - `transactions`: The type is `Transaction[]`, and it contains all transaction data.
     - `nodeMap`: The type is `{ [key: string]: GraphNode }`, and it contains node data.
     - `edgeMap`: The type is `{ [key: string]: GraphEdge }`, and it contains edge data. The `width` field is the evaluation value of the edge and is set to `0`.
   - Design a function to update the `width` field of `GraphEdge` using each argument.
   - The simplest example is as follows:

     ```javascript
     function update(transactions, nodeMap, edgeMap) {
       transactions.forEach(function (tx) {
         const senderNode = nodeMap[tx.sender];
         const receiverNode = nodeMap[tx.receiver];

         const edgeKey = `${senderNode.id}-${receiverNode.id}`;
         const edge = edgeMap[edgeKey];

         edge.width += 1;
       });
     }
     ```

   - Design three types of functions according to the function type to output.
   - Explain what each function is intended to do.

## Output Constraints

- The function name must be `update`.
- Follow the format shown below. Remove all other text.

  ```text
  [
    {
      "function": {first generated function},
      "description": {description of the first generated function}
    },
    {
      "function": {second generated function},
      "description": {description of the second generated function}
    },
    {
      "function": {third generated function},
      "description": {description of the third generated function}
    }
  ]
  ```

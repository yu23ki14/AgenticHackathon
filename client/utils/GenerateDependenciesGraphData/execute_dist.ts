// client/utils/GenerateDependenciesGraphData/execute_dist.ts
import { abbreviateAddress } from "./abbreviateAddress";

export interface Transaction {
  sender: string;
  receiver: string;
  amount: string;
  tokenId: string;
  roleName: string;
  blockTimestamp: string;
  roleAssignee: string;
}

export interface GraphNode {
  id: number;
  label: string;
  title: string;
  size?: number;
}

export interface GraphEdge {
  from: number;
  to: number;
  width: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * ExecuteResult is the object returned by the execute_dist function.
 */
export interface ExecuteResult {
  graphData: GraphData;
  distributionTable: { [key: string]: number };
}

/*
update関数のサンプルコード
function update(transactions, nodeMap, edgeMap) {
  transactions.forEach(function(tx) {
    const senderNode = nodeMap.get(tx.sender);
    const receiverNode = nodeMap.get(tx.receiver);
    if(senderNode) { senderNode.size += parseInt(tx.amount, 10); }
    if(receiverNode) { receiverNode.size += parseInt(tx.amount, 10); }
    const edgeKey = `${senderNode.id}-${receiverNode.id}`;
    const edge = edgeMap.get(edgeKey);
    if(edge) { edge.width += parseInt(tx.amount, 10); }
  });
}
*/

export function executeDist(
  transactions: Transaction[],
  generated: string,
  totalBudget: number
): ExecuteResult[] {
  // =================================================================
  const nodeMap: Map<string, GraphNode> = new Map();
  const edgeMap: Map<string, GraphEdge> = new Map();
  let nextNodeId = 1;

  console.log("transactions", transactions);
  // ノードとエッジを作成する
  for (const tx of transactions) {
    if (!nodeMap.has(tx.sender)) {
      nodeMap.set(tx.sender, {
        id: nextNodeId,
        label: abbreviateAddress(tx.sender),
        title: `Node-${nextNodeId}`,
        size: 0, // 初期サイズは0
      });
      nextNodeId++;
    }
    if (!nodeMap.has(tx.receiver)) {
      nodeMap.set(tx.receiver, {
        id: nextNodeId,
        label: abbreviateAddress(tx.receiver),
        title: `Node-${nextNodeId}`,
        size: 0,
      });
      nextNodeId++;
    }
    const senderNode = nodeMap.get(tx.sender);
    const receiverNode = nodeMap.get(tx.receiver);
    if (senderNode && receiverNode) {
      const edgeKey = `${senderNode.id}-${receiverNode.id}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          from: senderNode.id,
          to: receiverNode.id,
          width: 0,
        });
      }
    }
  }
  // =================================================================

  // Parse the LLM-generated output.
  const updateObj: { function: string; description: string } =
    JSON.parse(generated);

  // Define a standard update function so that "update" is defined.
  const updateDefinition = `
function update(transactions, nodeMap, edgeMap) {
  transactions.forEach(function(tx) {
    const senderNode = nodeMap.get(tx.sender);
    const receiverNode = nodeMap.get(tx.receiver);
    if (senderNode) { 
      senderNode.size = (senderNode.size || 0) + parseInt(tx.amount, 10); 
    }
    if (receiverNode) { 
      receiverNode.size = (receiverNode.size || 0) + parseInt(tx.amount, 10); 
    }
    if (senderNode && receiverNode) {
      const edgeKey = \`\${senderNode.id}-\${receiverNode.id}\`;
      const edge = edgeMap.get(edgeKey);
      if (edge) { 
        edge.width += parseInt(tx.amount, 10); 
      }
    }
  });
}
`;

  // Define a helper function to create a distribution table from nodeMap.
  const helperCode = `
function createDistributionTable(nodeMap) {
  const table = {};
  nodeMap.forEach(function(node) {
    table[node.label] = node.size || 0;
  });
  return table;
}
`;

  // Combine the update definition, helper code, and the LLM-generated code.
  // We assume that updateObj.function is the LLM-generated update code.
  const fullFunctionCode =
    updateDefinition +
    "\n" +
    helperCode +
    "\n" +
    updateObj.function +
    "\n update(transactions, nodeMap, edgeMap); \n return createDistributionTable(nodeMap);";

  let rawDistributionTable: { [key: string]: number } = {};
  try {
    const dynamicFunction = new Function(
      "transactions",
      "nodeMap",
      "edgeMap",
      fullFunctionCode
    );
    rawDistributionTable = dynamicFunction(transactions, nodeMap, edgeMap);
  } catch (error) {
    console.error(
      "Error executing dynamic function:",
      error,
      "\nFunction code:\n",
      fullFunctionCode
    );
  }

  // Scale the raw distribution table so that the sum equals totalBudget.
  const totalWeight = Object.values(rawDistributionTable).reduce(
    (acc, val) => acc + val,
    0
  );
  const scaledTable: { [key: string]: number } = {};
  for (const key in rawDistributionTable) {
    scaledTable[key] =
      totalWeight > 0
        ? (rawDistributionTable[key] / totalWeight) * totalBudget
        : 0;
  }

  return [
    {
      graphData: {
        nodes: Array.from(nodeMap.values()),
        edges: Array.from(edgeMap.values()),
      },
      distributionTable: scaledTable,
    },
  ];
}

interface Transaction {
  sender: string;
  receiver: string;
  amount: number;
  tokenId: string;
  roleName: string;
  roleDescription: string;
  roleAssignee: string;
}

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

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// LLMに参考にさせる関数のts版
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function update(
  transactions: Transaction[],
  nodeMap: Map<string, GraphNode>,
  edgeMap: Map<string, GraphEdge>
) {
  transactions.forEach(function (tx) {
    const senderNode = nodeMap.get(tx.sender)!;
    const receiverNode = nodeMap.get(tx.receiver)!;

    const edgeKey = `${senderNode.id}-${receiverNode.id}`;
    const edge = edgeMap.get(edgeKey)!;

    edge.width += 1;
  });
}
// 実際に読ませるjs
/*
function update(transactions, nodeMap, edgeMap) {
  transactions.forEach(function (tx) {
    const senderNode = nodeMap.get(tx.sender);
    const receiverNode = nodeMap.get(tx.receiver);

    const edgeKey = `${senderNode.id}-${receiverNode.id}`;
    const edge = edgeMap.get(edgeKey);

    edge.width += 1;
  });
}
*/

export function execute(
  transactions: Transaction[],
  generated: string
): GraphData[] {
  // =================================================================
  const nodeMap: Map<string, GraphNode> = new Map();
  const edgeMap: Map<string, GraphEdge> = new Map();
  let nextNodeId = 1;

  // トランザクションを処理してノードとエッジを作成
  for (const tx of transactions) {
    // ノードの処理
    if (!nodeMap.has(tx.sender)) {
      const newNode: GraphNode = {
        id: nextNodeId,
        label: tx.sender,
        title: `Node-${nextNodeId}`
      };
      nodeMap.set(tx.sender, newNode);
      nextNodeId++;
    }
    if (!nodeMap.has(tx.receiver)) {
      const newNode: GraphNode = {
        id: nextNodeId,
        label: tx.receiver,
        title: `Node-${nextNodeId}`
      };
      nodeMap.set(tx.receiver, newNode);
      nextNodeId++;
    }

    // エッジの処理
    const senderNode = nodeMap.get(tx.sender);
    const receiverNode = nodeMap.get(tx.receiver);
    if (senderNode && receiverNode) {
      const edgeKey = `${senderNode.id}-${receiverNode.id}`;

      if (!edgeMap.has(edgeKey)) {
        const newEdge: GraphEdge = {
          from: senderNode.id,
          to: receiverNode.id,
          width: 0
        };
        edgeMap.set(edgeKey, newEdge);
      }
    }
  }
  // =================================================================

  // LLMからの出力をそのままもらってparse
  const update: { function: string, description: string } = JSON.parse(generated);

  // ここで `update` 関数の定義と実行
  const updateFunction = new Function('transactions', 'nodeMap', 'edgeMap', `${update.function} update(transactions, nodeMap, edgeMap);`);
  updateFunction(transactions, nodeMap, edgeMap);

  return [{
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values())
  }];
}

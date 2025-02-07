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
  size: number;
}

interface GraphEdge {
  from: GraphNode["id"];
  to: GraphNode["id"];
  width: number;
}

interface GraphData {
  resultId: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// LLMに参考にさせる関数のts版
export function update(
  transactions: Transaction[],
  nodeMap: { [key: string]: GraphNode },
  edgeMap: { [key: string]: GraphEdge }
) {
  transactions.forEach((tx) => {
    const senderNode = nodeMap[tx.sender];
    const receiverNode = nodeMap[tx.receiver];

    // nodeのsizeの更新
    senderNode.size += 1;
    receiverNode.size += 1;

    const edgeKey = `${senderNode.id}-${receiverNode.id}`;
    const edge = edgeMap[edgeKey];

    // edgeのwidthの更新
    edge.width += 1;
  });
}
// 実際に読ませるjs
/*
function update(transactions, nodeMap, edgeMap) {
  transactions.forEach(function(tx) {
    const senderNode = nodeMap[tx.sender];
    const receiverNode = nodeMap[tx.receiver];

    // nodeのsizeの更新
    senderNode.size += 1;
    receiverNode.size += 1;

    const edgeKey = `${senderNode.id}-${receiverNode.id}`;
    const edge = edgeMap[edgeKey];

    // edgeのwidthの更新
    edge.width += 1;
  });
}
*/

export async function execute(
  transactions: Transaction[],
  generated: string
): Promise<GraphData[]> {
  // LLMからの出力をそのままもらってparse
  const updates: { function: string, description: string }[] = JSON.parse(generated);

  // 準備
  const result: GraphData[] = [];
  let resultId = 0;

  for (const update of updates) {
    // =================================================================
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeMap: { [key: string]: GraphNode } = {};
    const edgeMap: { [key: string]: GraphEdge } = {};
    let nextNodeId = 1;

    // トランザクションを処理してノードとエッジを作成
    for (const tx of transactions) {
      // ノードの処理
      if (!nodeMap[tx.sender]) {
        const newNode: GraphNode = {
          id: nextNodeId,
          label: `User-${nextNodeId}`,
          title: `Address: ${tx.sender}`,
          size: 0
        };
        nodeMap[tx.sender] = newNode;
        nodes.push(newNode);
        nextNodeId++;
      }
      if (!nodeMap[tx.receiver]) {
        const newNode: GraphNode = {
          id: nextNodeId,
          label: `User-${nextNodeId}`,
          title: `Address: ${tx.receiver}`,
          size: 0
        };
        nodeMap[tx.receiver] = newNode;
        nodes.push(newNode);
        nextNodeId++;
      }

      // エッジの処理
      const senderNode = nodeMap[tx.sender];
      const receiverNode = nodeMap[tx.receiver];
      if (senderNode && receiverNode) {
        const edgeKey = `${senderNode.id}-${receiverNode.id}`;

        if (!edgeMap[edgeKey]) {
          const newEdge: GraphEdge = {
            from: senderNode.id,
            to: receiverNode.id,
            width: 0
          };
          edgeMap[edgeKey] = newEdge;
          edges.push(newEdge);
        }
      }
    }
    // =================================================================

    // ここで `update` 関数の定義と実行
    const updateFunction = new Function('transactions', 'nodeMap', 'edgeMap', `${update.function} update(transactions, nodeMap, edgeMap);`);
    updateFunction(transactions, nodeMap, edgeMap);

    result.push({
      resultId: resultId++,
      nodes: Object.values(nodeMap),
      edges: Object.values(edgeMap)
    });
  }

  return result;
}

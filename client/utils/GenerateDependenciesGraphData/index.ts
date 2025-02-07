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
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// eval()で取得する関数の型定義
declare function update(transactions: Transaction[], nodeMap: Map<string, GraphNode>, edgeMap: Map<string, GraphEdge>): void;

export default async function execute(
  transactions: Transaction[],
  generated: { function: string, description: string }[]
): Promise<GraphData[]> {
  // 準備
  const result: GraphData[] = [];
  let resultId = 0;

  for (const gen of generated) {
    // ここで関数 `updateEdgeWidths` が定義される
    eval(gen.function);

    // 以下 `updateEdgeWidths` を使うまでの処理
    // =================================================================
    const nodeMap = new Map<string, GraphNode>();
    const edgeMap = new Map<string, GraphEdge>();
    let nextNodeId = 1;

    // トランザクションを処理してノードとエッジを作成
    for (const tx of transactions) {
      // ノードの処理
      if (!nodeMap.has(tx.sender)) {
        nodeMap.set(tx.sender, {
          id: nextNodeId,
          label: `User-${nextNodeId}`,
          title: `Address: ${tx.sender}`,
          size: 0
        });
        nextNodeId++;
      }
      if (!nodeMap.has(tx.receiver)) {
        nodeMap.set(tx.receiver, {
          id: nextNodeId,
          label: `User-${nextNodeId}`,
          title: `Address: ${tx.receiver}`,
          size: 0
        });
        nextNodeId++;
      }

      // エッジの処理
      const senderNode = nodeMap.get(tx.sender);
      const receiverNode = nodeMap.get(tx.receiver);
      if (senderNode && receiverNode) {
        const edgeKey = `${senderNode.id}-${receiverNode.id}`;

        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, {
            from: senderNode.id,
            to: receiverNode.id,
            width: 0
          });
        }
      }
    }
    // =================================================================

    // ここで `updateEdgeWidths` を使ってwidthを更新
    update(transactions, nodeMap, edgeMap);

    result.push({
      resultId: resultId++,
      description: gen.description,
      nodes: Array.from(nodeMap.values()),
      edges: Array.from(edgeMap.values())
    });
  }

  return result;
}

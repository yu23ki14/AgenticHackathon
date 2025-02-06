interface Transaction {
  sender: string;
  receiver: string;
  amount: number;
  tokenId: string;
}

interface GraphNode {
  id: number;
  label: string;
  title: string;
}

interface GraphEdge {
  from: GraphNode;
  to: GraphNode;
  width: number;
}

interface GraphData {
  resultId: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function GenerateDependenciesGraphData(transactions: Transaction[]): Promise<GraphData[]> {
  // ここにAPIからデータを取得する処理を書く（この型で返ってくるはず）
  const generated: { function: string, description: string }[] = await (await fetch("path/to/api")).json();

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
          label: `User-${nextNodeId}`,  // もしくは実際のユーザー名
          title: `Address: ${tx.sender}`
        });
        nextNodeId++;
      }
      if (!nodeMap.has(tx.receiver)) {
        nodeMap.set(tx.receiver, {
          id: nextNodeId,
          label: `User-${nextNodeId}`,  // もしくは実際のユーザー名
          title: `Address: ${tx.receiver}`
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
            from: senderNode,
            to: receiverNode,
            width: 0
          });
        }
      }
    }
    // =================================================================

    // ここで `updateEdgeWidths` を使ってwidthを更新
    updateEdgeWidths();

    result.push({
      resultId: resultId++,
      nodes: Array.from(nodeMap.values()),
      edges: Array.from(edgeMap.values())
    });
  }

  return result;
}

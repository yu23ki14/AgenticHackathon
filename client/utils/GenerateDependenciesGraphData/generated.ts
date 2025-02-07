/**
 * prompt.mdを4oに投げて返ってきたもの
 */
export const generated = [
  {
    "function": "function update(transactions, nodeMap, edgeMap) {\n  transactions.forEach(function (tx) {\n    const senderNode = nodeMap[tx.sender];\n    const receiverNode = nodeMap[tx.receiver];\n\n    // nodeのsizeの更新\n    senderNode.size += tx.amount / 1000;\n    receiverNode.size += tx.amount / 1000;\n\n    const edgeKey = `${senderNode.id}-${receiverNode.id}`;\n    const edge = edgeMap[edgeKey];\n\n    // edgeのwidthの更新\n    edge.width += tx.amount / 1000;\n  });\n}",
    "description": "この関数は、各トランザクションにおける送信者と受信者の評価を、送金額を基に`node.size`に反映させ、また、関係性評価を`edge.width`に反映させます。送金額を1000で割った値で評価を加算することにより、役割の重要度と関係性の強さを数値化します。"
  },
  {
    "function": "function update(transactions, nodeMap, edgeMap) {\n  transactions.forEach(function (tx) {\n    const senderNode = nodeMap[tx.sender];\n    const receiverNode = nodeMap[tx.receiver];\n\n    // nodeのsizeの更新\n    if (tx.tokenId === '0xABCD') {\n      senderNode.size += 1;\n      receiverNode.size += 1;\n    }\n\n    const edgeKey = `${senderNode.id}-${receiverNode.id}`;\n    const edge = edgeMap[edgeKey];\n\n    // edgeのwidthの更新\n    edge.width += 1;\n  });\n}",
    "description": "この関数は、特定のトークン（`0xABCD`）の取引に対して、送信者と受信者の評価を加算する仕組みです。これにより、特定の役割（掃除当番など）が重要である場合、関連するメンバーが評価されます。"
  },
  {
    "function": "function update(transactions, nodeMap, edgeMap) {\n  transactions.forEach(function (tx) {\n    const senderNode = nodeMap[tx.sender];\n    const receiverNode = nodeMap[tx.receiver];\n\n    // nodeのsizeの更新\n    senderNode.size -= tx.amount / 1000;\n    receiverNode.size += tx.amount / 1000;\n\n    const edgeKey = `${senderNode.id}-${receiverNode.id}`;\n    const edge = edgeMap[edgeKey];\n\n    // edgeのwidthの更新\n    edge.width -= tx.amount / 1000;\n  });\n}",
    "description": "この関数は、役割を果たせなかった場合、送金者の評価を減少させ、受取人の評価を増加させます。また、送金関係の強度を減少させることで、役割の不履行が反映されます。"
  }
];

/**
 * prompt_en.mdを4oに投げて返ってきたもの
 */
export const generated = [
  {
    "function": "function update(transactions, nodeMap, edgeMap) { transactions.forEach(tx => { const senderNode = nodeMap.get(tx.sender); const receiverNode = nodeMap.get(tx.receiver); if (senderNode && receiverNode) { const edgeKey = `${senderNode.id}-${receiverNode.id}`; const edge = edgeMap.get(edgeKey) || { from: senderNode.id, to: receiverNode.id, width: 0 }; edge.width += 1; edgeMap.set(edgeKey, edge); } }); }",
    "description": "This function assigns an equal weight of 1 to every transaction. The edge width is incremented each time a transaction occurs, emphasizing the frequency of interactions between community members without considering transaction amounts or roles."
  },
  {
    "function": "function update(transactions, nodeMap, edgeMap) { transactions.forEach(tx => { const senderNode = nodeMap.get(tx.sender); const receiverNode = nodeMap.get(tx.receiver); if (senderNode && receiverNode) { const edgeKey = `${senderNode.id}-${receiverNode.id}`; const edge = edgeMap.get(edgeKey) || { from: senderNode.id, to: receiverNode.id, width: 0 }; edge.width += tx.amount / 10000; edgeMap.set(edgeKey, edge); } }); }",
    "description": "This function assigns a weight proportional to the transaction amount. The edge width is increased by the fraction of the total available role tokens (10,000) sent in each transaction, highlighting the significance of larger transactions."
  },
  {
    "function": "function update(transactions, nodeMap, edgeMap) { const roleTransactionCounts = {}; transactions.forEach(tx => { roleTransactionCounts[tx.tokenId] = (roleTransactionCounts[tx.tokenId] || 0) + 1; }); transactions.forEach(tx => { const senderNode = nodeMap.get(tx.sender); const receiverNode = nodeMap.get(tx.receiver); if (senderNode && receiverNode) { const edgeKey = `${senderNode.id}-${receiverNode.id}`; const edge = edgeMap.get(edgeKey) || { from: senderNode.id, to: receiverNode.id, width: 0 }; const rarityFactor = 1 / (roleTransactionCounts[tx.tokenId] || 1); edge.width += rarityFactor * tx.amount / 10000; edgeMap.set(edgeKey, edge); } }); }",
    "description": "This function adjusts the weight based on both transaction amount and token rarity. Transactions involving less frequently exchanged roles have a higher impact, reflecting the importance of rare role assignments."
  }
];

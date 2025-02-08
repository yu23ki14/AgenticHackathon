// client/data/dependencies/patterns.ts
import { PatternData } from "@/types/dependenciesData";

export const defaultPatternDataArr: PatternData[] = [
  {
    resultId: 1,
    name: "Too Many Yawns",
    description: "Weighted distribution with helper ratio 4:6",
    function: `function update(transactions, nodeMap, edgeMap) {
  transactions.forEach(function (tx) {
    const senderNode = nodeMap[tx.sender];
    const receiverNode = nodeMap[tx.receiver];
    // Update node sizes based on transaction amount
    senderNode.size += tx.amount / 1000;
    receiverNode.size += tx.amount / 1000;
    const edgeKey = \`\${senderNode.id}-\${receiverNode.id}\`;
    const edge = edgeMap[edgeKey];
    // Update edge widths based on transaction amount
    edge.width += tx.amount / 1000;
  });
}`,
    reason:
      "Based on the dependency graph, Yawn-A has a high contribution score while Yawn-B and Yawn-C have moderate scores. The helper ratio of 4:6 was inferred to balance high and low contributors."
  },
  {
    resultId: 2,
    name: "Too Many Yawns - Variation 2",
    description: "Alternate weighted distribution with slight adjustments",
    function: `function update(transactions, nodeMap, edgeMap) {
  transactions.forEach(function (tx) {
    const senderNode = nodeMap[tx.sender];
    const receiverNode = nodeMap[tx.receiver];
    // Slight adjustments for a more balanced distribution
    senderNode.size += tx.amount / 900;
    receiverNode.size += tx.amount / 1100;
    const edgeKey = \`\${senderNode.id}-\${receiverNode.id}\`;
    const edge = edgeMap[edgeKey];
    // Update edge widths based on transaction amount
    edge.width += tx.amount / 1000;
  });
}`,
    reason:
      "This variation slightly adjusts the allocations to favor roles with higher interaction, based on a different weighting of the helper relationships."
  },
  {
    resultId: 3,
    name: "Too Many Yawns - Variation 3",
    description: "Emphasized distribution for the top contributor",
    function: `function update(transactions, nodeMap, edgeMap) {
  transactions.forEach(function (tx) {
    const senderNode = nodeMap[tx.sender];
    const receiverNode = nodeMap[tx.receiver];
    // Emphasize the top contributor by increasing sender updates
    senderNode.size += tx.amount / 800;
    receiverNode.size += tx.amount / 1200;
    const edgeKey = \`\${senderNode.id}-\${receiverNode.id}\`;
    const edge = edgeMap[edgeKey];
    // Update edge widths based on transaction amount
    edge.width += tx.amount / 1000;
  });
}`,
    reason:
      "This pattern prioritizes Yawn-A more heavily due to its dominant role in the graph. Adjustments in helper ratios ensure fairness among the remaining nodes."
  }
];

/**
 * prompt.mdを4oに投げて返ってきたもの
 */
export const generated = [
  {
    "function": "function update(transactions, nodeMap, edgeMap) {\n      const roleFrequency = new Map();\n      transactions.forEach((tx) => {\n        roleFrequency.set(tx.roleName, (roleFrequency.get(tx.roleName) || 0) + 1);\n      });\n      transactions.forEach((tx) => {\n        const senderNode = nodeMap.get(tx.sender);\n        const receiverNode = nodeMap.get(tx.receiver);\n        const rarityFactor = 1 / (roleFrequency.get(tx.roleName) || 1);\n        senderNode.size += rarityFactor * 5;\n        receiverNode.size += rarityFactor * 10;\n        const edgeKey = `${senderNode.id}-${receiverNode.id}`;\n        const edge = edgeMap.get(edgeKey) || { width: 0 };\n        edge.width += rarityFactor * 2;\n        edgeMap.set(edgeKey, edge);\n      });\n    }",
    "description": "この関数は、トークンが送られる頻度が低い役割ほど、その受け取った人の評価 (size) を高くする評価方法です。希少な役割を引き受けることが価値が高いとみなされます。"
  },
  {
    "function": "function update(transactions, nodeMap, edgeMap) {\n      const reversedTransactions = new Map();\n      transactions.forEach((tx) => {\n        const key = `${tx.receiver}-${tx.sender}-${tx.tokenId}`;\n        if (reversedTransactions.has(key)) {\n          const senderNode = nodeMap.get(tx.sender);\n          senderNode.size -= 10;\n        } else {\n          reversedTransactions.set(key, tx);\n        }\n        const senderNode = nodeMap.get(tx.sender);\n        const receiverNode = nodeMap.get(tx.receiver);\n        senderNode.size += 1;\n        receiverNode.size += 2;\n        const edgeKey = `${senderNode.id}-${receiverNode.id}`;\n        const edge = edgeMap.get(edgeKey) || { width: 0 };\n        edge.width += 1;\n        edgeMap.set(edgeKey, edge);\n      });\n    }",
    "description": "この関数は、送り返されたトークンが発生した場合に、その送り返された人の評価 (size) を下げる評価方法です。役割を果たせなかった場合、評価が下がるようになっています。"
  },
  {
    "function": "function update(transactions, nodeMap, edgeMap) {\n      const roleTotal = new Map();\n      transactions.forEach((tx) => {\n        roleTotal.set(tx.roleName, (roleTotal.get(tx.roleName) || 0) + tx.amount);\n      });\n      transactions.forEach((tx) => {\n        const senderNode = nodeMap.get(tx.sender);\n        const receiverNode = nodeMap.get(tx.receiver);\n        const roleWeight = (tx.amount / (roleTotal.get(tx.roleName) || 1)) * 10;\n        senderNode.size += roleWeight;\n        receiverNode.size += roleWeight * 2;\n        const edgeKey = `${senderNode.id}-${receiverNode.id}`;\n        const edge = edgeMap.get(edgeKey) || { width: 0 };\n        edge.width += roleWeight;\n        edgeMap.set(edgeKey, edge);\n      });\n    }",
    "description": "この関数は、受け取ったトークンの総量に基づいて評価する方法です。より多くのトークンを受け取る人ほど評価が高くなり、関係性 (edge.width) も強化されます。"
  }
];

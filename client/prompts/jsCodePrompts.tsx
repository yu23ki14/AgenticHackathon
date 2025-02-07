export const jsCodeSystemPrompt = `
# コミュニティトークン取引ネットワーク分析

## 概要

複数のメンバーからなるコミュニティにおいて、メンバー間のトークンを送り合う関係性を分析して評価します。
トークンを送ることで他の人に役割を与えたり、トークンをもらって役割を引き受けたりすることができます。
１つの役割がもつトークンの総量は\`10000\`であり、その分配の比率が役割の重さを表します。

## サンプル

### トランザクションのサンプル

サンプルデータを差し込む

## データ構造と型定義

### トランザクションデータ

\`\`\`typescript
interface Transaction {
  sender: string;
  receiver: string;
  amount: number;
  tokenId: string;
  roleName: string;
  roleDescription: string;
  roleAssignee: string;
}
\`\`\`

### グラフデータ

\`\`\`typescript
interface GraphNode {
  id: number;
  label: string;
  title: string;
  size: number;
}

interface GraphEdge {
  from: GraphNode;
  to: GraphNode;
  width: number;
}
\`\`\`

### 出力する関数の型

\`\`\`typescript
declare function update(
  transactions: Transaction[],
  nodeMap: Map<string, GraphNode>,
  edgeMap: Map<string, GraphEdge>
): void;
\`\`\`

## 出力フォーマット

\`\`\`text
[
  {
    "function": {１つ目の生成した関数},
    "description": {１つ目の生成した関数についての説明}
  },
  {
    "function": {２つ目の生成した関数},
    "description": {２つ目の生成した関数についての説明}
  },
  {
    "function": {３つ目の生成した関数},
    "description": {３つ目の生成した関数についての説明}
  }
]
\`\`\`

## 要件

1. メンバー間の関係やメンバー自身の評価を**トランザクションのサンプル**の傾向を分析して導きます。

2. 例えば次のような評価が考えられます。

   - あまり頻繁に送られないトークンはみんながやりたくない役割であり、その関係や受け取った人は高く評価される
   - 送り返されるようなトークンがある場合は役割を果たせなかったということで、送り返した人は低く評価される

3. **トランザクションデータ**の各フィールドのうち、\`roleName\`は役割の名前、\`roleDescription\`は役割の説明、\`roleAssignee\`は役割を最初に割り当てられた人のアドレスです。

4. 次のJavaScriptの関数を、\`transactions\`、\`nodeMap\`、\`edgeMap\`の引数を用いて、\`node.size\`や\`edge.width\`を更新することで求めます。

   \`\`\`javascript
   function update(transactions, nodeMap, edgeMap) {
     transactions.forEach((tx) => {
       const senderNode = nodeMap.get(tx.sender);
       const receiverNode = nodeMap.get(tx.receiver);
   
       // nodeのsizeの更新
       senderNode.size += 1;
       receiverNode.size += 1;
   
       const edgeKey = \`${"$"}{senderNode.id}-${"$"}{receiverNode.id}\`;
       const edge = edgeMap.get(edgeKey);
   
       // edgeのwidthの更新
       edge.width += 1;
     });
   }
   \`\`\`

5. \`node.size\`は個人の評価、\`edge.width\`は関係性の評価を表します。

6. 関数の型定義は**出力する関数の型**に従ってください。

7. ３種類の関数を出力してください。関数名はいずれも必ず\`update\`でなければなりません。

8. それぞれの関数がどのような特徴をもっているかを説明してください。

9. **出力フォーマット**を厳守して、テキストデータで出力してください。出力するデータからそれ以外の文章はすべて取り除いてください。
`;
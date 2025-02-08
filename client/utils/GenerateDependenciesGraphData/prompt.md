# コミュニティトークン取引ネットワーク分析

## 概要

- 複数のメンバーで構成されるコミュニティにおいて、メンバー間で役割に紐づいたトークンを送り合う状況を想定します。
- トークンを送ることで他の人に役割を与えたり、トークンを受け取って役割を引き受けたりすることができます。
- 1つの役割に紐づくトークンの総量は`10,000`であり、その分配の比率が役割の割り当ての重みづけになります。
- 取引の傾向を分析し、それを反映する方法を考えてください。

## トランザクションのサンプルデータ

./transactions.tsの値を入れて実験しました

## データ構造と型定義

### トランザクションデータ

```typescript
interface Transaction {
  sender: string;
  receiver: string;
  amount: number;
  tokenId: string;
  roleName: string;
  roleDescription: string;
  roleAssignee: string;
}
```

### グラフデータ

```typescript
interface GrphNode {
  id: number;
  label: string;
  title: string;
}

interface GraphEdge {
  from: GraphNode["id"];
  to: GraphNode["id"];
  width: number;
}
```

### 出力する関数の型

```typescript
declare function update(
  transactions: Transaction[],
  nodeMap: Map<string, GraphNode>,
  edgeMap: Map<string, GraphEdge>
): void;
```

## タスク

1. **トランザクションのサンプルデータ**の傾向を分析し、評価してください。

   - このデータはこれまでの取引のデータをランダムに抽出したものです。
   - 各フィールドは次のような意味をもちます：
     - `sender`：トークンの送り手のアドレス
     - `receiver`：トークンの受け取り手のアドレス
     - `amount`：トークンの量（`10,000`以下）
     - `tokenId`：トークンに一意のID
     - `roleName`：役割の名前
     - `roleDescription`：役割の説明
     - `roleAssignee`：役割を最初に割り当てられた人のアドレス（`sender`になることが多い）
   - 例えば次のような傾向の分析と評価が考えられます：
     - トランザクションの頻度がトークンごとにばらつく傾向にあり、取引回数の少ないトークンについては特定の人にしかできない重要な役割と判断できるので、その関係性は高く評価される。
     - トランザクションの頻度が多く、`amount`も詳しく指定される傾向にあり、トークンの量を繊細に決定して役割を分担していると判断できるので、`amount`の差分を評価に直結させる。

2. データを分析して得た評価方法をJavaScriptの関数として実装してください。

   - 実際のトランザクションのデータはすでにフォーマットされ、依存グラフとして図示できるようなデータ構造で保存されています。
   - 依存グラフとは、ノード（点）とエッジ（線）で構成されるグラフ構造であり、ノードはコミュニティーのメンバーを表し、エッジはメンバー間の関係性を表します。
   - 引数は`transactions`、`nodeMap`、`edgeMap`です：
     - `transactions`：型は`Transaction[]`であり、トランザクションの全データが入ります。
     - `nodeMap`：型は`Map<string, GraphNode>`であり、ノードのデータが入ります。
     - `edgeMap`：型は`Map<string, GraphEdge>`であり、エッジのデータが入ります。`width`フィールドはそのエッジの評価値であり、`0`に設定されています。
   - それぞれの引数を用いて`GraphEdge`の`width`フィールドを更新し、評価方法を実装する関数を設計してください。
   - 最もシンプルな関数の例は次のようになります：

     ```javascript
     function update(transactions, nodeMap, edgeMap) {
       transactions.forEach(function (tx) {
         const senderNode = nodeMap.get(tx.sender);
         const receiverNode = nodeMap.get(tx.receiver);

         const edgeKey = `${senderNode.id}-${receiverNode.id}`;
         const edge = edgeMap.get(edgeKey);

         edge.width += 1;
       });
     }
     ```

   - 出力する関数の型に従って３種類の関数を設計してください。
   - 与えたデータはどのように評価され、それぞれの関数がどのようなことを意図して設計されているかを詳しく説明してください。

## 出力の制約

- 関数名はいずれも必ず`update`でなければならず、関数を説明するような文言は入れてはなりません。
- 次に示すフォーマットに従って出力してください。それ以外の文章はすべて取り除いてください。

  ```text
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
  ```

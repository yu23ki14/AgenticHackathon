# コミュニティトークン取引ネットワーク分析

## 概要

複数の構成員からなるコミュニティにおいて、メンバー間のトークン取引に基づく関係性の強さを分析します。

## サンプル

### **トランザクションのサンプル**

```json
./sample.jsonの値を入れて実験しました
o4での実験の結果はこちら -> https://chatgpt.com/share/67a4c37b-d3c0-8001-ad84-1e01288237b5
```

## データ構造

### **トランザクションデータ**

```typescript
interface Transaction {
  sample_transaction: {
    sender: string;
    receiver: string;
    amount: number;
    tokenId: string;
  }[];
  total_amount: number;
  total_transaction_number: number;
  total_users: number;
}
```

### **グラフデータ**

```typescript
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
```

## **出力フォーマット**

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

## 要件

1. メンバー間の関係性の強さは**トランザクションのサンプル**の傾向を分析し、次の関数の`edge.width`を、`transactions`と`graph`の引数を用いて更新することで求めます。

   ```javascript
   function updateEdgeWidths(transactions, graph) {
     for (var _i = 0, _a = graph.edges; _i < _a.length; _i++) {
       var edge = _a[_i];
       edge.width = 0;
     }
   }
   ```

2. 引数の`transactions`の型は`Transaction[]`、`graph`の型は`GraphData`です。

3. 3種類の関数を出力してください。関数名は必ず`updateEdgeWidths`でなければなりません。

4. それぞれの関数がどのような特徴をもっているかを説明してください。

5. **出力フォーマット**を厳守して、テキストデータで出力してください。それ以外の文章は必ずすべて取り除いてください。

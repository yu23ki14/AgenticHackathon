import { transactions } from "./transactions";
import { generated } from "./generated";
import { execute } from "./execute";
import { test } from 'vitest';

test("execute", async () => {
  const result = await execute(transactions, JSON.stringify(generated));

  // 例として、1つ目の関数の実行結果のedgesを出力
  console.log(result[0].edges);
});

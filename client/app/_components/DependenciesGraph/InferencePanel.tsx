// client/app/_components/DependenciesGraph/InferencePanel.tsx
"use client";

import * as React from "react";
import { ReactElement, useState } from "react";
import { PatternData, GraphData } from "@/types/dependenciesData";
import { useDependenciesData } from "@/hooks/useDependenciesData";

export default function InferencePanel(): ReactElement {
  const [totalBudget, setTotalBudget] = useState<number>(100); // Example: 100 USDC
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { graphDataArr } = useDependenciesData();

  // Choose the active dependency graph. For this example, we'll use the first graph.
  const activeGraph: GraphData =
    graphDataArr.length > 0 ? graphDataArr[0] : { resultId: 1, nodes: [], edges: [] };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/llmDistribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalBudget, activeGraph }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("API Error:", data.error);
        setLoading(false);
        return;
      }
      setPatterns(data.result);
    } catch (error) {
      console.error("Error during inference:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-2">Distribution Reward</h2>
      {/* Total Budget Input (without a label) */}
      <div className="mb-2">
        <input
          type="number"
          className="w-full p-2 border rounded"
          value={totalBudget}
          onChange={(e) => setTotalBudget(Number(e.target.value))}
          placeholder="Enter total budget"
        />
      </div>
      {/* Button to trigger inference */}
      <button
        className="p-2 bg-blue-500 text-white rounded w-full"
        onClick={handleCalculate}
        disabled={loading}
      >
        {loading ? "Calculating..." : "Calculate Distribution"}
      </button>
      {/* Display the resulting pattern list */}
      {patterns.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Distribution Patterns</h3>
          {patterns.map((pattern) => (
            <div key={pattern.resultId} className="mb-4 border p-2 rounded">
              <h4 className="font-semibold">{pattern.name}</h4>
              <p className="mb-2">{pattern.description}</p>
              <pre className="bg-gray-100 p-2 rounded mb-2">
                {pattern.JavaScriptFunction}
              </pre>
              <p className="italic text-gray-600">Reason: {pattern.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

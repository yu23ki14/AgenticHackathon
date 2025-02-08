// client/app/_components/DependenciesGraph/InferencePanel.tsx
"use client";

// import * as React from "react";
import { ReactElement, useState, useEffect } from "react";
import { PatternData, GraphData } from "@/types/dependenciesData";
import { useDependenciesData } from "@/hooks/useDependenciesData";
import { defaultPatternDataArr } from "@/data/dependencies/patterns";
import { experimental_useObject as useObject } from 'ai/react';
import { distributionJsCodeSchema } from "@/types/schemas/distributions";

export default function InferencePanel(): ReactElement {
  const [totalBudget, setTotalBudget] = useState<number>(100); // Example: 100 USDC
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { graphDataArr } = useDependenciesData();
  const [activeGraph, setActiveGraph] = useState<GraphData>(
    graphDataArr.length > 0
      ? graphDataArr[0]
      : { resultId: 1, nodes: [], edges: [] }
  );
  const { object, submit } = useObject({
    api: '/api/inference',
    schema: distributionJsCodeSchema,
  });

  useEffect(() => {
    if (object?.result) {
      const completePatterns = object?.result.map((partialPattern, index) => {

        const resultId = activeGraph.resultId;
        const name = `Pattern ${index + 1}`;
        const description = partialPattern?.description ?? "No description provided.";
        const JavaScriptFunction = partialPattern?.function ?? "";
        const reason = partialPattern?.reason ?? "No reason provided.";

        return {
          resultId,
          name,
          description,
          JavaScriptFunction,
          reason,
        }
      });
      setPatterns(completePatterns);
    }
  }, [object, activeGraph]);
  

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const middlePrompt =`hi`
      submit(middlePrompt);
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
            <div key={pattern.name} className="mb-4 border p-2 rounded">
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

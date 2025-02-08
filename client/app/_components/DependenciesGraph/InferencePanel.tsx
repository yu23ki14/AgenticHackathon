// client/app/_components/DependenciesGraph/InferencePanel.tsx
"use client";

import { ReactElement, useState, useEffect } from "react";
import { PatternData, GraphData } from "@/types/dependenciesData";
import { useDependenciesData } from "@/hooks/useDependenciesData";
import PatternTabs from "./PatternTabs";
import { experimental_useObject as useObject } from 'ai/react';
import { distributionJsCodeSchema } from "@/types/schemas/distributions";

export default function InferencePanel(): ReactElement {
  const [totalBudget, setTotalBudget] = useState<number>(100); // Example: 100 USDC
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { graphDataArr } = useDependenciesData();
  const [activeGraph] = useState<GraphData>(
    graphDataArr.length > 0 
    ? { ...graphDataArr[0], resultId: graphDataArr[0].resultId ?? 0 }
    : { resultId: 0, nodes: [], edges: [] }
  );

  // Use the active dependency graph; for now, we use the first graph in the array.
  // If resultId is missing, fallback to activeTab index (here, 0).
  // const activeGraph: GraphData = graphDataArr.length > 0 
  //   ? { ...graphDataArr[0], resultId: graphDataArr[0].resultId ?? 0 }
  //   : { resultId: 0, nodes: [], edges: [] };

  // Set up the useObject hook to call our API route at /api/inference.
  const { object, submit } = useObject({
    api: '/api/inference',
    schema: distributionJsCodeSchema,
  });

  // When the API returns a result, map it to our PatternData structure.
  useEffect(() => {
    console.log("object: ", object);
    if (object?.result) {
      const completePatterns: PatternData[] = object.result.map((partialPattern: any, index: number) => ({
        resultId: activeGraph.resultId,
        name: `Pattern ${index + 1}`,
        description: partialPattern.description ?? "No description provided.",
        function: partialPattern.function ?? "",
        reason: partialPattern.reason ?? "No reason provided."
      }));
      setPatterns(completePatterns);
    }
  }, [object, activeGraph]);

  // Handler to trigger the LLM inference.
  const handleCalculate = async () => {
    setLoading(true);
    try {
      // In this example, we send a simple prompt; your API route will combine this with activeGraph.
      const promptText = "Generate distribution patterns based on the provided dependency graph data.";
      await submit(promptText);
    } catch (error) {
      console.error("Error during inference:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-2">Distribution Reward</h2>

      {/* Total Budget Input (no label) */}
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

      {/* Render the pattern tabs if patterns are available */}
      {patterns.length > 0 && <PatternTabs patterns={patterns} />}
    </div>
  );
}

// client/app/_components/DependenciesGraph/InferencePanel.tsx
"use client";

import { ReactElement, useState, useEffect, useRef } from "react";
import { PatternData, GraphData } from "@/types/dependenciesData";
import { useDependenciesData } from "@/hooks/useDependenciesData";
import PatternTabs from "./PatternTabs";
import { experimental_useObject as useObject } from "ai/react";
import { distributionJsCodeSchema } from "@/types/schemas/distributions";

export default function InferencePanel(): ReactElement {
  const [totalBudget, setTotalBudget] = useState<number>(100); // Example: 100 USDC
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { graphDataArr } = useDependenciesData();
  
  const activeGraph: GraphData = graphDataArr.length > 0 
    ? { ...graphDataArr[0], resultId: graphDataArr[0].resultId ?? 0 }
    : { resultId: 0, nodes: [], edges: [] };

  const { object, submit } = useObject({
    api: "/api/inference",
    schema: distributionJsCodeSchema,
  });

  const prevResultRef = useRef<string>("");

  useEffect(() => {
    if (object?.result) {
      const currentResultStr = JSON.stringify(object.result);
      if (prevResultRef.current !== currentResultStr) {
        prevResultRef.current = currentResultStr;
        const completePatterns: PatternData[] = object.result.map((partialPattern: any, index: number) => ({
          resultId: activeGraph.resultId,
          name: `Pattern ${index + 1}`,
          description: partialPattern.description ?? "No description provided.",
          function: partialPattern["function"] ?? "",
          reason: partialPattern.reason ?? "No reason provided.",
        }));
        setPatterns(completePatterns);
      }
    }
  }, [object, activeGraph]);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const middlePrompt = `
Input Data:
Total Budget: ${totalBudget} USDC
Distribution Concept: weighted
Dependency Graph Data:
${JSON.stringify(activeGraph, null, 2)}
`;
      await submit(middlePrompt);
    } catch (error) {
      console.error("Error during inference:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-2">Distribution Reward</h2>
      <div className="mb-2">
        <input
          type="number"
          className="w-full p-2 border rounded"
          value={totalBudget}
          onChange={(e) => setTotalBudget(Number(e.target.value))}
          placeholder="Enter total budget"
        />
      </div>
      <button
        className="p-2 bg-blue-500 text-white rounded w-full"
        onClick={handleCalculate}
        disabled={loading}
      >
        {loading ? "Calculating..." : "Calculate Distribution"}
      </button>
      {patterns.length > 0 && <PatternTabs patterns={patterns} totalBudget={totalBudget} />}
    </div>
  );
}

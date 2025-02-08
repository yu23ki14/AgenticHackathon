// client/app/_components/DependenciesGraph/InferencePanel.tsx
"use client";

import * as React from "react";
import { ReactElement, useState, useEffect } from "react";
import { PatternData, GraphData } from "@/types/dependenciesData";
import { useDependenciesData } from "@/hooks/useDependenciesData";
import PatternTabs from "./PatternTabs";
import { defaultPatternDataArr } from "@/data/dependencies/patterns";

export default function InferencePanel(): ReactElement {
  const [totalBudget, setTotalBudget] = useState<number>(100); // Example: 100 USDC
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { graphDataArr } = useDependenciesData();

  // Choose the active dependency graph. For this example, we'll use the first graph.
  const activeGraph: GraphData =
    graphDataArr.length > 0 ? graphDataArr[0] : { resultId: 1, nodes: [], edges: [] };

    useEffect(() => {
      setPatterns(defaultPatternDataArr);
    }, []);

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
  
        {/* Button to trigger the inference */}
        <button
          className="p-2 bg-blue-500 text-white rounded w-full"
          //onClick={handleCalculate}
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Distribution"}
        </button>
  
        {/* If patterns are returned, render the PatternTabs component */}
        {patterns.length > 0 && <PatternTabs patterns={patterns} />}
      </div>
    );
  }
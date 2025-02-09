// client/app/_components/DependenciesGraph/PatternTabs.tsx
"use client";

import { ReactElement, useState, useEffect } from "react";
import { PatternData } from "@/types/dependenciesData";
import { executeDist, ExecuteResult } from "@/utils/GenerateDependenciesGraphData/execute_dist";
import { transactions } from "@/utils/GenerateDependenciesGraphData/transactions";

interface PatternTabsProps {
  patterns: PatternData[];
  totalBudget: number;
}

export default function PatternTabs({ patterns, totalBudget }: PatternTabsProps): ReactElement {
  const [activePatternIndex, setActivePatternIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"function" | "table">("function");
  const [displayMode, setDisplayMode] = useState<"amount" | "percentage">("amount");
  const [distributionTable, setDistributionTable] = useState<{ [key: string]: number } | null>(null);

  useEffect(() => {
    if (viewMode === "table") {
      computeDistributionTable();
    } else {
      setDistributionTable(null);
    }
  }, [activePatternIndex, viewMode, totalBudget]);

  const computeDistributionTable = () => {
    const pattern = patterns[activePatternIndex];
    // Prepare a JSON string for the execute_dist function.
    const generated = JSON.stringify([{ function: pattern["function"], description: pattern.description }]);
    try {
      const resultArray = executeDist(transactions, generated, totalBudget) as ExecuteResult[];
      if (resultArray.length > 0) {
        setDistributionTable(resultArray[0].distributionTable);
      }
    } catch (error) {
      console.error("Error computing distribution table:", error);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === "function" ? "table" : "function"));
  };

  const toggleDisplayMode = () => {
    setDisplayMode(prev => (prev === "amount" ? "percentage" : "amount"));
  };

  const renderTable = () => {
    if (!distributionTable) {
      return <p>Loading table...</p>;
    }
    return (
      <table className="w-full border-collapse border border-gray-300 mb-2">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(distributionTable).map(([nodeName, value], idx) => {
            const displayValue =
              displayMode === "amount"
                ? value
                : totalBudget > 0
                ? ((value / totalBudget) * 100).toFixed(2) + "%"
                : "0%";
            return (
              <tr key={idx}>
                <td className="border border-gray-300 p-2">{nodeName}</td>
                <td className="border border-gray-300 p-2">{displayValue}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="tabs flex border-b">
          {patterns.map((pattern, index) => (
            <button
              key={`${pattern.resultId}-${index}`}
              onClick={() => setActivePatternIndex(index)}
              className={`py-2 px-4 focus:outline-none ${
                activePatternIndex === index ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"
              }`}
            >
              {pattern.name}
            </button>
          ))}
        </div>
        <button onClick={toggleViewMode} className="ml-4 p-2 border rounded">
          {viewMode === "function" ? "Show Table" : "Show Function"}
        </button>
        {viewMode === "table" && (
          <button onClick={toggleDisplayMode} className="ml-4 p-2 border rounded">
            {displayMode === "amount" ? "Show Percentage" : "Show Amount"}
          </button>
        )}
      </div>
      <div className="tab-content">
        <div className="border p-4 rounded">
          <h3 className="text-lg font-bold mb-2">{patterns[activePatternIndex].name}</h3>
          <p className="mb-2">{patterns[activePatternIndex].description}</p>
          {viewMode === "function" ? (
            <pre className="bg-gray-100 p-2 rounded mb-2 whitespace-pre-wrap">
              {patterns[activePatternIndex]["function"]}
            </pre>
          ) : (
            renderTable()
          )}
          <p className="italic text-gray-600">Reason: {patterns[activePatternIndex].reason}</p>
        </div>
      </div>
    </div>
  );
}

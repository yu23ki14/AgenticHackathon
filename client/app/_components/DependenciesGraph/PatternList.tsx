"use client";

import * as React from "react";
import { ReactElement } from "react";
import { defaultPatternDataArr } from "@/data/dependencies/patterns";
import { PatternData } from "@/types/dependenciesData";

export default function PatternList(): ReactElement {
  // In a future iteration, replace defaultPatternDataArr with LLM output.
  const patterns: PatternData[] = defaultPatternDataArr;

  return (
    <div className="p-4 border rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-2">Distribution Patterns</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Pattern Name</th>
            <th className="border border-gray-300 p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {patterns.map((pattern) => (
            <tr key={pattern.resultId}>
              <td className="border border-gray-300 p-2">{pattern.name}</td>
              <td className="border border-gray-300 p-2">{pattern.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

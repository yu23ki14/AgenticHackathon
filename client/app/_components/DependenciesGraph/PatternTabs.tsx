// client/app/_components/DependenciesGraph/PatternTabs.tsx
"use client";

import * as React from "react";
import { ReactElement, useState } from "react";
import { PatternData } from "@/types/dependenciesData";

interface PatternTabsProps {
  patterns: PatternData[];
}

export default function PatternTabs({ patterns }: PatternTabsProps): ReactElement {
  const [activePatternIndex, setActivePatternIndex] = useState<number>(0);

  return (
    <div className="mt-4">
      <div className="tabs flex border-b mb-4">
        {patterns.map((pattern, index) => (
          <button
            key={pattern.name}
            onClick={() => setActivePatternIndex(index)}
            className={`py-2 px-4 focus:outline-none ${
              activePatternIndex === index ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"
            }`}
          >
            {pattern.name}
          </button>
        ))}
      </div>
      <div className="tab-content">
        <div className="border p-4 rounded">
          <h3 className="text-lg font-bold mb-2">
            {patterns[activePatternIndex].name}
          </h3>
          <p className="mb-2">{patterns[activePatternIndex].description}</p>
          <pre className="bg-gray-100 p-2 rounded mb-2 whitespace-pre-wrap">
            {patterns[activePatternIndex].JavaScriptFunction}
          </pre>
          <p className="italic text-gray-600">
            Reason: {patterns[activePatternIndex].reason}
          </p>
        </div>
      </div>
    </div>
  );
}

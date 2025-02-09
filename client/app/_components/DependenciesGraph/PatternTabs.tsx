// client/app/_components/DependenciesGraph/PatternTabs.tsx
"use client";

import * as React from "react";
import { ReactElement, useState, useEffect } from "react";
import { PatternData } from "@/types/dependenciesData";
import { useDependenciesData } from "@/hooks/useDependenciesData";

interface PatternTabsProps {
  index: number;
}

export default function PatternTabs({ index }: PatternTabsProps): ReactElement {
  const { patternsDataArr } = useDependenciesData();
  const [activePatternIndex, setActivePatternIndex] = useState<number>(0);
  const [patterns, setPatterns] = useState<PatternData[]>(patternsDataArr[index] ?? []);

  useEffect(() => {
    setPatterns(patternsDataArr[index] ?? []);
    setActivePatternIndex(0);
  }, [patternsDataArr, index]);

  return (
    <div className="mt-4">
      <div className="tabs flex border-b mb-4">
        {patterns.map((pattern, index) => ( // index: 0 ~ patterns.length - 1
          <button
            key={index}
            onClick={() => setActivePatternIndex(index)}
            className={`py-2 px-4 focus:outline-none ${
              activePatternIndex === index ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"
            }`}
          >
            {pattern.name}
          </button>
        ))}
      </div>
      {patterns[activePatternIndex] &&
        <div className="tab-content">
          <div className="border p-4 rounded">
            <h3 className="text-lg font-bold mb-2">
              {patterns[activePatternIndex].name}
            </h3>
            <p className="mb-2">{patterns[activePatternIndex].description}</p>
            <pre className="bg-gray-100 p-2 rounded mb-2 whitespace-pre-wrap">
              {patterns[activePatternIndex].function}
            </pre>
            <p className="italic text-gray-600">
              Reason: {patterns[activePatternIndex].reason}
            </p>
          </div>
        </div>
      }
    </div>
  );
}

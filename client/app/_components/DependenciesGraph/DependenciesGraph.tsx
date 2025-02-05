"use client";

import * as React from "react";
import { ReactElement, useEffect, useState } from "react";
import AboutAlgorithm from "./DiscriptionSection";
import VisualizeGraph from "./GraphSection";
import VisualizeDistribution from "./DistributionSection";
import { useDependenciesData } from "@/hooks/useDependenciesData";

export default function DependenciesGraph(): ReactElement {
  const { descriptionDataArr } = useDependenciesData();
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    console.log(descriptionDataArr);
  }, [descriptionDataArr]);

  return (
    <div className="flex flex-col gap-2">
      <div className="tabs flex border-b mb-4">
        {descriptionDataArr.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === index ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"
            }`}
          >
            {tab.name || `パターン ${index + 1}`}
          </button>
        ))}
      </div>
      <div className="tab-content">
        <AboutAlgorithm />
        <VisualizeGraph index={activeTab} />
        <VisualizeDistribution index={activeTab} />
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { ReactElement, useEffect, useState } from "react";
import { useDependenciesData } from "@/hooks/useDependenciesData";
import DescriptionSection from "./DiscriptionSection";
import GraphSection from "./GraphSection";
import InferencePanel from "./InferencePanel";

export default function DependenciesGraph(): ReactElement {
  const { descriptionDataArr } = useDependenciesData();
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    console.log(descriptionDataArr);
  }, [descriptionDataArr]);

  return (
    <div className="flex flex-col gap-2 max-w-3xl mx-auto">
      {descriptionDataArr.length > 0 && (
        <div className="tabs flex border-b mb-4">
          {descriptionDataArr.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-2 px-4 focus:outline-none ${
                activeTab === index ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"
              }`}
            >
              {tab.name || `Pattern ${index + 1}`}
            </button>
          ))}
        </div>
      )}
      <div className="tab-content">
        <DescriptionSection descriptionData={descriptionDataArr[activeTab]} />
        <GraphSection index={activeTab} />
        <InferencePanel index={activeTab} />
      </div>
    </div>
  );
}

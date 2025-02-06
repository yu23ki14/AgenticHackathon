"use client";

import * as React from "react";
import { ReactElement, useEffect } from "react";
import { useDependenciesData } from "@/hooks/useDependenciesData";
import { defaultDescriptionDataArr, defaultDistributionDataArr, defaultGraphDataArr } from "@/data/dependencies";
import ChatBot from "./ChatBot";

export default function LeftContent(): ReactElement {
  const { setDescriptionDataArr, setGraphDataArr, setDistributionDataArr } = useDependenciesData();

  useEffect(() => {
    setDescriptionDataArr(defaultDescriptionDataArr);
    setGraphDataArr(defaultGraphDataArr);
    setDistributionDataArr(defaultDistributionDataArr);
  }, []);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto stretch">
      <ChatBot />
    </div>
  )
}

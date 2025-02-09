"use client";

import * as React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ReactElement, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useDependenciesData } from "@/hooks/useDependenciesData";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className="w-1/2 p-8">
      <ChatBot />
    </div>
  )
}

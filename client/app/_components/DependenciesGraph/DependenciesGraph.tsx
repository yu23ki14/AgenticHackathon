"use client";

import * as React from "react";
import { ReactElement } from "react";
import AboutAlgorithm from "./AboutAlgorithm";
import VisualizeGraph from "./VisualizeGraph";
import VisualizeDistribution from "./VisualizeDistribution";

export default function DependenciesGraph(): ReactElement {
  return (
    <div className="flex flex-col gap-24">
      <AboutAlgorithm />
      <VisualizeGraph />
      <VisualizeDistribution />
    </div>
  );
}

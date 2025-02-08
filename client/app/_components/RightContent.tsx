"use client";

import * as React from "react";
import { ReactElement } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import DependenciesGraph from "./DependenciesGraph/DependenciesGraph";
import InferencePanel from "./DependenciesGraph/InferencePanel";

export default function RightContent(): ReactElement {
  return (
    <div className="w-1/2 p-8">
      <DependenciesGraph />
      <InferencePanel />
    </div>
  )
}

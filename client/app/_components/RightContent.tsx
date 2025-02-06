"use client";

import * as React from "react";
import { ReactElement } from "react";
import DependenciesGraph from "./DependenciesGraph/DependenciesGraph";

export default function RightContent(): ReactElement {
  return (
    <div className="w-1/2 p-8">
      <DependenciesGraph />
    </div>
  )
}

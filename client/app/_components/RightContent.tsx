"use client";

import * as React from "react";
import { ReactElement } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import DependenciesGraph from "./DependenciesGraph/DependenciesGraph";
import { CreateSplit } from "./Split/CreateSplit";

export default function RightContent(): ReactElement {
  return (
    <div className="w-1/2 p-8">
      <DependenciesGraph />
      <CreateSplit />
    </div>
  );
}

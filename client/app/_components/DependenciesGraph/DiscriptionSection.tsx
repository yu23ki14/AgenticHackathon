"use client";

import * as React from "react";
import { ReactElement } from "react";

export default function AboutAlgorithm(): ReactElement {
  const algorithmDescription = "このアルゴリズムは、効率的な分配を目指しながらも公平性を加味しており、ユーザーのニーズに応じた最適な分配を行います。";

  return (
    <div>
      <p>{algorithmDescription}</p>
    </div>
  );
}

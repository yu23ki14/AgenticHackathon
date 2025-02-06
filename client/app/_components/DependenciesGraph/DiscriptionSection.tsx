"use client";

import * as React from "react";
import { ReactElement } from "react";
import { DescriptionData } from "@/types/dependenciesData";
interface DescriptionSectionProps {
  descriptionData: DescriptionData;
}

export default function DescriptionSection({ descriptionData }: DescriptionSectionProps): ReactElement {
  // const description = "このアルゴリズムは、効率的な分配を目指しながらも公平性を加味しており、ユーザーのニーズに応じた最適な分配を行います。";

  return (
    <div>
      {descriptionData &&
        <p>{descriptionData.description}</p>
      }
    </div>
  );
}

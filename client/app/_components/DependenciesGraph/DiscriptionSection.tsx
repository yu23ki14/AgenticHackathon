"use client";

import * as React from "react";
import { ReactElement } from "react";
import { DescriptionData } from "@/types/dependenciesData";
interface DescriptionSectionProps {
  descriptionData: DescriptionData;
}

export default function DescriptionSection({ descriptionData }: DescriptionSectionProps): ReactElement {

  return (
    <div>
      {descriptionData &&
        <p>{descriptionData.description}</p>
      }
    </div>
  );
}

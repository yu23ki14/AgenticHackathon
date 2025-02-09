"use client";

import * as React from "react";
import { ReactElement } from "react";
import { cn } from "@/lib/utils";
import LeftContent from "./LeftContent";
import RightContent from "./RightContent";
import { DependenciesDataProvider } from "@/hooks/useDependenciesData";

// レイアウト全体を左右に分割するコンポーネント
const SplitLayout = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex min-h-screen overflow-hidden max-w-screen-2.5xl mx-auto scrollbar-hide",
        className
      )}
      {...props}
    />
  )
);
SplitLayout.displayName = "SplitLayout";

export default function MainContent(): ReactElement {
  return (
    <DependenciesDataProvider>
      <SplitLayout>
        <LeftContent />
        <RightContent />
      </SplitLayout>
    </DependenciesDataProvider>
  );
}

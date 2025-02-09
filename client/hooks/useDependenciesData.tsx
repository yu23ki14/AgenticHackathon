import * as React from "react";
import { createContext, useContext, useState, ReactNode } from "react";
import { DescriptionData, DistributionData, GraphData, PatternData } from "@/types/dependenciesData";

interface DependenciesDataContextProps {
  descriptionDataArr: DescriptionData[];
  graphDataArr: GraphData[];
  distributionDataArr: DistributionData[];
  patternsDataArr: PatternData[][];
  setDescriptionDataArr: React.Dispatch<React.SetStateAction<DescriptionData[]>>;
  setGraphDataArr: React.Dispatch<React.SetStateAction<GraphData[]>>;
  setDistributionDataArr: React.Dispatch<React.SetStateAction<DistributionData[]>>;
  setPatternsDataArr: React.Dispatch<React.SetStateAction<PatternData[][]>>;
}

const DependenciesDataContext = createContext<DependenciesDataContextProps | undefined>(
  undefined
);

export const DependenciesDataProvider = ({ children }: { children: ReactNode }) => {
  const [descriptionDataArr, setDescriptionDataArr] = useState<DescriptionData[]>([]);
  const [graphDataArr, setGraphDataArr] = useState<GraphData[]>([]);
  const [distributionDataArr, setDistributionDataArr] = useState<DistributionData[]>([]);
  const [patternsDataArr, setPatternsDataArr] = useState<PatternData[][]>([]);

  return (
    <DependenciesDataContext.Provider value={{
        descriptionDataArr,
        setDescriptionDataArr,
        graphDataArr,
        setGraphDataArr,
        distributionDataArr,
        setDistributionDataArr,
        patternsDataArr,
        setPatternsDataArr,
      }}>
      {children}
    </DependenciesDataContext.Provider>
  );
};

export const useDependenciesData = () => {
  const context = useContext(DependenciesDataContext);
  if (!context) {
    throw new Error("useDependenciesData must be used within a DependenciesDataProvider");
  }
  return context;
};
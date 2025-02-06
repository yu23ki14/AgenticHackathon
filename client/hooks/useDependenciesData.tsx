import * as React from "react";
import { createContext, useContext, useState, ReactNode } from "react";
import { DescriptionData, DistributionData, GraphData } from "@/types/dependenciesData";

interface DependenciesDataContextProps {
  descriptionDataArr: DescriptionData[];
  graphDataArr: GraphData[];
  distributionDataArr: DistributionData[];
  setDescriptionDataArr: React.Dispatch<React.SetStateAction<DescriptionData[]>>;
  setGraphDataArr: React.Dispatch<React.SetStateAction<GraphData[]>>;
  setDistributionDataArr: React.Dispatch<React.SetStateAction<DistributionData[]>>;
}

const defaultDescriptionDataArr: DescriptionData[] = [
  {
    resultId: 1,
    name: "Too Many Yawns",
    description: "このアルゴリズムは、効率的な分配を目指しながらも公平性を加味しており、ユーザーのニーズに応じた最適な分配を行います。"
  },
  {
    resultId: 2,
    name: "Community Pulse",
    description: "このアルゴリズムは、リアルタイムのコミュニティ活動の脈動を捉え、各メンバーの貢献度を即座に可視化します。"
  },
  {
    resultId: 3,
    name: "Collaboration Mapper",
    description: "ネットワークグラフを活用し、メンバー間の連携パターンとその相互作用を明確にすることで、より強固なコラボレーション環境を構築します。"
  }
];

const defaultGraphDataArr: GraphData[] = [
  {
    resultId: 1,
    nodes: [
      { id: 1, label: "Yawn-A", title: "node 1 tooltip text" },
      { id: 2, label: "Yawn-B", title: "node 2 tooltip text" },
      { id: 3, label: "Yawn-C", title: "node 3 tooltip text" },
      { id: 4, label: "Yawn-D", title: "node 4 tooltip text" },
      { id: 5, label: "Yawn-E", title: "node 5 tooltip text" }
    ],
    edges: [
      { from: 1, to: 2, width: 1 },
      { from: 1, to: 3, width: 2 },
      { from: 2, to: 4, width: 4 },
      { from: 2, to: 5, width: 5 }
    ]
  },
  // Sample data for "Community Pulse" with people's names
  {
    resultId: 2,
    nodes: [
      { id: 6, label: "Alice", title: "Alice's tooltip" },
      { id: 7, label: "Bob", title: "Bob's tooltip" },
      { id: 8, label: "Charlie", title: "Charlie's tooltip" }
    ],
    edges: [
      { from: 6, to: 7, width: 1 },
      { from: 7, to: 8, width: 3 }
    ]
  },
  // Sample data for "Collaboration Mapper" with people's names
  {
    resultId: 3,
    nodes: [
      { id: 9, label: "Dave", title: "Dave's tooltip" },
      { id: 10, label: "Eva", title: "Eva's tooltip" },
      { id: 11, label: "Frank", title: "Frank's tooltip" },
      { id: 12, label: "Grace", title: "Grace's tooltip" }
    ],
    edges: [
      { from: 9, to: 10, width: 1 },
      { from: 9, to: 11, width: 2 },
      { from: 11, to: 12, width: 3 }
    ]
  }
];

const defaultDistributionDataArr: DistributionData[] = [
  {
    resultId: 1,
    distributionData: [
      { name: "Yawn-A", value: 110 },
      { name: "Yawn-B", value: 50 },
      { name: "Yawn-C", value: 30 },
      { name: "Yawn-D", value: 30 },
      { name: "Yawn-E", value: 10 },
    ]
  },
  // Sample data for "Community Pulse" with people's names
  {
    resultId: 2,
    distributionData: [
      { name: "Alice", value: 70 },
      { name: "Bob", value: 90 },
      { name: "Charlie", value: 40 },
    ]
  },
  // Sample data for "Collaboration Mapper" with people's names
  {
    resultId: 3,
    distributionData: [
      { name: "Dave", value: 80 },
      { name: "Eva", value: 60 },
      { name: "Frank", value: 50 },
      { name: "Grace", value: 30 },
    ]
  }
];

const DependenciesDataContext = createContext<DependenciesDataContextProps | undefined>(
  undefined
);

export const DependenciesDataProvider = ({ children }: { children: ReactNode }) => {
  const [descriptionDataArr, setDescriptionDataArr] = useState<DescriptionData[]>(defaultDescriptionDataArr);
  const [graphDataArr, setGraphDataArr] = useState<GraphData[]>(defaultGraphDataArr);
  const [distributionDataArr, setDistributionDataArr] = useState<DistributionData[]>(defaultDistributionDataArr);

  return (
    <DependenciesDataContext.Provider value={{
        descriptionDataArr,
        setDescriptionDataArr,
        graphDataArr,
        setGraphDataArr,
        distributionDataArr,
        setDistributionDataArr,
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
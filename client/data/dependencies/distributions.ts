import { DistributionData } from "@/types/dependenciesData";

export const defaultDistributionDataArr: DistributionData[] = [
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
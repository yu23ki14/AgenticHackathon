export type DescriptionData = {
  resultId: number;
  name: string | undefined;
  description: string;
}

export type GraphNode = {
  id: number;
  label: string;
  title: string;
}

export type GraphEdge = {
  from: number;
  to: number;
  width: number;
}

export type GraphData = {
  resultId: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type DistributionDataItem = {
  name: string;
  value: number;
}

export type DistributionData = {
  resultId: number;
  distributionData: DistributionDataItem[];
}

export type DependenciesData = {
  descriptionDataArr: DescriptionData[];
  graphDataArr: GraphData[];
  distributionDataArr: DistributionData[];
}

export type PatternData = {
  resultId: number;
  name: string;
  description: string;
  JavaScriptFunction: string;
};

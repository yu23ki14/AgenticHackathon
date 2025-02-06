import { GraphData } from "@/types/dependenciesData";

export const defaultGraphDataArr: GraphData[] = [
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
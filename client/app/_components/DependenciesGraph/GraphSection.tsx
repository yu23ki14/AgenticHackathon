"use client";

import * as React from "react";
import { ReactElement } from "react";
import dynamic from 'next/dynamic';
import { useDependenciesData } from "@/hooks/useDependenciesData";
import { GraphData } from "@/types/dependenciesData";
// import "./styles.css";
// import "./network.css";

const Graph = dynamic(() => import("react-graph-vis"), {
  ssr: false
});

// Define the scale factor constant and set it to 3.
const SCALE_FACTOR = 3;

interface GraphEvent {
  nodes: number[];
  edges: number[];
}

interface GraphSectionProps {
  index: number;
}

export default function GraphSection({ index }: GraphSectionProps): ReactElement {
  const { graphDataArr } = useDependenciesData();

  const options = React.useMemo(() => ({
    layout: {
      hierarchical: true
    },
    edges: {
      color: "#000000"
    },
    height: "500px"
  }), []);

  const graphData = graphDataArr[index];

  let normalizedGraphData: GraphData = graphData;

  if (graphData) {
    const maxWeight = Math.max(...graphData.edges.map(edge => edge.width));

    normalizedGraphData = {
      ...graphData,
      edges: graphData.edges.map(edge => ({
        ...edge,
        // Use SCALE_FACTOR in place of the literal 3.
        width: maxWeight > 0 ? edge.width * SCALE_FACTOR / maxWeight : 0
      }))
    };
  }
  

  console.log("================")
  console.log(normalizedGraphData);
  console.log("================")
  
 
  const events = React.useMemo(() => ({
    select: function(event: GraphEvent): void {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { nodes, edges } = event;
    }
  }), []);
  
  return (
    <div>
      {graphData &&<Graph
        key={graphData.resultId}
        graph={normalizedGraphData}
        options={options}
        events={events}
        // getNetwork={network => {
        //   //  if you want access to vis.js network api you can set the state in a parent component using this property
        // }}
      />}
    </div>
  );
}

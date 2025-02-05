"use client";

import * as React from "react";
import { ReactElement } from "react";
import dynamic from 'next/dynamic';
import { useDependenciesData } from "@/hooks/useDependenciesData";
// import "./styles.css";
// import "./network.css";

const Graph = dynamic(() => import("react-graph-vis"), {
  ssr: false
});

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
 
  const events = React.useMemo(() => ({
    select: function(event: GraphEvent): void {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { nodes, edges } = event;
    }
  }), []);
  
  return (
    <div>
      <Graph
        key={graphData.resultId}
        graph={graphData}
        options={options}
        events={events}
        // getNetwork={network => {
        //   //  if you want access to vis.js network api you can set the state in a parent component using this property
        // }}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { ReactElement } from "react";
import dynamic from 'next/dynamic';
// import "./styles.css";
// import "./network.css";

const Graph = dynamic(() => import("react-graph-vis"), {
  ssr: false
});

interface GraphNode {
  id: number;
  label: string;
  title: string;
}

interface GraphEdge {
  from: number;
  to: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphEvent {
  nodes: number[];
  edges: number[];
}

export default function VisualizeGraph(): ReactElement {
  const graph: GraphData = React.useMemo(() => ({
    nodes: [
      { id: 1, label: "Yawn-A", title: "node 1 tootip text" },
      { id: 2, label: "Yawn-B", title: "node 2 tootip text" },
      { id: 3, label: "Yawn-C", title: "node 3 tootip text" },
      { id: 4, label: "Yawn-D", title: "node 4 tootip text" },
      { id: 5, label: "Yawn-E", title: "node 5 tootip text" }
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 }
    ]
  }), []);
 
  const options = React.useMemo(() => ({
    layout: {
      hierarchical: true
    },
    edges: {
      color: "#000000"
    },
    height: "500px"
  }), []);
 
  const events = React.useMemo(() => ({
    select: function(event: GraphEvent): void {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { nodes, edges } = event;
    }
  }), []);
  
  return (
    <div>
      <Graph
        graph={graph}
        options={options}
        events={events}
        // getNetwork={network => {
        //   //  if you want access to vis.js network api you can set the state in a parent component using this property
        // }}
      />
    </div>
  );
}

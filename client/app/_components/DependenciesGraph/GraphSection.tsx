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
      randomSeed: 42
    },
    nodes: {
      size: 25,          // ノードサイズを明示的に設定
      font: {
        size: 12        // フォントサイズを調整
      }
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -8000,  // -3000 → -8000 でより強い反発力に
        centralGravity: 0.1,          // 0.2 → 0.1 でさらに中心への引力を弱く
        springLength: 250,            // 200 → 250 でバネをさらに長く
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 1              // ノードの重なりを最大限回避
      },
      stabilization: {
        iterations: 1000,
        updateInterval: 25
      }
    },
    height: "500px"
  }), []);
  

  const graphData = graphDataArr[index];

  let normalizedGraphData: GraphData = graphData;

  if (graphData) {
    const maxWidth = Math.max(...graphData.edges.map(edge => edge.width));
    
    normalizedGraphData = {
      ...graphData,
      nodes: graphData.nodes.map(node => {
        return {
          ...node,
          shape: "circle",
        };
      }),
      edges: graphData.edges.map(edge => {
        // まずは width を正規化

        // 元の計算（normalizedWidth は既に計算済み）
        const normalizedWeight = maxWidth > 0 ? edge.width / maxWidth : 0;
        const normalizedWidth = normalizedWeight * SCALE_FACTOR;
        
        // エッジ長の範囲を広げる
        const MIN_EDGE_LENGTH = 150;   // 80 → 150
        const MAX_EDGE_LENGTH = 300;   // 180 → 300

        // 基準値を大きくして全体的に長めのエッジに
        const baseValue = 400;         // 200 → 400
        const computedLength = normalizedWidth > 0 ? baseValue / normalizedWidth : baseValue;

        // computedLength の値を新しい範囲でクランプ
        const edgeLength = Math.max(MIN_EDGE_LENGTH, Math.min(computedLength, MAX_EDGE_LENGTH));

        return { 
          ...edge, 
          label: normalizedWeight.toFixed(2),
          width: normalizedWidth,  // 見た目の太さ
          length: edgeLength       // 物理シミュレーション上での理想距離
        };
      })
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
      {graphData && normalizedGraphData &&<Graph
        key={Math.random()}
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

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
      // 階層レイアウトは使わず、force-directed 配置を利用
      randomSeed: 42  // 任意の固定値（数値）を設定する
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 95,
        springConstant: 0.04,
        damping: 0.09
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
        // 最小と最大のエッジ長を定義（必要に応じて調整してください）
        const MIN_EDGE_LENGTH = 80;
        const MAX_EDGE_LENGTH = 180;

        // 元の計算（normalizedWidth は既に計算済み）
        const normalizedWidth = maxWidth > 0 ? edge.width * SCALE_FACTOR / maxWidth : 0;

        // 基本となる計算。normalizedWidth が大きいほど、計算結果は小さくなります。
        const baseValue = 200; // 調整可能な基準値
        const computedLength = normalizedWidth > 0 ? baseValue / normalizedWidth : baseValue;

        // computedLength の値を MIN_EDGE_LENGTH ～ MAX_EDGE_LENGTH の範囲にクランプする
        const edgeLength = Math.max(MIN_EDGE_LENGTH, Math.min(computedLength, MAX_EDGE_LENGTH));

        return { 
          ...edge, 
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

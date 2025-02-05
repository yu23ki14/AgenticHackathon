"use client";

import * as React from "react";
import { ReactElement } from "react";

export default function VisualizeDistribution(): ReactElement {

  const data = [
    {
      name: "Yawn-A",
      value: 110,
    },
    {
      name: "Yawn-B",
      value: 50,
    },
    {
      name: "Yawn-C",
      value: 30,
    },
    {
      name: "Yawn-D",
      value: 30,
    },
    {
      name: "Yawn-E",
      value: 10,
    },
  ];

  return (
    <div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2 w-36">{item.name}</td>
              <td className="border border-gray-300 p-2">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

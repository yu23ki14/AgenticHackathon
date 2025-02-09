"use client";

import * as React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ReactElement, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ChatBot from "./ChatBot";

export default function LeftContent(): ReactElement {
  return (
    <div className="w-1/2 p-8 overflow-y-auto h-screen scrollbar-hide">
      <ChatBot />
    </div>
  );
}

"use client";

import { ReactElement } from "react";
import MainContent from "../_components/MainContent";
import { PrivyProvider } from "@privy-io/react-auth";
import { sepolia } from "viem/chains";

export default function Home(): ReactElement {
  return (
    <PrivyProvider
      appId="cm6xbpwtj008ldmnso9iaocbp"
      config={{ defaultChain: sepolia }}
    >
      <main className="min-h-screen w-full p-4">
        <MainContent />
      </main>
    </PrivyProvider>
  );
}

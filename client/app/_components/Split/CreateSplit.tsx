import { SPLITS_CREATOR_ABI } from "@/abi/splitsCreator";
import { Button } from "@/components/ui/button";
import { SplitsProvider, useCreateSplitV2 } from "@0xsplits/splits-sdk-react";
import { useConnectWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseEventLogs,
} from "viem";
import { sepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const CreateSplit: FC = () => {
  const [walletClient, setWalletClient] = useState<any>();
  const { connectWallet } = useConnectWallet();

  const { wallets } = useWallets();

  useEffect(() => {
    const init = async () => {
      if (wallets.length > 0) {
        const provider = await wallets[0].getEthereumProvider();
        setWalletClient(
          createWalletClient({
            account: wallets[0].address as Address,
            chain: sepolia,
            transport: custom(provider),
          })
        );
      }
    };
    init();
  }, [wallets]);

  return !walletClient ? (
    <Button onClick={connectWallet}>Connect Wallet</Button>
  ) : (
    <SplitsProvider
      config={{
        publicClient,
        walletClient,
      }}
    >
      <CreateSplitButton />
    </SplitsProvider>
  );
};

export const CreateSplitButton: FC = () => {
  const { createSplit, error } = useCreateSplitV2();

  const handleCreateSplit = useCallback(async () => {
    const res = await createSplit({
      recipients: [
        {
          address: "0xdCb93093424447bF4FE9Df869750950922F1E30B",
          percentAllocation: 10,
        },
        {
          address: "0x777EE5eeEd30c3712bEE6C83260D786857d9C556",
          percentAllocation: 90,
        },
      ],
      distributorFeePercent: 0,
    });

    if (res) {
      const txHash = res[0].transactionHash as Address;
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const parsedLog: any = parseEventLogs({
        abi: SPLITS_CREATOR_ABI,
        eventName: "SplitCreated",
        logs: receipt.logs,
        strict: false,
      });

      const splitsAddress = parsedLog[0].args.split;
      alert(
        `Split created at https://app.splits.org/accounts/${splitsAddress}/?chainId=11155111`
      );
    }
  }, [createSplit]);

  return (
    <Button
      className="p-2 bg-orange-500 text-white rounded w-full"
      onClick={handleCreateSplit}
    >
      Create Split
    </Button>
  );
};

import { SPLITS_CREATOR_ABI } from "@/abi/splitsCreator";
import { Button } from "@/components/ui/button";
import { useDependenciesData } from "@/hooks/useDependenciesData";
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

interface Props {
  transactions: {
    amount: string;
    blockTimestamp: string;
    receiver: string;
    sender: string;
    roleName: string;
    tokenId: string;
    roleAssignee: string;
  }[];
  distributionTable: {
    [key: string]: number;
  } | null;
}

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(
    "https://eth-sepolia.g.alchemy.com/v2/8hXKjqbmswYlOFLHm7Sq8vRO3rNIf5Vz"
  ),
});

export const CreateSplit: FC<Props> = ({ transactions, distributionTable }) => {
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
      <CreateSplitButton
        transactions={transactions}
        distributionTable={distributionTable}
      />
    </SplitsProvider>
  );
};

export const CreateSplitButton: FC<Props> = ({
  transactions,
  distributionTable,
}) => {
  const { createSplit, error } = useCreateSplitV2();

  const totalBudget = useMemo(() => {
    return transactions.reduce((acc, tx) => acc + parseInt(tx.amount), 0);
  }, [transactions]);

  const recipients = useMemo(() => {
    if (!distributionTable) {
      return [];
    }
    console.log("distributionTable", distributionTable);
    const x = Object.keys(distributionTable!).map((key) => {
      const allocation = Math.round(
        (distributionTable[key] / totalBudget) * 10000
      );
      return {
        address: (transactions.find((tx) =>
          tx.receiver.includes(key.slice(0, 6))
        )?.receiver ||
          transactions.find((tx) => tx.sender.includes(key.slice(0, 6)))
            ?.sender) as Address,
        percentAllocation: allocation,
      };
    });

    const subof = x.reduce((acc, r) => acc + r.percentAllocation, 0);
    console.log("sum", subof);
    const diff = subof - 100;
    for (let i = 0; i < diff; i++) {
      if (x.length > i) {
        x[i].percentAllocation -= 1;
      } else {
        x[0].percentAllocation -= 1;
      }
    }

    return x;
  }, [totalBudget, distributionTable]);

  const handleCreateSplit = useCallback(async () => {
    const res = await createSplit({
      recipients,
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
  }, [createSplit, recipients]);

  return (
    <Button
      className="p-2 bg-orange-500 text-white rounded w-full"
      onClick={handleCreateSplit}
    >
      Create Split
    </Button>
  );
};

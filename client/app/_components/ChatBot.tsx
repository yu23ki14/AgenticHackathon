"use client";

import * as React from "react";
import { ReactElement, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { MemoizedMarkdown } from "@/app/_components/memoized-markdown";
import { useDependenciesData } from "@/hooks/useDependenciesData";
import { execute } from "@/utils/GenerateDependenciesGraphData/execute";
import { transactions } from "@/utils/GenerateDependenciesGraphData/transactions";

export default function ChatBot(): ReactElement {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    descriptionDataArr,
    setDescriptionDataArr,
    setGraphDataArr,
    setDistributionDataArr,
  } = useDependenciesData();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [jsCodes, setJsCodes] = useState<string[]>([]);
  const [jsCodeSuccess, setJsCodeSuccess] = useState<boolean>(false);

  useEffect(() => {
    const getGraphData = (generated: {
      function: string;
      description: string;
    }) => {
      const graphData = execute(transactions, JSON.stringify(generated));
      return graphData;
    };

    console.log("messages: ", messages);
    const toolIncocation = messages[messages.length - 1]?.toolInvocations?.[0];
    if (toolIncocation && "result" in toolIncocation) {
      console.log("toolIncocation: ", toolIncocation);
      const result = toolIncocation.result;
      if ("code" in result) {
        console.log("code: ", result.code);
        setJsCodeSuccess(false);
        try {
          const graphData = getGraphData({
            function: result.code.function,
            description: result.code.description,
          });
          console.log("graphData: ", graphData);
          const nextResultId = descriptionDataArr.length + 1;
          console.log("nextResultId: ", nextResultId);
          setGraphDataArr((prev) => [
            ...prev,
            ...graphData.map((data) => ({
              ...data,
              resultId: nextResultId,
            })),
          ]);
          setJsCodes((prev) => [...prev, result.code]);
          setDescriptionDataArr((prev) => {
            return [
              ...prev,
              {
                resultId: nextResultId,
                name: undefined,
                description: result.code.description,
              },
            ];
          });
          setJsCodeSuccess(true);
        } catch (error) {
          alert("Code generation failed. Please try again.");
          console.error("Error generating graph data: ", error);
        }
      }
      if ("list" in result) {
        console.log("distributions: ", result.list.distributions);
        setDistributionDataArr((prev) => {
          return [...prev, ...result.list.distributions];
        });
      }
    }
  }, [messages, setDescriptionDataArr, setDistributionDataArr]);

  return (
    <div className="flex flex-col w-full max-w-3xl h-full pt-12 mx-auto stretch">
      {/* メッセージ表示エリア - スクロール可能な領域として設定 */}
      <div className="flex-1 w-full py-4 px-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex w-full ${
              m.role === "user" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`p-4 text-gray-800 ${
                m.role === "user"
                  ? "max-w-[80%] pl-5 rounded-3xl bg-blue-100 rounded-br-none"
                  : "max-w-[100%]"
              } break-words whitespace-pre-wrap overflow-wrap-anywhere`}
            >
              {m.toolInvocations?.[0] ? (
                <>
                  {"result" in m.toolInvocations[0] ? (
                    <div className="w-full">
                      {m.toolInvocations[0].result.code && jsCodeSuccess && (
                        <>
                          <div className="flex items-center gap-2 mb-2 text-sm font-mono">
                            <span className="animate-pulse">🔍</span>
                            <p className="font-semibold bg-gradient-to-r from-orange-400 to-yellow-600 bg-clip-text text-transparent">
                              Don&apos;t Trust, Verify!
                            </p>
                            <span className="animate-bounce">⛓️</span>
                          </div>
                          <MemoizedMarkdown
                            id={m.id}
                            content={`\`\`\`typescript\n${m.toolInvocations[0].result.code.function}\n\`\`\``}
                          />
                        </>
                      )}
                      {/* {m.toolInvocations[0].result.list && <div>List in coming...</div>} */}
                    </div>
                  ) : (
                    <div>
                      <p className="inline-flex items-center text-gray-400">
                        Agent is coding
                        <span className="ml-1 inline-flex">
                          <span className="animate-bounce-dot">.</span>
                          <span
                            className="animate-bounce-dot"
                            style={{ animationDelay: "0.2s" }}
                          >
                            .
                          </span>
                          <span
                            className="animate-bounce-dot"
                            style={{ animationDelay: "0.4s" }}
                          >
                            .
                          </span>
                        </span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <MemoizedMarkdown id={m.id} content={m.content} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 入力フォームエリア - sticky positioningを使用 */}
      <div className="sticky bottom-0 left-0 right-0 w-full dark:border-zinc-800 p-4 dark:bg-zinc-900">
        {messages.length == 0 && (
          <p className="ml-2 mb-1 p-2 bg-yellow-100">
            Let's ask like "Please generate code for dependencies graph."
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mx-auto">
          <div className="relative w-full">
            <textarea
              className="w-full dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl p-3 px-5 pr-12 rounded-3xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden min-h-[50px] max-h-[200px]"
              value={input}
              placeholder="Send a message..."
              onChange={(e) => {
                handleInputChange(e);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                  (e.target as HTMLTextAreaElement).style.height = "auto";
                }
              }}
              rows={1}
            />
            {input.trim().length > 0 && (
              <button
                type="submit"
                className="absolute right-3 top-[45%] -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black p-2 rounded-full hover:bg-gray-400 dark:hover:bg-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-4 h-4 dark:fill-black"
                  strokeWidth="2"
                  stroke="white"
                >
                  <path d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

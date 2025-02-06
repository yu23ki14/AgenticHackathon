"use client";

import * as React from "react";
import { ReactElement } from "react";
import { useChat } from 'ai/react';

export default function ChatBot(): ReactElement {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="py-24">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}
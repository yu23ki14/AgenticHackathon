"use client";

import { ReactElement } from "react";
import MainContent from "../_components/MainContent";
// import HelloWorld from "../_components/HelloWorld";
// import TelegramUser from "../_components/TelegramUser";
// import { TwitterLogin } from "../_components/TwitterLogin";
// import { DiscordLogin } from "../_components/DiscordLogin";
// import { GithubLogin } from "../_components/GithubLogin";

export default function Home(): ReactElement {
  return (
    <main className="min-h-screen w-full p-4">
      <MainContent />
      {/* <HelloWorld />
      <TelegramUser />
      <TwitterLogin />
      <DiscordLogin />
      <GithubLogin /> */}
    </main>
  );
}

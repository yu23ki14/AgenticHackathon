"use client";

//import { useEffect } from "react";
//import { useSearchParams } from "next/navigation";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// export default function InterstitialPage() {
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     const successUri = searchParams.get("successUri");

//     console.log(successUri);

//     // Send message to opener window if it exists
//     if (window.opener) {
//       window.opener.postMessage(
//         {
//           type: "TWITTER_AUTH_SUCCESS",
//           successUri,
//         },
//         "*"
//       );
//       if (successUri) {
//         window.close();
//       }
//     } else {
//       // Direct navigation - store token and redirect if successUri exists
//       sessionStorage.setItem("success_auth", successUri || "");
//       if (successUri) {
//         window.location.href = successUri;
//       }
//     }
//   }, [searchParams]);

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-white">
//       <div className="text-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1DA1F2] border-t-transparent mx-auto mb-4" />
//         <p className="text-sm text-gray-600">Completing authentication...</p>
//       </div>
//     </div>
//   );
// }

export default function InterstitialPage() {
  // useSearchParams を直接使う場合も、レンダリング部分を Suspense で包みます
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerInterstitialPage />
    </Suspense>
  );
}

function InnerInterstitialPage() {
  const searchParams = useSearchParams();

  // ここで searchParams を使ってページ固有の処理を行う
  return (
    <div>
      <h1>Interstitial Page</h1>
      <p>Search Params: {searchParams.toString()}</p>
    </div>
  );
}
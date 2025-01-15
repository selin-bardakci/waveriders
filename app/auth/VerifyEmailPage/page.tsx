"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the VerifyEmailPage component
const VerifyEmailPage = dynamic(() => import("./VerifyEmailPageComponent"), {
  ssr: false, // Disable server-side rendering for this component
});

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
};

export default Page;

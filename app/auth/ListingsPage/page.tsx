"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the ListingsPage component
const ListingsPage = dynamic(() => import("./ListingsPageComponent"), {
  ssr: false, // Disable server-side rendering for this component
});

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingsPage />
    </Suspense>
  );
};

export default Page;

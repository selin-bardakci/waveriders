"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ResetPasswordForm = dynamic(() => import("./ResetPasswordForm"), {
  ssr: false, // Ensure this component is only rendered on the client side
});

const ResetPasswordPage = () => {
  return (
    <div className="mt-20 flex justify-center">
      <div className="w-full max-w-md bg-white p-8 border border-gray-300 rounded-lg shadow-md">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

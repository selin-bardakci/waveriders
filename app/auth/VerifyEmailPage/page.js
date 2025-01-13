"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid or missing verification token.");
        return;
      }

      try {
        const response = await axios.post("/auth/verify-email", { token });
        if (response.status === 200) {
          setMessage("Email verified successfully. You can now log in.");
        } else {
          setError("Verification failed. Please try again.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(err.response?.data?.message || "An unexpected error occurred.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 border border-gray-300 rounded-lg shadow-md text-center">
        {error ? (
          <div className="bg-red-100 p-4 rounded-lg border border-red-300">
            <h1 className="text-xl font-bold text-red-500">Oops!</h1>
            <p className="text-gray-700 mt-2">{error}</p>
          </div>
        ) : (
          <div className="bg-blue-100 p-6 rounded-lg border border-blue-300 flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-blue-600 mb-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Congrats!</h1>
            <p className="text-gray-700">{message}</p>
          </div>
        )}
        <div className="mt-6">
          <button
            onClick={() => (window.location.href = "/auth/sign-in")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition duration-200"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

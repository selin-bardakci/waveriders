"use client";

import { useRouter } from 'next/navigation';

const EmailVerification = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Invisible Container */}
      <div className="relative w-full max-w-3xl p-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-blue-300 text-center mb-6">
          DONE!
        </h2>

        {/* Description */}
        <div className="bg-blue-50 border-t-4 border-blue-500 rounded-b text-blue-700 px-4 py-6 shadow-md w-full text-center">
          <div className="flex justify-center mb-4">
            {/* Envelope Icon */}
            <svg className="h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="none">
              <path d="M3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2zm18 4l-9 5-9-5v12h18V7z" />
            </svg>
          </div>
          <p className="text-gray-700">
            We have received your application. We will review your Boat Papers within 48 hours and notify you of the result via email. Please check your inbox or spam.
          </p>
        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-8 text-center">
          <button
            type="button"
            className="w-full bg-blue-500 text-white px-10 py-3 text-sm rounded-lg hover:bg-blue-600 transition"
            onClick={() => router.push('/auth/businessDashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

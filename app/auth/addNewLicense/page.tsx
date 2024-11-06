"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UploadBoatLicense = () => {
  const [boatLicense, setBoatLicense] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(2); // Set as step 2

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Show an error if no file is uploaded
    if (!boatLicense) {
      setError('Please upload the boat’s boating license.');
      return;
    }

    setError('');

    // Simulate the upload process and navigate to the next page
    console.log({ boatLicense });

    router.push('/auth/registerCaptain');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Invisible Container */}
      <div className="relative w-full max-w-3xl p-8">
        {/* 2-Step Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${(step / 2) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mb-8">Step {step} of 2</p>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Upload Boat’s Boating License
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload License
            </label>
            {/* Upload Area */}
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 relative"
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setBoatLicense(e.dataTransfer.files[0]);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Icon */}
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-10 h-10 text-blue-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 14s3-4 9-4 9 4 9 4H3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 16h14M8 18h8M10 20h4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9V5l3-2 3 2v4"
                  />
                </svg>
              </div>
              {/* File Selection Area */}
              <div className="mb-4 text-gray-600 text-center">
                <p>Choose a file or drag & drop it here</p>
                <p className="text-xs text-gray-500">JPEG, PNG, PDF formats, up to 50MB</p>
              </div>
              {/* File Selection Button */}
              <div className="mt-4">
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => document.querySelector('input[type="file"]').click()}
                >
                  Choose File
                </button>
              </div>
              {/* Hidden File Input */}
              <input
                type="file"
                accept=".pdf, .jpg, .png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setBoatLicense(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              {/* Upload Feedback */}
              {boatLicense ? (
                <p className="text-sm text-gray-700 mt-2">File Uploaded: {boatLicense.name}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No file uploaded</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* Next Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-10 py-3 text-sm rounded-lg hover:bg-blue-600 transition"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadBoatLicense;

'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UploadBoatLicense = () => {
  const [boatLicense, setBoatLicense] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(3); // Progress tracker

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!boatLicense) {
      setError('Please upload the boat’s boating license.');
      return;
    }

    setError('');

    // Simulate submission and navigate to a success page
    console.log({ boatLicense });

    router.push('/auth/registerCaptain'); // Success page or final confirmation
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/2 flex items-center justify-center">
        <img src="/path/to/your/image.jpg" alt="WaveRiders" className="object-cover h-full w-full" />
      </div>

      <div className="w-1/2 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-white p-8 border border-blue-300 rounded-lg shadow-lg">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-700 mb-8">Step {step} of 5</p>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Upload Boat’s Boating License
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload License
              </label>
              {/* Upload area design */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 relative">
                {/* Cloud Icon */}
                <div className="mb-4">
                  <svg
                    aria-hidden="true"
                    className="w-10 h-10 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16V12a5 5 0 0110 0v4M5 13h14m-6 8v-2m4 2H9"
                    ></path>
                  </svg>
                </div>
                {/* Dashed box for dragging or selecting files */}
                <div className="mb-4 text-gray-600">
                  <p>Choose a file or drag & drop it here</p>
                  <p className="text-xs text-gray-500">JPEG, PNG, PDF formats, up to 50MB</p>
                </div>
                {/* Browse File Button */}
                <input
                  type="file"
                  accept=".pdf, .jpg, .png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setBoatLicense(e.target.files[0]);
                    }
                  }}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
                {/* Upload feedback */}
                {boatLicense ? (
                  <p className="text-sm text-gray-700 mt-2">File Uploaded: {boatLicense.name}</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No file uploaded</p>
                )}
                {/* Browse button */}
                <div className="mt-4">
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                    onClick={() => document.querySelector('input[type="file"]').click()}
                  >
                    Browse File
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-10 py-3 text-sm rounded-lg hover:bg-blue-600 transition"
              >
                Finish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadBoatLicense;

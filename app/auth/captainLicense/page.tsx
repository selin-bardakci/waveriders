'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UploadCaptainLicense = () => {
  const [captainLicense, setCaptainLicense] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(5); // Progress tracker

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!captainLicense) {
      setError('Please upload the captain’s boating license.');
      return;
    }

    setError('');

    // Simulate submission and navigate to a success page
    console.log({ captainLicense });

    router.push('/auth/registrationSuccess'); // Success page or final confirmation
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/2 flex items-center justify-center">
        <img src="/path/to/your/image.jpg" alt="WaveRiders" className="object-cover h-full w-full" />
      </div>

      <div className="w-1/2 flex flex-col items-center justify-center">
        <div className=" w-full max-w-lg bg-white p-8 border border-gray-300 rounded-lg shadow-md">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mb-8">Step {step} of 5</p>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Upload Captain’s Boating License
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload License
              </label>
              <input
                type="file"
                accept=".pdf, .jpg, .png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setCaptainLicense(e.target.files[0]);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

export default UploadCaptainLicense;

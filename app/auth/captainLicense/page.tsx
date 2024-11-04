"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';


const CaptainLicense = () => {
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [registrationPapers, setRegistrationPapers] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(5);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter(); 
  useEffect(() => {
    const storedCaptainId = localStorage.getItem('captain_id');
    if (storedCaptainId) {
      setCaptainId(storedCaptainId);
      console.log("Loaded captain ID:", storedCaptainId);
    } else {
      setError('Captain ID not found. Please complete registration first.');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRegistrationPapers(e.target.files[0]);
      console.log("Selected registration paper file:", e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!registrationPapers) {
      setError('Please upload registration papers');
      return;
    }

    if (!captainId) {
      setError('Captain ID is not available. Please complete registration first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('captain_id', captainId || ''); // Convert captainId to an empty string if it's null
      formData.append('registration_papers', registrationPapers); 

      console.log('Submitting captain license data:', { captain_id: captainId, registration_papers: registrationPapers?.name });

      const response = await axios.post('http://localhost:8081/api/auth/captainLicense', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Registration papers uploaded successfully!');
      router.push('/auth/emailVerification');
      console.log('Captain license upload response:', response.data);
    } catch (err) {
      console.error('Error uploading registration papers:', err);
      setError('Failed to upload registration papers. Please try again.');
    }
  };


  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url(/images/deneme2.jpg)' }} // Update the path as needed
      ></div>

      {/* Registration Container */}
      <div className="relative flex-grow flex items-center justify-end z-10">
        <div className="w-1/3 bg-white p-8 border border-gray-300 rounded-lg shadow-md mr-10">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-700 mb-8">Step {step} of 5</p>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Upload Captain’s Boating License
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload License
              </label>
              {/* Upload area design */}
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 relative"
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setCaptainLicense(e.dataTransfer.files[0]);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* License Icon */}
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
                      d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 7h6M9 11h6m-2 4h-4"
                    />
                  </svg>
                </div>
                {/* Dashed box for dragging or selecting files */}
                <div className="mb-4 text-gray-600 text-center">
                  <p>Choose a file or drag & drop it here</p>
                  <p className="text-xs text-gray-500">JPEG, PNG, PDF formats, up to 50MB</p>
                </div>
                {/* Browse File Button INSIDE the drag-and-drop box */}
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
                      setCaptainLicense(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                {/* Upload feedback */}
                {captainLicense ? (
                  <p className="text-sm text-gray-700 mt-2">File Uploaded: {captainLicense.name}</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No file uploaded</p>
                )}
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

export default UploadCaptainLicense;

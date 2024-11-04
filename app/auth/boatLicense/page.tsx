'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBoatContext } from '../../context/BoatContext';
import axios from 'axios';

const UploadBoatLicense = () => {
  const { boatId, setBoatId, businessId } = useBoatContext(); // Access boatId and setBoatId from context
  const [license, setLicense] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [step] = useState(2); 
  const router = useRouter();

  useEffect(() => {
    // Retrieve and parse boat ID from localStorage on component mount
    const storedBoatId = localStorage.getItem('boat_id');
    console.log('Stored Boat ID:', storedBoatId);

    if (storedBoatId) {
      const parsedBoatId = parseInt(storedBoatId, 10);
      console.log('Parsed Boat ID:', parsedBoatId);

      if (isNaN(parsedBoatId)) {
        setError('Invalid boat ID stored. Please try again.');
      } else {
        setBoatId(parsedBoatId); // Set boat ID in context
      }
    } else {
      setError('Boat ID is not found. Please create a boat first.');
    }
  }, [setBoatId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicense(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!license) {
      setError('Please upload a license file');
      return;
    }

    if (!boatId) {
      setError('Boat ID is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('boat_id', boatId.toString()); // Use parsed boatId
      formData.append('license', license);

      // Send POST request to upload the license
      const response = await axios.post('http://localhost:8081/api/auth/boatLicense', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle success
      setSuccessMessage('License uploaded successfully!');
      console.log('License upload response:', response.data);
      router.push('/auth/registerCaptain'); // Redirect or show success message
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error('Error uploading license:', err.response.data); // Log server error message
          setError(`Failed to upload license: ${err.response.data.message}`);
        } else if (err.request) {
          console.error('Error uploading license (no response):', err.request); // No response from server
          setError('No response from server. Please try again.');
        } else {
          console.error('Error uploading license:', err.message); // General error
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url(/images/deneme2.jpg)' }}  // Update the path as needed
      ></div>

      {/* Registration Container */}
      <div className="relative flex-grow flex items-center justify-end z-10">
        <div className="w-1/3 bg-white p-8 border border-blue-300 rounded-lg shadow-lg mr-10">
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
                {/* Boat Icon */}
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
                      setBoatLicense(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                {/* Upload feedback */}
                {boatLicense ? (
                  <p className="text-sm text-gray-700 mt-2">File Uploaded: {boatLicense.name}</p>
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
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadBoatLicense;

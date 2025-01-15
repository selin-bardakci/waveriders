"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext"; 
import { Loader2 } from 'lucide-react'; // Ensure you have lucide-react installed: npm install lucide-react

const CaptainLicense = () => {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [registrationPapers, setRegistrationPapers] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(5);
  const [successMessage, setSuccessMessage] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false); // Added termsAgreed state
  const { isLoggedIn, isLoading } = useAuth();

  const router = useRouter();

  // **1. Introduce the `saving` state**
  const [saving, setSaving] = useState(false); // Tracks if the form is being submitted

  // Load business ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Access sessionStorage safely in the browser
      const previousPage = sessionStorage.getItem("previousPage");

      if (isLoading) return; // Wait while user status is loading

      if (isLoggedIn) {
        router.push("/");
        return;
      }

      if (previousPage !== "auth/registerCaptain") {
        router.push("/auth/AccountSetup");
      }

      sessionStorage.setItem("previousPage", "auth/captainLicense");

      const storedBusinessId = localStorage.getItem("business_id");
      if (storedBusinessId) {
        setBusinessId(storedBusinessId);
        console.log("Loaded business ID:", storedBusinessId);
      } else {
        setError("Business ID not found. Please complete registration first.");
      }
    }
  }, [router, isLoading, isLoggedIn]);
  
  

  if (isLoggedIn ) {
    return null; 
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (saving) return; // Prevent file selection while saving
    if (e.target.files && e.target.files[0]) {
      setRegistrationPapers(e.target.files[0]);
      console.log('Selected registration paper file:', e.target.files[0]);
    }
  };

  // **2. Modify handleSubmit to manage the `saving` state**
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent submission if already saving
    if (saving) return;

    // Validate form fields
    if (!registrationPapers) {
      setError('Please upload registration papers.');
      return;
    }

    if (!termsAgreed) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    const id = businessId; // Ensure this matches your backend logic (use business_id for captain licenses)

    if (!id) {
      setError('Business ID or Captain ID is not available. Please complete registration first.');
      return;
    }

    // Reset error and success messages
    setError('');
    setSuccessMessage('');

    // **Start the saving process**
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('registration_papers', registrationPapers);

      console.log('Submitting captain license data:', { id, registration_papers: registrationPapers?.name });

      const response = await axios.post('http://localhost:8081/api/auth/captainLicense', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Registration papers uploaded successfully!');
      console.log('Captain license upload response:', response.data);
      router.push('/auth/emailVerification'); // Redirect to the next step
    } catch (err: any) {
      console.error('Error uploading registration papers:', err);
      const errorMessage = err.response?.data?.message || 'Failed to upload registration papers. Please try again.';
      setError(errorMessage);
    } finally {
      // **End the saving process**
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url(/images/deneme2.jpg)' }}
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
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 relative ${
                  saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                onDrop={(e) => {
                  if (saving) return; // Prevent file drops while saving
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setRegistrationPapers(e.dataTransfer.files[0]); // Use setRegistrationPapers here
                  }
                }}
                onDragOver={(e) => {
                  if (saving) return; // Prevent file drags while saving
                  e.preventDefault();
                }}
              >
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
                <div className="mb-4 text-gray-600 text-center">
                  <p>Choose a file or drag & drop it here</p>
                  <p className="text-xs text-gray-500">JPEG, PNG, PDF formats, up to 50MB</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition ${
                      saving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                      if (!saving) {
                        (document.querySelector('input[type="file"]') as HTMLInputElement)?.click();
                      }
                    }}
                    disabled={saving} // **Disable button while saving**
                  >
                    Choose File
                  </button>
                </div>
                <input
                  type="file"
                  accept=".pdf, .jpg, .png"
                  onChange={handleFileChange} // Correctly call handleFileChange here
                  className="hidden"
                  disabled={saving} // **Disable input while saving**
                />
                {/* Upload feedback */}
                {registrationPapers ? (
                  <p className="text-sm text-gray-700 mt-2">File Uploaded: {registrationPapers.name}</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No file uploaded</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="mb-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={() => setTermsAgreed(!termsAgreed)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  disabled={saving} // **Disable checkbox while saving**
                />
                <span className="ml-2 text-gray-700">
                  I agree to the <a href="/terms" className="text-blue-600">terms and conditions</a>
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Success Message */}
            {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

            {/* **3. Modify the Submit Button** */}
            <div className="text-center">
              <button
                type="submit"
                disabled={saving || !termsAgreed} // **Disable button while saving or terms not agreed**
                className={`w-full flex items-center justify-center ${
                  saving || !termsAgreed
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white px-10 py-3 text-sm rounded-lg transition`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {/* Loading Spinner */}
                    Saving...
                  </>
                ) : (
                  'Finish'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CaptainLicense;

'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "../../context/AuthContext"; 
import axios from 'axios';

const emailVerification = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const previousPage = sessionStorage.getItem('previousPage');
    if (isLoading) return; 

    if (isLoggedIn) {
      router.push('/');
      return;
    }

    if (previousPage !== 'auth/captainLicense') {
      router.push('/auth/AccountSetup'); 
    }

  }, [router, isLoading, isLoggedIn]);

  if (isLoggedIn ) {
    return null; 
  }
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
          {/* Title */}
          <h2 className="text-2xl font-bold text-blue-300 text-center mb-6">
            DONE!
          </h2>

          {/* Description */}
          <div className="bg-blue-50 border-t-4 border-blue-500 rounded-b text-blue-700 px-4 py-6 shadow-md w-full text-center">
            <div className="flex justify-center mb-4">
              {/* Simple Envelope Icon */}
              <svg className="h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                <path d="M3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2zm18 4l-9 5-9-5v12h18V7z" />
              </svg>
            </div>
            <p className="text-gray-700">
              We have received your application. We will review your Boat Papers within 48 hours and notify you of the result via email. Please check your inbox or spam.
            </p>
          </div>

          {/* Back to Homepage Button */}
          <div className="mt-8 text-center">
            <button
              type="button"
              className="w-full bg-blue-500 text-white px-10 py-3 text-sm rounded-lg hover:bg-blue-600 transition"
              onClick={() => router.push('/')}
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default emailVerification;

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "../../context/AuthContext"; 
import axios from 'axios';

const RegisterCaptain = () => {
  const [captainName, setCaptainName] = useState('');
  const [captainLastName, setCaptainLastName] = useState('');
  const [captainAge, setCaptainAge] = useState(''); // Date of birth
  const [experience, setExperience] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [businessId, setBusinessId] = useState(''); 
  // Removed registrationPapers as it's handled on another page
  const [step, setStep] = useState(4); // Progress tracker
  const [error, setError] = useState(''); // General Error state
  const [maxBirthDate, setMaxBirthDate] = useState(''); // For restricting date input
  const [successMessage, setSuccessMessage] = useState('');

  // New state variables for individual field errors
  const [captainNameError, setCaptainNameError] = useState('');
  const [captainLastNameError, setCaptainLastNameError] = useState('');
  const [captainPhoneError, setCaptainPhoneError] = useState('');

  const { isLoggedIn, isLoading } = useAuth();
  const previousPage = sessionStorage.getItem('previousPage');

  const router = useRouter();
  
  useEffect(() => {
    if (isLoading) return; // Wait while user status is loading

    if (isLoggedIn) {
      router.push('/');
      return;
    }

    if (previousPage !== 'auth/boatLicense') {
      router.push('/auth/AccountSetup'); 
    }
    sessionStorage.setItem('previousPage', 'auth/registerCaptain');
    
    const storedBusinessId = localStorage.getItem('business_id');
    console.log('Business ID:', storedBusinessId);
    if (storedBusinessId) {
      const parsedBusinessID = parseInt(storedBusinessId, 10);
      console.log('Parsed Business ID:', parsedBusinessID);

      if (isNaN(parsedBusinessID)) {
        setError('Invalid Business ID stored. Please try again.');
      } else {
        setBusinessId(parsedBusinessID.toString()); // Set business ID
      }
    } else {
      setError('Business ID is not found. Please create a Business first.');
    }
  }, [router, isLoading, isLoggedIn]);

  if (isLoggedIn) {
    return null; 
  }

  // Calculate the maximum date allowed (18 years ago from today)
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setMaxBirthDate(`${year}-${month}-${day}`);
  }, []);

  // Validation Functions
  const validateCaptainName = (name: string): string => {
    if (!name.trim()) {
      return "Captain's first name is required.";
    }
    if (/\d/.test(name)) {
      return "First name must not contain numbers.";
    }
    if (name.trim().length < 2) {
      return "First name must be at least 2 characters long.";
    }
    return "";
  };

  const validateCaptainLastName = (lastname: string): string => {
    if (!lastname.trim()) {
      return "Captain's last name is required.";
    }
    if (/\d/.test(lastname)) {
      return "Last name must not contain numbers.";
    }
    if (lastname.trim().length < 2) {
      return "Last name must be at least 2 characters long.";
    }
    return "";
  };

  const validateCaptainPhone = (phone: string): string => {
    if (!phone.trim()) {
      return "Captain's phone number is required.";
    }
    if (!/^0\d{10}$/.test(phone)) {
      return "Invalid phone number. Please enter an 11-digit number starting with 0.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error messages
    setError('');
    setCaptainNameError('');
    setCaptainLastNameError('');
    setCaptainPhoneError('');
    setSuccessMessage('');

    // Perform validations
    const nameError = validateCaptainName(captainName);
    const lastNameError = validateCaptainLastName(captainLastName);
    const phoneError = validateCaptainPhone(captainPhone);

    let hasError = false;

    if (nameError) {
      setCaptainNameError(nameError);
      hasError = true;
    }

    if (lastNameError) {
      setCaptainLastNameError(lastNameError);
      hasError = true;
    }

    if (phoneError) {
      setCaptainPhoneError(phoneError);
      hasError = true;
    }

    if (!captainAge || !experience) {
      setError('Please fill in all captain details.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Format the birthdate from DD.MM.YYYY to YYYY-MM-DD if needed
    // Assuming the input is already in YYYY-MM-DD format since type="date" is used
    const formattedBirthdate = captainAge;

    try {
      const formData = new FormData();
      formData.append('first_name', captainName);
      formData.append('last_name', captainLastName);
      formData.append('experience_years', experience);
      formData.append('phone_number', captainPhone);
      formData.append('date_of_birth', formattedBirthdate); // Append formatted birthdate
      formData.append('business_id', businessId);

      console.log('Submitting captain registration data:', {
        first_name: captainName,
        last_name: captainLastName,
        experience_years: experience,
        phone_number: captainPhone,
        date_of_birth: formattedBirthdate,
        business_id: businessId,
      });

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      const response = await axios.post('http://localhost:8081/api/auth/registerCaptain', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Captain registration successful!');
      console.log('Captain registration response:', response.data);

      localStorage.setItem('captain_id', response.data.captain_id);
      router.push('/auth/captainLicense'); // Redirect to the license upload page
    } catch (err: any) {
      console.error('Error during captain registration:', err);
      setError(err.response?.data?.message || 'Failed to register captain. Please try again.');
    }
  };

  // Allow only numeric input for phone number
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    setCaptainPhone(numericValue);
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
        <div className="w-1/3 bg-white p-8 border border-gray-300 rounded-lg shadow-md mr-10">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mb-8">Step {step} of 5</p>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Tell Us About Your Captain
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Captain's First Name */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Captain's First Name"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                className={`w-full p-3 border ${captainNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {captainNameError && (
                <p className="text-red-500 text-sm mt-1">{captainNameError}</p>
              )}
            </div>

            {/* Captain's Last Name */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Captain's Last Name"
                value={captainLastName}
                onChange={(e) => setCaptainLastName(e.target.value)}
                className={`w-full p-3 border ${captainLastNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {captainLastNameError && (
                <p className="text-red-500 text-sm mt-1">{captainLastNameError}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="mb-4">
              <input
                type="date"
                placeholder="Date of Birth"
                value={captainAge}
                onChange={(e) => setCaptainAge(e.target.value)}
                max={maxBirthDate} // Restrict the date to 18 years ago from today
                className={`w-full p-3 border ${error.includes('Date of birth') ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Years of Experience */}
            <div className="mb-4">
              <input
                type="number"
                placeholder="Years of Experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={`w-full p-3 border ${error.includes('experience') ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Captain's Phone Number */}
            <div className="mb-4">
              <input
                type="tel"
                placeholder="Captain's Phone Number"
                value={captainPhone}
                onChange={handlePhoneChange}
                className={`w-full p-3 border ${captainPhoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                pattern="^0\d{10}$"
                inputMode="numeric"
                maxLength={11}
                title="Please enter an 11-digit phone number starting with 0."
              />
              {captainPhoneError && (
                <p className="text-red-500 text-sm mt-1">{captainPhoneError}</p>
              )}
            </div>

            {/* Removed Registration Papers Section as it's handled on another page */}

            {/* General Error Message */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Success Message */}
            {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

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

export default RegisterCaptain;

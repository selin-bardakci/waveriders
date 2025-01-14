"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext"; 
import { Loader2 } from 'lucide-react'; // Import a loading spinner (ensure you have lucide-react installed)

const RegisterBusiness: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // Removed termsAgreed state
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<number>(1); // Progress tracker
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  // **1. Introduce the `saving` state**
  const [saving, setSaving] = useState<boolean>(false); // Tracks if the form is being submitted

  useEffect(() => {
    if (isLoading) return;

    if (isLoggedIn) {
      router.push('/');
      return;
    }
    sessionStorage.setItem('previousPage', 'auth/registerBusiness');
  }, [router, isLoading, isLoggedIn]);

  if (isLoggedIn) {
    return null;
  }

  // Handler to manage mutual exclusivity between individual and business fields
  const handleFirstNameLastNameChange = (field: 'firstName' | 'lastName', value: string) => {
    // Prevent numbers in names
    if (/\d/.test(value)) {
      setError(`${field === 'firstName' ? 'First Name' : 'Last Name'} cannot contain numbers.`);
      return;
    } else {
      setError('');
    }

    if (field === 'firstName') {
      setFirstName(value);
    } else {
      setLastName(value);
    }
    // Clear business name if first or last name is entered
    if (value) {
      setBusinessName('');
    }
  };

  const handleBusinessNameChange = (value: string) => {
    // Prevent numbers in business name
    if (/\d/.test(value)) {
      setError('Business Name cannot contain numbers.');
      return;
    } else {
      setError('');
    }

    setBusinessName(value);
    // Clear first and last name if business name is entered
    if (value) {
      setFirstName('');
      setLastName('');
    }
  };

  // Password Validation Function
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 7) {
      return 'Password must be at least 7 characters long.';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number.';
    }
    return null;
  };

  const validateForm = (): boolean => {
    // Check if either individual or business information is provided
    if ((!firstName || !lastName) && !businessName) {
      setError('Please provide either First Name and Last Name, or Business Name.');
      return false;
    }

    // Check required fields
    if (!email || !phone || !password) {
      setError('Email, Phone Number, and Password are required.');
      return false;
    }

    // Email Validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email address.');
      return false;
    }

    // Phone number validation: starts with 0 and has exactly 11 digits
    if (!/^0\d{10}$/.test(phone)) {
      setError('Invalid phone number. Please enter an 11-digit number starting with 0.');
      return false;
    }

    // Password Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return false;
    }

    setError('');
    return true;
  };

  // **2. Modify handleSubmit to manage the `saving` state**
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Prevent submission if already saving
    if (saving) return;

    if (!validateForm()) return; // Validate the form

    // **Start the saving process**
    setSaving(true);

    try {
      const response = await axios.post('http://localhost:8081/api/auth/registerBusiness', {
        first_name: firstName || null,
        last_name: lastName || null,
        business_name: businessName || null,
        email,
        phone_number: phone,
        password,
        date_of_birth: '1970-01-01', // Default date of birth
        account_type: 'business' // Assuming account_type is required and set to 'business'
      });

      // Store business_id in localStorage
      const businessId = response.data?.business_id;
      if (businessId !== undefined) {
        localStorage.setItem('business_id', businessId.toString());
        console.log('Business ID successfully stored in localStorage:', businessId);
      } else {
        console.error('Business ID not found in response:', response.data);
        alert("Invalid business ID stored. Please try again.");
      }

      // Navigate to the next step
      router.push('/auth/registerBoat');  // Example of next step
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred during registration. Please try again.';
      setError(errorMessage);
    } finally {
      // **End the saving process**
      setSaving(false);
    }
  };

  // Allow only numeric input for phone number
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    setPhone(numericValue);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url(/images/deneme2.jpg)' }}
      ></div>

      {/* Navigation Bar Placeholder (if needed) */}
      <nav className="z-10 bg-white shadow-md">
        {/* Add your navigation bar content here */}
      </nav>

      {/* Registration Container */}
      <div className="relative flex-grow flex items-center justify-end z-10">
        <div className="w-full max-w-lg bg-white p-8 border border-gray-300 rounded-lg shadow-md mr-10">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mb-8">Step {step} of 5</p>

          {/* Registration Form */}
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Register as a Business
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Individual Information Section */}
            <div className={`p-4 mb-6 border rounded-lg bg-blue-50 border-blue-500 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {/* First Name Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => handleFirstNameLastNameChange('firstName', e.target.value)}
                  disabled={!!businessName || saving} // Disable if business name is entered or saving
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Last Name Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => handleFirstNameLastNameChange('lastName', e.target.value)}
                  disabled={!!businessName || saving} // Disable if business name is entered or saving
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* OR separator */}
              <div className="text-center font-bold text-gray-700 mb-4">OR</div>

              {/* Business Name Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Business Name"
                  value={businessName}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  disabled={!!firstName || !!lastName || saving} // Disable if first or last name is entered or saving
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={saving} // Disable if saving
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone Number Input */}
            <div className="mb-4">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={handlePhoneChange}
                pattern="^0\d{10}$"
                inputMode="numeric"
                maxLength={11}
                disabled={saving} // Disable if saving
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  /^0\d{10}$/.test(phone) || phone === ''
                    ? 'border-gray-300 focus:ring-blue-500'
                    : 'border-red-500 focus:ring-red-500'
                }`}
                title="Please enter an 11-digit phone number starting with 0."
              />
              {/* Inline Phone Validation Message */}
              {!/^0\d{10}$/.test(phone) && phone !== '' && (
                <p className="text-red-500 text-sm mt-1">Phone number must start with 0 and be exactly 11 digits.</p>
              )}
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={saving} // Disable if saving
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  validatePassword(password) && password !== ''
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {/* Password Requirements */}
              <div className="mt-2 text-sm text-gray-600">
                Password must be at least 7 characters long, contain at least one uppercase letter, and one number.
              </div>
              {/* Inline Password Validation Message */}
              {validatePassword(password) && password !== '' && (
                <p className="text-red-500 text-sm mt-1">{validatePassword(password)}</p>
              )}
            </div>

          
            {/* Error Message */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={saving} // Disabled only when saving
                className={`w-full flex items-center justify-center text-white px-10 py-3 text-sm rounded-lg transition ${
                  saving
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Placeholder (if needed) */}
      <footer className="z-10 bg-white shadow-md mt-auto">
        {/* Add your footer content here */}
      </footer>
    </div>
  );
};

export default RegisterBusiness;

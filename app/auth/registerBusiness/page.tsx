"use client";

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BusinessProvider } from '../../context/BusinessContext';
import { useAuth } from "../../context/AuthContext";


const RegisterBusiness = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Progress tracker
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

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
  const handleFirstNameLastNameChange = (field: string, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validation
    if ((!firstName || !lastName) && !businessName) {
      setError('Please provide either First Name and Last Name, or Business Name.');
      return;
    }

    if (!email || !phone || !password) {
      setError('Email, Phone Number, and Password are required.');
      return;
    }

    // Password Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!termsAgreed) {
      setError('You must agree to the terms and conditions to proceed.');
      return;
    }

    setError('');

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
      //store business_id in context
      const businessId = response.data?.business_id;
      if (businessId !== undefined) {
        localStorage.setItem('business_id', businessId.toString());
        console.log('Business ID successfully stored in localStorage:', businessId);
      } else {
        console.error('Business ID not found in response:', response.data);
        alert("Invalid business ID stored. Please try again.");
      }


      // Simulate submission and navigate to the next step
      console.log({
        firstName, lastName, businessName, email, phone, password, termsAgreed
      });

      // Navigate to the next step
      router.push('/auth/registerBoat');  // Example of next step
    } catch (error) {
      setError('An error occurred during registration. Please try again.');
    }
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
        <div className="w-1/3 bg-white p-8 border border-gray-300 rounded-lg shadow-md mr-10">
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

          {/* First Name, Last Name, or Business Name Box */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 mb-6 border border-blue-500 bg-blue-50 rounded-lg">
              {/* First Name Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => handleFirstNameLastNameChange('firstName', e.target.value)}
                  disabled={!!businessName} // Disable if business name is entered
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
                  disabled={!!businessName} // Disable if business name is entered
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
                  disabled={!!firstName || !!lastName} // Disable if first or last name is entered
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone Number Input */}
            <div className="mb-4">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${validatePassword(password) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
              />
              {/* Password Requirements */}
              <div className="mt-2 text-sm text-gray-600">
                Password must be at least 7 characters long, contain at least one uppercase letter, and one number.
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
                />
                <span className="ml-2 text-gray-700">
                  I agree to the <a href="/terms" className="text-blue-600">terms and conditions</a>
                </span>
              </label>
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

      {/* Footer Placeholder (if needed) */}
      <footer className="z-10 bg-white shadow-md mt-auto">
        {/* Add your footer content here */}
      </footer>
    </div>
  );
};

export default RegisterBusiness;

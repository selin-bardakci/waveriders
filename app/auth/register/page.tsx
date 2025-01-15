"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Ensure you have lucide-react installed: npm install lucide-react

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [lastname, setLastName] = useState('');
  const [birthdate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [maxBirthDate, setMaxBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [buttonText, setButtonText] = useState('Register'); 
  const router = useRouter();

  // **1. Introduce the `saving` state**
  const [saving, setSaving] = useState(false); // Tracks if the form is being submitted

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');
    setMaxBirthDate(`${year}-${month}-${day}`);
  }, []);

  const validateForm = () => {
    if (!name || !lastname || !birthdate || !email || !password || !phone) {
      setError('All fields are required.');
      return false;
    }
    if (/\d/.test(name)) {
      setError('First name must not contain numbers.');
      return false;
    }
    if (/\d/.test(lastname)) {
      setError('Last name must not contain numbers.');
      return false;
    }
    if (name.trim().length < 2) {
      setError('First name must be at least 2 characters long.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    // Validate birthdate format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      setError('Invalid birthdate. Please use the format YYYY-MM-DD.');
      return false;
    }
    // Phone number validation: starts with 0 and has exactly 11 digits
    if (!/^0\d{10}$/.test(phone)) {
      setError('Invalid phone number. Please enter an 11-digit number starting with 0.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); // Reset error message
    setSuccessMessage(''); // Reset success message

    // **Prevent submission if already saving**
    if (saving) return;

    if (!isChecked) {
      setError('You must accept the terms.');
      return;
    }

    if (!validateForm()) return; // Validate the form

    // Format birthdate from DD.MM.YYYY to YYYY-MM-DD if needed
    // Assuming the input is already in YYYY-MM-DD format since type="date" is used
    const formattedBirthdate = birthdate;

    try {
      // **Start the saving process**
      setSaving(true);
      setButtonText('Check your e-mail');

      const response = await axios.post('https://api.waveriders.com.tr/api/auth/signup', {
        name,
        lastname,
        email,
        password,
        phone,
        birthdate: formattedBirthdate,
        account_type: 'customer'
      });

      setSuccessMessage('Registration successful. A verification email has been sent.');
      console.log('Registration response:', response.data);

      // Optional: Redirect after successful registration (e.g., to a welcome page)
      // router.push('/welcome');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setButtonText('Register');
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
    <div className="relative min-h-screen flex">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url(/images/registerPhoto.png)' }}
      ></div>

      {/* Registration Container on the right */}
      <div className="relative w-full flex justify-end items-center z-10">
        <div className="w-full max-w-lg bg-white p-8 border border-gray-300 rounded-lg shadow-md mr-10">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Register as a Customer
          </h2>

          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="First Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving} // Disable input while saving
              />
            </div>

            {/* Last Name */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Last Name"
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving} // Disable input while saving
              />
            </div>

            {/* Birthdate */}
            <div className="mb-4">
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={maxBirthDate} // Restrict the date to 18 years ago from today
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving} // Disable input while saving
              />
            </div>

            {/* Email Address */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving} // Disable input while saving
              />
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={handlePhoneChange}
                pattern="^0\d{10}$"
                inputMode="numeric"
                maxLength={11}
                title="Please enter an 11-digit phone number starting with 0."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving} // Disable input while saving
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving} // Disable input while saving
              />
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  disabled={saving} // Disable checkbox while saving
                />
                <span className="ml-2 text-gray-700">
                  I accept the <a href="/terms" className="text-blue-600">Terms and Conditions</a>.
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Success Message */}
            {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={saving || !isChecked || successMessage} // Buton tıklanamaz olacak
                className={`w-full flex items-center justify-center ${saving || !isChecked || successMessage
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                  } text-white px-10 py-3 text-sm rounded-lg transition`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {/* Loading Spinner */}
                    Saving...
                  </>
                ) : successMessage ? (
                  'Check your e-mail' 
                ) : (
                  'Register'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();


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
    if (name.length < 2 ) {
      setError('First name must be at least 2 characters long.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      setError('Invalid birthdate. Please use the format DD-MM-YYYY.');
      return false;
    }
    if(!/^\d{11}$/.test(phone)) {
      setError('Invalid phone number. Please use a 10-digit number.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email address.');
      return false
    }

    return true;
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); // Reset error message
  
    if (!isChecked) {
      setError('You must accept the terms.');
      return;
    }
  
    if (!validateForm()) return; // Validate the form
  
    // Format birthdate from DD.MM.YYYY to YYYY-MM-DD
    const formattedBirthdate = birthdate.split('.').reverse().join('-');
  
    try {
     
      const response = await axios.post('http://localhost:8081/api/auth/signup', {
        name,
        lastname,
        email,
        password,
        phone, 
        birthdate: formattedBirthdate, 
        account_type: 'customer'
      });
      
      setSuccessMessage('Registration successful. A verification email has been sent.');
      router.push('/auth/sign-in');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    }
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
            <div className="mb-4">
              <input
                type="text"
                placeholder="First Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Last Name"
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={maxBirthDate}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-gray-700">
                  I accept the terms. <a href="/terms" className="text-blue-600">Terms and Conditions</a>
                </span>
              </label>
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

            <div className="text-center">
              <button
                type="submit"
                className={`w-full ${isChecked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300'} text-white px-10 py-3 text-sm rounded-lg transition`}
                disabled={!isChecked}
              >
                Register
            </button>
           </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const RegisterCaptain = () => {
  const [captainName, setCaptainName] = useState('');
  const [captainLastName, setCaptainLastName] = useState('');
  const [captainAge, setCaptainAge] = useState(''); // This will be the actual date of birth input
  const [experience, setExperience] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [businessId, setBusinessId] = useState(''); 
  const [registrationPapers, setRegistrationPapers] = useState<File | null>(null);
  const [step, setStep] = useState(4); // Progress tracker
  const [error, setError] = useState(''); // Error state
  const [maxBirthDate, setMaxBirthDate] = useState(''); // For restricting date input
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  // Calculate the maximum date allowed (18 years ago from today)
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setMaxBirthDate(`${year}-${month}-${day}`);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRegistrationPapers(e.target.files[0]);
      console.log("Selected registration paper file:", e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captainName || !captainLastName || !captainAge || !experience || !captainPhone) {
      setError('Please fill in all captain details.');
      return;
    }

    // Format the birthdate from DD.MM.YYYY to YYYY-MM-DD
    const formattedBirthdate = captainAge.split('.').reverse().join('-');

    try {
      const formData = new FormData();
      formData.append('first_name', captainName);
      formData.append('last_name', captainLastName);
      formData.append('experience_years', experience);
      formData.append('phone_number', captainPhone);
      formData.append('date_of_birth', formattedBirthdate); // Append formatted birthdate
      formData.append('business_id', businessId);

      if (registrationPapers) {
        formData.append('registration_papers', registrationPapers);
      }

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
    } catch (err) {
      console.error('Error during captain registration:', err);
      setError('Failed to register captain. Please try again.');
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
            <div className="mb-4">
              <input
                type="text"
                placeholder="Captain's First Name"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Captain's Last Name"
                value={captainLastName}
                onChange={(e) => setCaptainLastName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="date"
                placeholder="Date of Birth"
                value={captainAge}
                onChange={(e) => setCaptainAge(e.target.value)}
                max={maxBirthDate} // Restrict the date to 18 years ago from today
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="number"
                placeholder="Years of Experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="tel"
                placeholder="Captain's Phone Number"
                value={captainPhone}
                onChange={(e) => setCaptainPhone(e.target.value)}
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

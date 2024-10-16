'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RegisterCaptain = () => {
  const [captainName, setCaptainName] = useState('');
  const [captainLastName, setCaptainLastName] = useState('');
  const [captainAge, setCaptainAge] = useState('');
  const [experience, setExperience] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [step, setStep] = useState(4); // Progress tracker
  const [error, setError] = useState(''); // Error state

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!captainName || !captainLastName || !captainAge || !experience || !captainPhone) {
      setError('Please fill in all captain details.');
      return;
    }

    setError('');

    // Simulate submission and navigate to the next step
    console.log({ captainName, captainLastName, captainAge, experience, captainPhone });

    router.push('/auth/captainLicense'); // Next step: Upload Captain's Boating License
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/2 flex items-center justify-center">
        <img src="/path/to/your/image.jpg" alt="WaveRiders" className="object-cover h-full w-full" />
      </div>

      <div className="w-1/2 flex flex-col items-center justify-center">
        <div className=" w-full max-w-lg bg-white p-8 border border-gray-300 rounded-lg shadow-md">
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
                placeholder="Age"
                value={captainAge}
                onChange={(e) => setCaptainAge(e.target.value)}
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

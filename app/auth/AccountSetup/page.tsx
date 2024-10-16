'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import router

const AccountSetup = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize router

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
  };

  // Mark handleSubmit as async to use await inside it
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Selected option:', selectedOption);

    try {
        if (selectedOption === 'customer') {
          router.push('/auth/register');
        } else if (selectedOption === 'business') {
          router.push('/auth/registerBusiness');
        }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 border border-gray-300 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl text-gray-800">Set up your WaveRiders account</h2>
          <p className="text-gray-600">Choose the option that best describes you</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Option 1: Customer */}
          <div className="mb-4">
            <label className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="customer"
                checked={selectedOption === 'customer'}
                onChange={handleOptionChange}
                className="form-radio h-4 w-4 text-blue-500 transition duration-150 ease-in-out mr-3"
              />
              <span className="text-gray-800">I'm a customer looking to rent a boat</span>
            </label>
          </div>

          {/* Option 2: Business */}
          <div className="mb-6">
            <label className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="business"
                checked={selectedOption === 'business'}
                onChange={handleOptionChange}
                className="form-radio h-4 w-4 text-blue-500 transition duration-150 ease-in-out mr-3"
              />
              <span className="text-gray-800">I'm a business looking to rent out my boat</span>
            </label>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* Continue Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={!selectedOption}
              className="w-full bg-blue-500 text-white px-10 py-3 text-sm rounded-lg hover:bg-blue-600 transition"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSetup;

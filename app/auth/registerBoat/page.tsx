'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
const ports = [
  'Port of Antwerp',
  'Port of Zeebrugge',
  'Port of Rotterdam',
  'Port of Hamburg',
  'Port of Barcelona',
  'Port of Lisbon'
];

const tripTypes = [
  { id: 1, name: 'Short Trips', description: '1–2 hours', image: '/images/icon1.png' },
  { id: 2, name: 'Day Trips', description: '3–6 hours', image: '/images/icon2.png' },
  { id: 3, name: 'Sunrise & Sunset Trips', description: '7–12 hours', image: '/images/icon3.png' },
  { id: 4, name: 'Overnight Adventures', description: '1+ days', image: '/images/icon4.png' }
];

const RegisterBoat = () => {
  const [port, setPort] = useState('');
  const [boatName, setBoatName] = useState('');
  const [boatType, setBoatType] = useState('');
  const [business_id, setBusinessId] = useState<number | null>(null);
  const [boatDescription, setBoatDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');
  const [rentalPricePerDay, setRentalPricePerDay] = useState(''); // New rental price per day state
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<number[]>([]); // For trip selection
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState(''); // Add error state
  const [step] = useState(2); // Progress tracker

  const router = useRouter();

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length > 10) {
      setError('You can upload a maximum of 10 files.');
      return;
    }
    setPhotos(fileArray);
    setError('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleTripSelection = (tripId: number) => {
    setSelectedTrips((prev) =>
      prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId]
    );

  };
  
  useEffect(() => {
    const storedbusinessid = localStorage.getItem('business_id');
    if (storedbusinessid) {
      const parsedBusinessID = parseInt(storedbusinessid, 10);
      if (!isNaN(parsedBusinessID)) {
        setBusinessId(parsedBusinessID);
        console.log("Business ID retrieved from localStorage:", parsedBusinessID);
      } else {
        setError("Invalid Business ID stored. Please try again.");
      }
    } else {
      setError("Business ID is not found. Please create a Business first.");
    }
  }, []);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validation
    if (!boatName || !boatDescription || !port) {
      setError('All fields are required.');
      return;
    }
    if (selectedTrips.length === 0) {
      setError('Please select at least one type of trip.');
      return;
    }
    if (!boatType) {
      setError('Please select a boat type.');
      return;
    }
    if (!maxCapacity || isNaN(Number(maxCapacity)) || Number(maxCapacity) <= 0) {
      setError('Please enter a valid max capacity.');
      return;
    }
    if (!rentalPrice || isNaN(Number(rentalPrice)) || Number(rentalPrice) <= 0) {
      setError('Please enter a valid rental price.');
      return;
    }
    if (photos.length === 0) {
      setError('Please upload at least 1 photo.');
      return;
    }
    if (!termsAgreed) {
      setError('You must agree to the terms and conditions.');
      return;
    }
  
    if (!business_id) {
      setError('Business ID is required. Please ensure you have registered a business.');
      return;
    }
  
    // Reset error state
    setError('');
  
    // Prepare FormData
    const formData = new FormData();
    formData.append('business_id', business_id.toString()); // Ensure business_id is added
    formData.append('boat_name', boatName);
    formData.append('description', boatDescription);
    formData.append('trip_types', JSON.stringify(selectedTrips));
    formData.append('price_per_hour', rentalPrice);
    if (rentalPricePerDay) formData.append('price_per_day', rentalPricePerDay);
    formData.append('capacity', maxCapacity);
    formData.append('boat_type', boatType);
    formData.append('location', port);
    photos.forEach((photo) => formData.append('photos', photo));
  
    try {
      console.log('FormData contents:', {
        business_id,
        boatName,
        boatDescription,
        selectedTrips,
        rentalPrice,
        rentalPricePerDay,
        maxCapacity,
        boatType,
        port,
        photos,
      });
  
      const response = await axios.post('http://localhost:8081/api/auth/registerBoat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('API Response:', response.data);
  
      const boatId = response.data?.boat?.boat_id || response.data?.boat_id;
      if (boatId) {
        localStorage.setItem('boat_id', boatId.toString());
        console.log('Boat ID successfully stored:', boatId);
      } else {
        console.warn('Boat ID not returned in response.');
      }
  
      router.push('/auth/boatLicense');
    } catch (err) {
      console.error('Error during boat registration:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
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
            Register Boat Details
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Boat Name Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Boat Name"
                value={boatName}
                onChange={(e) => setBoatName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Boat Type Dropdown */}
            <div className="mb-4">
              <select
                value={boatType}
                onChange={(e) => setBoatType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a boat type</option>
                <option value="boat">Boat</option>
                <option value="yacht">Yacht</option>
              </select>
            </div>

            {/* Boat Description Input */}
            <div className="mb-4">
              <textarea
                placeholder="Boat Description"
                value={boatDescription}
                onChange={(e) => setBoatDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Capacity Input */}
            <div className="mb-4">
              <input
                type="number"
                placeholder="Max Capacity (Number of people)"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Rental Price per Hour Input */}
            <div className="mb-4">
              <input
                type="number"
                placeholder="Rental Price per Hour (₺)"
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Port Selection Dropdown */}
            <div className="mb-6">
              <select
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a port</option>
                {ports.map((port) => (
                  <option key={port} value={port}>
                    {port}
                  </option>
                ))}
              </select>
            </div>

            {/* Trip Type Selection */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Trip Types</h3>
            <div className="mb-6">
              {tripTypes.map((trip) => (
                <label key={trip.id} className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={selectedTrips.includes(trip.id)}
                    onChange={() => handleTripSelection(trip.id)}
                    className="mr-2"
                  />
                  <div className="flex items-center space-x-3">
                    <img src={trip.image} alt={trip.name} className="w-10 h-10" />
                    <div>
                      <p className="text-lg font-bold">{trip.name}</p>
                      <p className="text-sm text-gray-600">{trip.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>


            {/* Conditional Rental Price per Day Input */}
            {selectedTrips.includes(4) && (
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Rental Price per Day (₺)"
                  value={rentalPricePerDay}
                  onChange={(e) => setRentalPricePerDay(e.target.value)}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* File Upload Section */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Boat Photos (1-10 photos)
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {/* Camera Icon */}
                <svg className="h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h2l2-2h10l2 2h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>

                <p className="mt-2 text-gray-500">Drag & drop your files here</p>
                <p className="text-xs text-gray-400">JPEG, PNG formats, up to 50MB</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                  className="mt-2 bg-blue-500 text-white rounded-lg px-3 py-2 hover:bg-blue-600 transition"
                >
                  Choose a file
                </button>
              </div>

              {/* File List */}
              {photos.length > 0 && (
                <div className="mt-4">
                  <ul className="list-disc list-inside text-sm">
                    {photos.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Error Message */}
              {error && <p className="text-red-500 text-center mt-4">{error}</p>}
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

export default RegisterBoat;

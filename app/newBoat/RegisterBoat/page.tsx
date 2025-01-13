'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";


const tripTypes = [
  { id: 1, name: 'Short Trips', description: '1–2 hours', image: '/images/short.png' },
  { id: 2, name: 'Day Trips', description: '3–6 hours', image: '/images/day.png' },
  { id: 3, name: 'Sunrise & Sunset Trips', description: '7–12 hours', image: '/images/sunrise.png' },
  { id: 4, name: 'Overnight Adventures', description: '1+ days', image: '/images/overnight.png' }
];

// Ports data
const ports = [
  'Port of Aliağa', 'Port of Alidaş', 'Port of Altıntel', 'Port of Ambarlı', 'Port of Anamur',
  'Port of Antalya', 'Port of Ayvalık', 'Port of Bandırma', 'Port of Bartın', 'Port of Bodrum',
  'Port of Botaş(Ceyhan)', 'Port of Büyükdere', 'Port of Çanakkale', 'Port of Çeşme', 'Port of Derince',
  'Port of Dikili', 'Port of Edremit', 'Port of Fethiye', 'Port of Filyos', 'Port of Finike',
  'Port of Gemlik', 'Port of Giresun', 'Port of Güllük', 'Port of Haydarpaşa', 'Port of Hopa',
  'Port of İnebolu', 'Port of İskenderun', 'Port of İstanbul', 'Port of İzmir', 'Port of İzmit',
  'Port of Karadeniz Ereğli', 'Port of Karaköy', 'Port of Karasu', 'Port of Kuşadası', 'Port of Marmaris',
  'Port of Mersin', 'Port of Nemrut', 'Port of Ordu', 'Port of Ortadoğu', 'Port of Rize',
  'Port of Samsun', 'Port of Sinop', 'Port of Taşucu', 'Port of Tekirdağ', 'Port of Trabzon',
  'Port of Tuzla', 'Port of Yeşilovacık Medcem', 'Port of Zeytinburnu', 'Port of Zonguldak'
];

const AddNewBoatAndLicense = () => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const [port, setPort] = useState('');
  const [boatName, setBoatName] = useState('');
  const [boatType, setBoatType] = useState('');
  const [boatDescription, setBoatDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');
  const [rentalPricePerDay, setRentalPricePerDay] = useState(''); // New rental price per day state
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<number[]>([]); // For trip selection
  const [termsAgreed] = useState(false);
  const [error, setError] = useState(''); // Add error state
  const [license, setLicense] = useState<File | null>(null); 
  const [business_id, setBusinessId] = useState<number | null>(null); // Declare state for license file
  // const [step] = useState(2); // Progress tracker

  const router = useRouter();
  useEffect(() => {
    const checkAccessAndFetchBusinessId = async () => {
      if (isLoading) return;

      if (!isLoggedIn) {
        router.push('/auth/sign-in'); // Giriş yapılmadıysa yönlendir
        return;
      }

      if (user?.account_type !== 'business') {
        router.push('/'); // Business olmayan kullanıcıları yönlendir
        return;
      }

      try {
        if (user?.id) {
          const response = await axios.get(`http://localhost:8081/api/newBoat/${user.id}`);
          setBusinessId(response.data.business_id);
        }
      } catch (error) {
        console.error('Error fetching business ID:', error);
        setError('Error fetching business ID.');
      }
    };

    checkAccessAndFetchBusinessId();
  }, [isLoading, isLoggedIn, user, router]);

  if (isLoading || !isLoggedIn || user?.account_type !== 'business') {
    // Yükleniyor ekranı ya da yönlendirme kontrolü sırasında hiçbir şey render edilmez
    return null;
  }

  if (isLoading) {
    return <p>Loading...</p>; // Yükleniyor ekranı
  } 



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

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate license and other fields
    if (!license) {
      setError('Please upload a license file');
      return;
    }
  
    // Validation for other fields
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
  
    if (!business_id) {
      setError('Business ID is required.');
      return;
    }

     if (selectedTrips.includes(4) && !rentalPricePerDay) {
      setError('Please enter the price per day for overnight trips.');
      return;

    }
    setError(''); // Reset error state
  
    // Prepare FormData
    const formData = new FormData();
    formData.append('business_id', business_id.toString());
    formData.append('boat_name', boatName);
    formData.append('description', boatDescription);
    formData.append('trip_types', JSON.stringify(selectedTrips));
    formData.append('price_per_hour', rentalPrice);
    if (rentalPricePerDay) formData.append('price_per_day', rentalPricePerDay);
    formData.append('capacity', maxCapacity);
    formData.append('boat_type', boatType);
    formData.append('location', port);
    photos.forEach((photo) => formData.append('photos', photo));
    if (license) formData.append('license', license);  // Add license file to FormData
  

    try {
      const response = await axios.post('http://localhost:8081/api/newBoat/registerBoat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      const boatId = response.data?.boat?.boat_id || response.data?.boat_id;
      if (boatId) {
        localStorage.setItem('boat_id', boatId.toString());
      } else {
        console.warn('Boat ID not returned in response.');
      }
      
      window.location.href = '/newBoat/emailVerification';

    } catch (err) {
      console.error('Error during boat registration:', err);
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicense(e.target.files[0]);
    }
  };

  return (
   <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: 'url(/images/deneme2.jpg)' }}></div>

      {/* Navigation Bar Placeholder */}
      <nav className="z-10 bg-white shadow-md"></nav>

      {/* Boat and License Registration */}
      <div className="relative flex-grow flex items-center justify-end z-10">
        <div className="w-1/3 bg-white p-8 border border-gray-300 rounded-lg shadow-md mr-10">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Register Boat Details and Upload License
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Boat Registration Form Fields */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Boat Name"
                value={boatName}
                onChange={(e) => setBoatName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Boat Type Selection */}
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

            {/* Boat Description */}
            <div className="mb-4">
              <textarea
                placeholder="Boat Description"
                value={boatDescription}
                onChange={(e) => setBoatDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Capacity */}
            <div className="mb-4">
              <input
                type="number"
                placeholder="Max Capacity"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Rental Price per Hour */}
            <div className="mb-4">
              <input
                type="number"
                placeholder="Rental Price per Hour"
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price per Day (only for overnight trips) */}
            {selectedTrips.includes(4) && (
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Rental Price per Day"
                  value={rentalPricePerDay}
                  onChange={(e) => setRentalPricePerDay(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Port Selection */}
            <div className="mb-6">
              <select
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a Port</option>
                {ports.map((portName) => (
                  <option key={portName} value={portName}>
                    {portName}
                  </option>
                ))}
              </select>
            </div>

            {/* Trip Types */}
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

            {/* Boat Photos Upload Section */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Boat Photos (1-10 photos)
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
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
            </div>

            {/* Boat License Upload Section */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Boat License
              </label>

              <div className="mt-4">
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => (document.querySelector('#boat-license-input') as HTMLInputElement)?.click()}
                >
                  Choose File
                </button>

                {/* Hidden file input for boat license */}
                <input
                  type="file"
                  id="boat-license-input"  // Use a unique ID for boat license
                  accept=".pdf, .jpg, .png"
                  onChange={handleLicenseChange}  // Handle the license change event
                  className="hidden"
                />
              </div>

              {/* Upload feedback */}
              {license ? (
                <p className="text-sm text-gray-700 mt-2">File Uploaded: {license.name}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No file uploaded</p>
              )}
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-10 py-3 text-sm rounded-lg hover:bg-blue-600 transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewBoatAndLicense;

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const tripTypes = [
  { id: 1, name: 'Short Trips', description: '1–2 hours' },
  { id: 2, name: 'Day Trips', description: '3–6 hours' },
  { id: 3, name: 'Sunrise & Sunset Trips', description: '7–12 hours' },
  { id: 4, name: 'Overnight Adventures', description: '1+ days' }
];

const ports = [
  'Port of Aliağa', 'Port of Alidaş', 'Port of Altıntel', 'Port of Ambarlı',
  'Port of Antalya', 'Port of Ayvalık', 'Port of Bandırma', 'Port of Bodrum',
  // Add other ports as needed
];

export default function EditBoatListing() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    boat_name: '',
    description: '',
    boat_type: '',
    location: '',
    capacity: '',
    price_per_hour: '',
    price_per_day: '',
    trip_types: [] as number[],
  });
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [license, setLicense] = useState<File | null>(null);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8081/api/boats/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const boat = response.data.boat;
        setFormData({
            boat_name: boat?.boat_name || '',
            description: boat?.description || '',
            boat_type: boat?.boat_type || '',
            location: boat?.location || '',
            capacity: boat?.capacity ? boat.capacity.toString() : '',
            price_per_hour: boat?.price_per_hour ? boat.price_per_hour.toString() : '',
            price_per_day: boat?.price_per_day?.toString() || '',
            trip_types: boat?.trip_types?.split(',').map((type: string) => {
              const tripType = tripTypes.find(t => t.name.toLowerCase() === type);
              return tripType ? tripType.id : null;
            }).filter(Boolean) || [],
          });
        setCurrentPhotos(Array.isArray(boat.photos) ? boat.photos : JSON.parse(boat.photos || '[]'));
      } catch (err) {
        console.error('Error fetching boat details:', err);
        setError('Failed to load boat details');
      } finally {
        setLoading(false);
      }
    };

    fetchBoatDetails();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTripTypeToggle = (tripId: number) => {
    setFormData(prev => ({
      ...prev,
      trip_types: prev.trip_types.includes(tripId)
        ? prev.trip_types.filter(id => id !== tripId)
        : [...prev.trip_types, tripId]
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      if (fileList.length > 10) {
        setError('Maximum 10 photos allowed');
        return;
      }
      setPhotos(fileList);
    }
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLicense(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'trip_types') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      // Append files if they exist
      photos.forEach(photo => {
        formDataToSend.append('photos', photo);
      });

      if (license) {
        formDataToSend.append('license', license);
      }

      await axios.put(`http://localhost:8081/api/boats/${params.id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/');
    } catch (err) {
      console.error('Error updating boat:', err);
      setError('Failed to update boat listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Boat Listing</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Boat Name</label>
            <input
              type="text"
              name="boat_name"
              value={formData.boat_name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Boat Type</label>
              <select
                name="boat_type"
                value={formData.boat_type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select type</option>
                <option value="yacht">Yacht</option>
                <option value="boat">Boat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select port</option>
                {ports.map(port => (
                  <option key={port} value={port}>{port}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price per Hour</label>
              <input
                type="number"
                name="price_per_hour"
                value={formData.price_per_hour}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trip Types</label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {tripTypes.map(trip => (
                <label key={trip.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.trip_types.includes(trip.id)}
                    onChange={() => handleTripTypeToggle(trip.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{trip.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Photos</label>
            <div className="mt-2 grid grid-cols-5 gap-4">
              {currentPhotos.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Boat photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Update Photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Update License</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleLicenseChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

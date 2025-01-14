"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";

const tripTypes = [
  { id: 1, name: 'Short Trips', description: '1–2 hours' },
  { id: 2, name: 'Day Trips', description: '3–6 hours' },
  { id: 3, name: 'Sunrise & Sunset Trips', description: '7–12 hours' },
  { id: 4, name: 'Overnight Adventures', description: '1+ days' },
];

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
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8081/api/boats/${params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const boat = response.data.boat;

        // Map database trip types back to IDs
        const tripTypeMap: Record<string, number> = {
          short: 1,
          day: 2,
          sunrise: 3,
          overnight: 4,
        };

        // boat.trip_types might be "short, day" or similar
        const mappedTripTypes = boat?.trip_types
          ? boat.trip_types
              .split(',')
              .map((type: string) => tripTypeMap[type.trim()])
              .filter(Boolean)
          : [];

        setFormData({
          boat_name: boat?.boat_name || '',
          description: boat?.description || '',
          boat_type: boat?.boat_type || '',
          location: boat?.location || '',
          capacity: boat?.capacity ? boat.capacity.toString() : '',
          price_per_hour: boat?.price_per_hour
            ? boat.price_per_hour.toString()
            : '',
          price_per_day: boat?.price_per_day
            ? boat.price_per_day.toString()
            : '',
          trip_types: mappedTripTypes,
        });

        // Parse photos (DB might store them as JSON array or array in DB)
        // Adjust this if your API returns them differently
        setCurrentPhotos(
          Array.isArray(boat.photos)
            ? boat.photos
            : JSON.parse(boat.photos || '[]')
        );
      } catch (err) {
        console.error('Error fetching boat details:', err);
        setError('Failed to load boat details');
      } finally {
        setLoading(false);
      }
    };

    fetchBoatDetails();
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTripTypeToggle = (tripId: number) => {
    setFormData((prev) => ({
      ...prev,
      trip_types: prev.trip_types.includes(tripId)
        ? prev.trip_types.filter((id) => id !== tripId)
        : [...prev.trip_types, tripId],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Append all form fields except photos (if no new photos, we leave it unchanged)
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'trip_types') {
          // Convert array of IDs to JSON string
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      // If user did NOT select "Overnight Adventures" (ID = 4), remove price_per_day
      if (!formData.trip_types.includes(4)) {
        formDataToSend.delete('price_per_day');
      }

      // Append files if they exist
      photos.forEach((photo) => {
        formDataToSend.append('photos', photo);
      });

      // If no photos are provided, we leave the existing DB photos
      if (photos.length === 0) {
        formDataToSend.delete('photos');
      }

      await axios.put(
        `http://localhost:8081/api/boats/${params.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      router.push('/Business/allListings');
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
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Boat Name
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Boat Type
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select port</option>
                {ports.map((port) => (
                  <option key={port} value={port}>
                    {port}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Price per Hour
              </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Trip Types
            </label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {tripTypes.map((trip) => (
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

          {/* Conditionally show Price per Day field if "Overnight Adventures" is selected */}
          {formData.trip_types.includes(4) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price per Day
              </label>
              <input
                type="number"
                name="price_per_day"
                value={formData.price_per_day}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Photos
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Update Photos
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
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

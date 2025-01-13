import React, { useEffect, useState } from 'react';
import ReactSlider from 'react-slider';
import './FilterSidebar.css'; // Import your CSS file if you're using a module
import axios from 'axios';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: ({
    priceRange,
    selectedTrips,
    vehicleType,
  }: {
    priceRange: [number, number];
    selectedTrips: string[]; // Trip types will now be strings, not numbers
    vehicleType: string;
  }) => void;
  activeFilters: {
    priceRange: [number, number];
    tripType: string[];
    vehicleType: string;
  }; // Yeni prop
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  activeFilters,
}) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]); // Default price range
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]); // Store trip types as strings
  const [vehicleType, setVehicleType] = useState<string>('');
  useEffect(() => {
    if (activeFilters) {
      setPriceRange(activeFilters.priceRange || [0, 5000]);
      setSelectedTrips(activeFilters.tripType || []);
      setVehicleType(activeFilters.vehicleType || '');
    }
  }, [activeFilters]);

  // Sabit trip types listesi
  const tripTypes = [
    { id: 1, name: 'Short Trips', description: '1–2 hours', type: 'short' },
    { id: 2, name: 'Day Trips', description: '3–6 hours', type: 'day' },
    { id: 3, name: 'Sunrise & Sunset Trips', description: '7–12 hours', type: 'sunrise' },
    { id: 4, name: 'Overnight Adventures', description: '1+ days', type: 'overnight' }
  ];

  const handleSliderChange = (values: [number, number]) => {
    setPriceRange(values);
  };

  const handleTripSelection = (tripType: string) => {
    setSelectedTrips((prev) =>
      prev.includes(tripType) ? prev.filter((type) => type !== tripType) : [...prev, tripType]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({ priceRange, selectedTrips, vehicleType });
    onClose(); // Close the sidebar after applying filters
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Filters</h2>
        <button onClick={onClose} className="text-gray-500">✕</button>
      </div>

      <div className="p-4">
        {/* Vehicle Type Filter */}
        <div className="pb-6">
          <h3 className="text-lg font-semibold mb-2">Vehicle Type</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setVehicleType('boat')}
              className={`p-2 rounded-md ${
                vehicleType === 'boat' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Boat
            </button>
            <button
              onClick={() => setVehicleType('yacht')}
              className={`p-2 rounded-md ${
                vehicleType === 'yacht' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Yacht
            </button>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="pb-6">
          <h3 className="text-lg font-semibold mb-2">Price Range</h3>
          <div className="flex justify-between mb-2">
            <span>${priceRange[0]}</span>
            <span className="text-gray-400">-</span>
            <span>${priceRange[1]}</span>
          </div>

          {/* Dual-Handle Range Slider */}
          <ReactSlider
            className="horizontal-slider"
            thumbClassName="thumb"
            trackClassName="track"
            min={0}
            max={5000}
            step={50}
            value={priceRange}
            onChange={handleSliderChange}
            ariaLabel={['Lower thumb', 'Upper thumb']}
            renderTrack={(props, state) => (
              <div
                {...props}
                className={`track ${state.index === 1 ? 'track-0' : ''}`}
              />
            )}
          />
        </div>

        {/* Trip Type Filter */}
        <div className="pb-6">
          <h3 className="text-lg font-semibold mb-2">Trip Type</h3>
          <div>
            {tripTypes.map((trip) => (
              <label key={trip.id} className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={selectedTrips.includes(trip.type)} // Use the type as the selected value
                  onChange={() => handleTripSelection(trip.type)} // Pass the type here
                  className="mr-2"
                />
                <div className="flex items-center space-x-3">
                  <img src={`/images/${trip.type}.png`} alt={trip.name} className="w-10 h-10" />
                  <div>
                    <p className="text-lg font-bold">{trip.name}</p>
                    <p className="text-sm text-gray-600">{trip.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="flex justify-center mt-48">
          <button
            onClick={handleApplyFilters}
            className="bg-blue-500 text-white rounded-md p-3 hover:bg-blue-600 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;

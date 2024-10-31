import React, { useState } from 'react';
import ReactSlider from 'react-slider';
import './FilterSidebar.css'; // Import your CSS file if you're using a module

const FilterSidebar = ({ isOpen, onClose }) => {
  const tripTypes = [
    { id: 1, name: 'Short Trips', description: '1–2 hours', image: '/images/icon1.png' },
    { id: 2, name: 'Day Trips', description: '3–6 hours', image: '/images/icon2.png' },
    { id: 3, name: 'Sunrise & Sunset Trips', description: '7–12 hours', image: '/images/icon3.png' },
    { id: 4, name: 'Overnight Adventures', description: '1+ days', image: '/images/icon4.png' }
  ];
  // State for price range
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedTrips, setSelectedTrips] = useState<number[]>([]);

  const handleSliderChange = (values) => {
    setPriceRange(values);
  };
  const handleTripSelection = (tripId: number) => {
    setSelectedTrips((prev) =>
      prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId]
    );
  };

  const handleApplyFilters = () => {
    applyFilters({ priceRange, selectedTrips });
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
            <button className="p-2 rounded-md bg-gray-100">Boat</button>
            <button className="p-2 rounded-md bg-gray-100">Yacht</button>
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

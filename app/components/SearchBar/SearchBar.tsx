'use client';
import { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaUser } from 'react-icons/fa';

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Get today's date in the format YYYY-MM-DD for the minimum date
  const today = new Date().toISOString().split('T')[0];

  // Handle focus on any input to extend the search button
  const handleFocus = () => setIsActive(true);
  const handleBlur = () => setIsActive(false);

  return (
    <div className="flex justify-between items-center bg-blue-100 p-1 rounded-full shadow-md hover:shadow-lg transition-all w-full max-w-3xl mx-auto">
      {/* Place Component */}
      <div className="flex items-center px-2 py-1 bg-blue-100 hover:bg-white focus-within:bg-white transition-all rounded-full" style={{ width: '25%' }}>
        <div className="flex flex-col items-start w-full">
          <label className="text-xs text-gray-500 mb-0.5">Place</label>
          <input
            type="text"
            placeholder="Search destinations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full p-0 bg-transparent focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Vertical Divider Line */}
      <div className="border-r border-gray-300 mx-2 h-8"></div>

      {/* Arrival Date Section */}
      <div className="flex items-center px-2 py-1 bg-blue-100 hover:bg-white focus-within:bg-white transition-all rounded-full" style={{ height: '40px' }}>
        <div className="flex flex-col items-start">
          <label className="text-xs text-gray-500 mb-0.5">Arrival</label>
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1 text-gray-500 text-xs" />
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => setStartDate(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="focus:outline-none bg-transparent text-xs"
              style={{ height: '24px' }}
            />
          </div>
        </div>
      </div>

      {/* Vertical Divider Line */}
      <div className="border-r border-gray-300 mx-2 h-8"></div>

      {/* Exit Date Section */}
      <div className="flex items-center px-2 py-1 bg-blue-100 hover:bg-white focus-within:bg-white transition-all rounded-full" style={{ height: '40px' }}>
        <div className="flex flex-col items-start">
          <label className="text-xs text-gray-500 mb-0.5">Exit</label>
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1 text-gray-500 text-xs" />
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => setEndDate(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="focus:outline-none bg-transparent text-xs"
              style={{ height: '24px' }}
            />
          </div>
        </div>
      </div>

      {/* Vertical Divider Line */}
      <div className="border-r border-gray-300 mx-2 h-8"></div>

      {/* Guests Section */}
      <div className="flex items-center px-2 py-1 bg-blue-100 hover:bg-white focus-within:bg-white transition-all rounded-full mr-4" style={{ height: '40px' }}>
        <div className="flex flex-col items-start">
          <label className="text-xs text-gray-500 mb-0.5">Guests</label>
          <div className="flex items-center">
            <FaUser className="mr-1 text-gray-500 text-xs" />
            <input
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-12 text-center focus:outline-none bg-transparent text-xs"
              style={{ height: '24px' }}
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        className={`bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all flex items-center justify-center ${isActive ? 'pl-4 pr-6' : 'w-10 h-10'}`}
        style={{ height: '40px' }}
      >
        <FaSearch className="text-sm" />
        {isActive && <span className="ml-2 text-xs">Search</span>}
      </button>
    </div>
  );
};

export default SearchBar;

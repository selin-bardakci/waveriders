import React, { useState } from 'react';

const PriceRangeFilter = () => {
  const [minPrice, setMinPrice] = useState(100); // Default min price
  const [maxPrice, setMaxPrice] = useState(1000); // Default max price

  const handleMinChange = (event) => {
    setMinPrice(Number(event.target.value));
  };

  const handleMaxChange = (event) => {
    setMaxPrice(Number(event.target.value));
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      <h3 className="text-sm font-semibold mb-2">Price Range</h3>
      <div className="flex items-center justify-between mb-2">
        <span>${minPrice}</span>
        <span className="text-gray-400">-</span>
        <span>${maxPrice}</span>
      </div>
      <input
        type="range"
        min="0"
        max="2000"
        value={minPrice}
        onChange={handleMinChange}
        className="w-full h-1 bg-gray-300 rounded-full appearance-none mb-2"
        style={{ accentColor: '#3B82F6' }} // Customize the slider color
      />
      <input
        type="range"
        min="0"
        max="2000"
        value={maxPrice}
        onChange={handleMaxChange}
        className="w-full h-1 bg-gray-300 rounded-full appearance-none"
        style={{ accentColor: '#3B82F6' }} // Customize the slider color
      />
    </div>
  );
};

export default PriceRangeFilter;

'use client';
import { useState } from 'react';
import SearchBar from '@/components/SearchBar/SearchBar';
import BoatListingCard from '@/components/boatListingCard/BoatListingCard';
import FilterSidebar from '@/components/SideBar/FilterSidebar'; // Import the FilterSidebar component
import { IoIosFunnel } from 'react-icons/io';


const ListingsPage = () => {
  // Mock data with a location attribute
  const listingsData = [
    {
      id: 1,
      imageUrl: '/images/boat1.jpg',
      price: 100,
      rating: 4.98,
      guests: 10,
      minHours: 4,
      description: 'Ocean view',
      location: 'Istanbul', // New attribute for location
    },
    {
      id: 2,
      imageUrl: '/images/boat2.jpg',
      price: 150,
      rating: 4.95,
      guests: 8,
      minHours: 3,
      description: 'Lakefront',
      location: 'Istanbul', // New attribute for location
    },
    // More mock listings with Istanbul as the default location
  ];

  const [listings, setListings] = useState(listingsData);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortOption, setSortOption] = useState('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const applyFilters = (filters: any) => {
    console.log('Filters applied:', filters);
    // Add your filtering logic here to update listings based on `filters`
  };
  // Sorting logic based on the selected option
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortOption(value);
    let sortedListings = [...listings];

    if (value === 'price_hour') {
      sortedListings.sort((a, b) => a.price - b.price); // Assuming 'price' field is per hour
    } else if (value === 'ranking') {
      sortedListings.sort((a, b) => b.rating - a.rating);
    }

    setListings(sortedListings);
  };

  return (
    
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white p-4 shadow-md flex justify-between items-center">
        {/* Sorting Dropdown on the Left */}
        <div className="flex items-center gap-2">
        <select
          id="sort"
          value={sortOption}
          onChange={handleSortChange}
          className="p-2 pl-01 border rounded-md text-gray-700"  // Reduced left padding for the icon
          style={{ width: '120px' }}  // Adjust width if needed
        >
          <option value="" disabled hidden>Sort by</option>
          <option value="price_hour">Price per Hour</option>
          <option value="ranking">Ranking</option>
        </select>
      </div>




        {/* Centered SearchBar */}
        <div className="flex-grow flex justify-center">
          <SearchBar />
        </div>

        {/* Filter Button on the Right */}
        <button
            onClick={toggleSidebar}
            className="bg-gray-200 p-2 pl-4 pr-4 rounded-md flex items-center justify-between shadow-md hover:shadow-lg transition-all ml-auto"
            style={{ width: '120px' }}  // Adjust the width as needed
          >
            <IoIosFunnel className="text-gray-600" /> {/* Using a funnel icon */}
            <span className="ml-auto">Filters</span> {/* Text aligned to the right */}
          </button>
      </header>

      <main className="relative flex">
        {/* Main Content */}
        <div className="container mx-auto py-8 w-full md:w-3/4 lg:w-4/5">
          <h2 className="text-2xl font-semibold mb-6">Boat rentals in Istanbul</h2> {/* Default to Istanbul */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((boat) => (
              <BoatListingCard key={boat.id} {...boat} />
            ))}
          </div>
        </div>

        {/* Sidebar Overlay */}
        <FilterSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      </main>
    </div>
  );
};

export default ListingsPage;

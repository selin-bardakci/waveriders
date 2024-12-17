'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from '../../components/SearchBar/SearchBar';
import FilterSidebar from '../../components/SideBar/FilterSidebar';
import BoatListingCard from '../../components/boatListingCard/BoatListingCard';
import { IoIosFunnel } from 'react-icons/io';

const ListingsPage = () => {
  const [boatIds, setBoatIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seed, setSeed] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortOption, setSortOption] = useState('');
  
  // activeFilters state is now used to store filters globally
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 5000],
    tripType: '',
    vehicleType: '',
  });

  const listingsPerPage = 15;

  // Fetch boat ids with or without filters
  const fetchBoatIds = async () => {
    setLoading(true);
    setError('');
    try {
      const queryString = new URLSearchParams({
        price_min: activeFilters.priceRange[0].toString(),
        price_max: activeFilters.priceRange[1].toString(),
        trip_type: activeFilters.tripType,
        vehicle_type: activeFilters.vehicleType,
      }).toString();

      const response = await axios.get(
        `http://localhost:8081/api/listings/paginated?page=${currentPage}&limit=${listingsPerPage}&${queryString}`
      );
      if (response.status === 200) {
        const ids = response.data.rows.map((boat) => boat.boat_id);
        setBoatIds(ids);
        setTotalPages(Math.ceil(response.data.total / listingsPerPage));
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // applyFilters sets the active filters
  const applyFilters = ({ priceRange, selectedTrips, vehicleType }) => {
    setActiveFilters({
      priceRange,
      tripType: selectedTrips.join(','), // Join trips into a string
      vehicleType,
    });

    // Reset to the first page when filters are applied
    setCurrentPage(1);
  };

  // Fetch filtered listings when currentPage or activeFilters change
  useEffect(() => {
    fetchBoatIds();
  }, [currentPage, activeFilters]); // this ensures filtering is applied when these values change

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white p-4 shadow-md flex justify-between items-center">
        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 pl-01 border rounded-md text-gray-700"
            style={{ width: '120px' }}
          >
            <option value="" disabled hidden>Sort by</option>
            <option value="price_hour">Price per Hour</option>
            <option value="ranking">Ranking</option>
          </select>
        </div>
        {/* Search Bar */}
        <div className="flex-grow flex justify-center">
          <SearchBar />
        </div>

        {/* Filter Button */}
        <button
            onClick={toggleSidebar}
            className="bg-gray-200 p-2 pl-4 pr-4 rounded-md flex items-center justify-between shadow-md hover:shadow-lg transition-all ml-auto"
            style={{ width: '120px' }}  // Adjust the width as needed
            >
          <IoIosFunnel className="text-gray-600" />
          <span>Filters</span>
        </button>
      </header>

      <main className="relative flex">
        <div className="container mx-auto py-8 w-full md:w-3/4 lg:w-4/5">
          <h2 className="text-2xl font-semibold mb-6">Boat Rentals</h2>

          {/* Loading/Error States */}
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boatIds.map((boat_id) => (
                <BoatListingCard key={boat_id} boat_id={boat_id} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6 gap-2 text-sm text-gray-700">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`hover:text-blue-500 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              &lt;
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2 py-1 rounded transition ${
                  currentPage === page ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-50 text-gray-700'
                }`}
                style={{ outline: 'none', border: 'none' }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`hover:text-blue-500 transition ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          onApplyFilters={applyFilters}
        />
      </main>
    </div>
  );
};

export default ListingsPage;

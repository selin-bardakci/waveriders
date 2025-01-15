'use client';
import { Suspense } from "react";
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { useCallback } from 'react';
import axios from 'axios';
import SearchBar from '../../components/SearchBar/SearchBar';
import FilterSidebar from '../../components/SideBar/FilterSidebar';
import BoatListingCard from '../../components/boatListingCard/BoatListingCard';
import Link from 'next/link';
import { IoIosFunnel } from 'react-icons/io';

const ListingsPageComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search parameters from URL
  const [boatIds, setBoatIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortOption, setSortOption] = useState('');
  const [isStateInitialized, setIsStateInitialized] = useState(false); // Track if the state is ready
  const [isRestored, setIsRestored] = useState(false); 
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Track if data is loaded
  interface Filters {
    priceRange: [number, number];
    tripType: string[];  // Explicitly set tripType as an array of strings
    vehicleType: string;
  }
  
  const [activeFilters, setActiveFilters] = useState<Filters>({
    priceRange: [0, 5000],
    tripType: [],
    vehicleType: '',
  });

  const isFirstLoad = useRef(true);
  const listingsPerPage = 15;

  const fetchBoatIds = useCallback(async () => {
    console.log('[DEBUG] fetchBoatIds called with:', { activeFilters, location, guests, startDate, endDate, currentPage });
    setLoading(true);
    setError('');
    setIsDataLoaded(false); // Set to false when a new fetch starts
  
    try {
      const tripTypes = activeFilters.tripType.length > 0 ? activeFilters.tripType : [];
      const tripTypeQuery = tripTypes.length
        ? `&${tripTypes.map((type) => `trip_type=${type}`).join('&')}`
        : '';
  
      const queryString = new URLSearchParams({
        price_min: activeFilters.priceRange[0].toString(),
        price_max: activeFilters.priceRange[1].toString(),
        vehicle_type: activeFilters.vehicleType,
        sortField: sortOption === 'price_per_hour_asc' ? 'price_per_hour' : sortOption === 'price_per_hour_desc' ? 'price_per_hour' : '',
        sortOrder: sortOption === 'price_per_hour_asc' ? 'asc' : sortOption === 'price_per_hour_desc' ? 'desc' : '',
        location: location || '',
        guests: guests.toString(),
        start_date: startDate || '',
        end_date: endDate || '',
      });
  
      console.log('[DEBUG] Final query string:', queryString.toString(), tripTypeQuery);
  
      const response = await axios.get(
        `https://api.waveriders.com.tr/api/listings/paginated?page=${currentPage}&limit=${listingsPerPage}&${queryString.toString()}${tripTypeQuery}`
      );
  
      if (response.status === 200) {
        const ids = response.data.rows.map((boat: { boat_id: any; }) => boat.boat_id);
        setBoatIds(ids);
        setTotalPages(Math.ceil(response.data.total / listingsPerPage));
        setIsDataLoaded(true); // Mark data as successfully loaded
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (err) {
      console.error('[DEBUG] Error in fetchBoatIds:', err);
      setError('Failed to load listings. Please try again later.');
      setIsDataLoaded(false); // Reset data loaded state on error
    } finally {
      setLoading(false);
    }
  }, [activeFilters, location, guests, startDate, endDate, currentPage, sortOption, listingsPerPage]);

  useEffect(() => {
    // Retrieve 'search_initiated' flag from sessionStorage
    const searchInitiatedFromHomepage = sessionStorage.getItem('search_initiated') === 'true';
    console.log('[DEBUG] search_initiated retrieved from sessionStorage:', searchInitiatedFromHomepage);  // Debugging sessionStorage value

    if (searchInitiatedFromHomepage) {
        // The search was initiated from the homepage, apply filters
        const locationParam = searchParams.get('location') || '';
        const guestsParam = searchParams.get('guests') || '1';
        const startDateParam = searchParams.get('start_date') || '';
        const endDateParam = searchParams.get('end_date') || '';

        // Update internal state with the query parameters
        setLocation(locationParam);
        setGuests(Number(guestsParam));
        setStartDate(startDateParam);
        setEndDate(endDateParam);

        setCurrentPage(1); // Reset to first page on search initiation
        console.log('[DEBUG] Applied Filters:', { locationParam, guestsParam, startDateParam, endDateParam });
    } else {
        // Not search initiated from homepage, restore session state
        if (isFirstLoad.current) {
            restoreStateFromSession();
            isFirstLoad.current = false;
        } else {
            fetchBoatIds();  // Fetch boats when filters are updated
            console.log('[DEBUG] searchparam fetchboatid'); 
        }

    }

    // Reset search initiated flag after processing
    setIsRestored(true); // Mark state as restored
    setIsStateInitialized(true); // Indicate state restoration is complete
  }, [fetchBoatIds, searchParams]);  // Trigger whenever searchParams change

  
  

  /**
   * Persist state to sessionStorage whenever relevant state changes.
   */
  useEffect(() => {
    if (!isRestored) return; // Avoid overwriting restored state

    const state = {
      currentPage,
      activeFilters,
      sortOption,
      location,
      guests,
      startDate,
      endDate,
    };

    console.log('[DEBUG] Persisting state to sessionStorage:', state);
    sessionStorage.setItem('listingsPageState', JSON.stringify(state));
  }, [currentPage, activeFilters, sortOption, location, guests, startDate, endDate, isRestored]);



  useEffect(() => {
    if (!isRestored) return; // Prevent fetch until state restoration is complete
    console.log('[DEBUG] fetchBoatIds triggered for page change or updated filters');
    fetchBoatIds();
  }, [fetchBoatIds, isRestored]); // Add fetchBoatIds as a dependency
  

  const restoreStateFromSession = () => {
    const savedState = sessionStorage.getItem('listingsPageState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setCurrentPage(parsedState.currentPage || 1);
      setActiveFilters(parsedState.activeFilters || { priceRange: [0, 5000], tripType: [], vehicleType: '' });
      setSortOption(parsedState.sortOption || '');
      setLocation(parsedState.location || '');
      setGuests(parsedState.guests || 1);
      setStartDate(parsedState.startDate || '');
      setEndDate(parsedState.endDate || '');
      console.log('[DEBUG] State restored from session:', parsedState);
    }
  };

  const handleListingClick = () => {
    const state = {
      currentPage,
      activeFilters,
      sortOption,
      location,
      guests,
      startDate,
      endDate,
    };
    sessionStorage.setItem('listingsPageState', JSON.stringify(state));
    sessionStorage.setItem('search_initiated', 'false');
  };
  
  const applyFilters = ({
    priceRange,
    selectedTrips,
    vehicleType,
  }: {
    priceRange: [number, number];
    selectedTrips: string[];
    vehicleType: string;
  }) => {
    // Log to debug the selectedTrips
    console.log('[DEBUG] Applying filters with selectedTrips:', selectedTrips);
  
    // Ensure tripType is set correctly
    const tripTypes = selectedTrips && selectedTrips.length > 0 ? selectedTrips : [];
  
    // Log to confirm tripTypes before setting them
    console.log('[DEBUG] Correctly setting tripTypes:', tripTypes);
  
    setActiveFilters({
      priceRange,
      tripType: tripTypes,  // Ensure tripType is reset and only contains selectedTrips
      vehicleType,
    });
  
    setCurrentPage(1);  // Reset to page 1 whenever filters are applied
  };
  
  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      location: location || '',
      guests: guests.toString(),
      start_date: startDate || '',
      end_date: endDate || '',
      search_initiated: 'true',  // Always pass the search_initiated flag
    }).toString();
  
    console.log('[DEBUG] handleSearch queryParams:', queryParams);
  
    // Use router.push to trigger a URL change with query params
    router.push(`/auth/ListingsPage?${queryParams}`);
    setCurrentPage(1);  // Reset page on search
  };
  
  
  useEffect(() => {
    if (!isStateInitialized) return; // Ensure state is ready before fetching
    // Only call fetchBoatIds once the filters have been properly updated
    if (activeFilters.tripType.length > 0 || location) {
      fetchBoatIds(); // Now that filters are updated, we fetch the data
      console.log('[DEBUG] fetchBoatIds with updated filters');
    }
  }, [fetchBoatIds, activeFilters, location, guests, startDate, endDate, currentPage, isStateInitialized]); // Add relevant dependencies
   

  useEffect(() => {
    const handlePopState = () => {
      restoreStateFromSession();  // Restore filters and page state
      fetchBoatIds();  // Re-fetch boats with restored state
      console.log('[DEBUG] handlePopstate fetchboatid'); 
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchBoatIds]);

  useEffect(() => {
    if (!isStateInitialized) return; // Ensure state is ready before saving
    const state = {
      currentPage,
      activeFilters,
      sortOption,
      location,
      guests,
      startDate,
      endDate,
    };
    sessionStorage.setItem('listingsPageState', JSON.stringify(state));
  }, [currentPage, activeFilters, sortOption, location, guests, startDate, endDate, isStateInitialized]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const renderContent = () => {
    if (!isStateInitialized || !isDataLoaded) {
      return <p>Loading listings...</p>; // Placeholder while data is loading
    }

    if (error) {
      return <p className="text-red-500 text-center">{error}</p>;
    }

    if (boatIds.length === 0) {
      return <p className="text-gray-500 text-center">No boats found.</p>;
    }

    // Render listings if data is loaded and valid
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boatIds.map((boatId) => (
          <Link key={boatId} href={`/listing/${boatId}`} onClick={handleListingClick}>
            <BoatListingCard boat_id={boatId} />
          </Link>
        ))}
      </div>
    );
  };

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxButtons = 5; // Maximum number of buttons to display
    const half = Math.floor(maxButtons / 2);
  
    const startPage = Math.max(currentPage - half, 1);
    const endPage = Math.min(startPage + maxButtons - 1, totalPages);
  
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  
    return pageNumbers.map((page) => (
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
    ));
  };
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 pl-01 border rounded-md text-gray-700"
            style={{ width: '130px' }}
          >
            <option value="" disabled hidden>
              Sort by
            </option>
            <option value="price_per_hour_asc">Price per Hour (Low to High)</option>
            <option value="price_per_hour_desc">Price per Hour (High to Low)</option>
          </select>
        </div>

        <div className="flex-grow flex justify-center">
          <SearchBar
            onSearch={handleSearch}
            location={location}
            setLocation={setLocation}
            guests={guests}
            setGuests={setGuests}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </div>

        <button
          onClick={toggleSidebar}
          className="bg-gray-200 p-2 pl-4 pr-4 rounded-md flex items-center justify-between shadow-md hover:shadow-lg transition-all ml-auto"
          style={{ width: '120px' }}
        >
          <IoIosFunnel className="text-gray-600" />
          <span>Filters</span>
        </button>
      </header>

      <main className="relative flex">
        <div className="container mx-auto py-8 w-full md:w-3/4 lg:w-4/5">
          <h2 className="text-2xl font-semibold mb-6">Boat Rentals</h2>
          {renderContent()}

          <div className="flex justify-center items-center mt-6 gap-2 text-sm text-gray-700">
  <button
    onClick={handlePreviousPage}
    disabled={currentPage === 1}
    className={`hover:text-blue-500 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    &lt;
  </button>

  {renderPaginationButtons()}

  <button
    onClick={handleNextPage}
    disabled={currentPage === totalPages}
    className={`hover:text-blue-500 transition ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    &gt;
  </button>
</div>

        </div>

        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          onApplyFilters={applyFilters}
          activeFilters={activeFilters}
        />
      </main>
    </div>
    </Suspense>
  );
};

export default ListingsPageComponent;

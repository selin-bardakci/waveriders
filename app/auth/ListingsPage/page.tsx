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
  const [sortOption, setSortOption] = useState(''); // Sort seçeneğini takip etmek için


  const listingsPerPage = 15;

  // Veri çekme mantığı
  useEffect(() => {
    const fetchBoatIds = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(
          `http://localhost:8081/api/listings/paginated?page=${currentPage}&limit=${listingsPerPage}${
            seed ? `&seed=${seed}` : ''
          }`
        );

        if (response.status === 200) {
          const ids = response.data.rows.map((boat) => boat.boat_id);
          setBoatIds(ids);

          // İlk istekte seed'i backend'den al
          if (!seed) setSeed(response.data.seed);

          // Toplam sayfa sayısını hesapla
          setTotalPages(Math.ceil(response.data.total / listingsPerPage));
        } else {
          throw new Error(`Unexpected status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching paginated listings:', err);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoatIds();
  }, [currentPage, seed]);

  // Sayfa kontrolleri
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortOption(value);
  
    // Boat verilerini sıralamak için mevcut boatIds'i yeniden düzenle
    let sortedBoatIds = [...boatIds];
  
    if (value === 'price_hour') {
      sortedBoatIds.sort((a, b) => a.price - b.price); // Price'e göre artan sıralama
    } else if (value === 'ranking') {
      sortedBoatIds.sort((a, b) => b.rating - a.rating); // Rating'e göre azalan sıralama
    }
  
    setBoatIds(sortedBoatIds);
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
        <div className="container mx-auto py-8 w-full md:w-3/4 lg:w-4/5">
          <h2 className="text-2xl font-semibold mb-6">Boat Rentals</h2>

          {/* Yükleme veya hata durumu */}
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

<div className="flex justify-center items-center mt-6 gap-2 text-sm text-gray-700">
  {/* Önceki Sayfa */}
  <button
    onClick={handlePreviousPage}
    disabled={currentPage === 1}
    className={`hover:text-blue-500 transition ${
      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    &lt;
  </button>

  {/* Sayfa Numaraları */}
  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      className={`px-2 py-1 rounded transition ${
        currentPage === page
          ? 'bg-blue-100 text-blue-600' // Aktif sayfa: sadece mavi arka plan ve mavi yazı
          : 'hover:bg-blue-50 text-gray-700' // Diğer sayfalar: hover'da açık mavi
      }`}
      style={{ outline: 'none', border: 'none' }} // Çizgileri tamamen kaldırıyoruz
    >
      {page}
    </button>
  ))}

  {/* Sonraki Sayfa */}
  <button
    onClick={handleNextPage}
    disabled={currentPage === totalPages}
    className={`hover:text-blue-500 transition ${
      currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    &gt;
  </button>
</div>




        </div>

        {/* Filtre Sidebar */}
        <FilterSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      </main>
    </div>
  );
};

export default ListingsPage;

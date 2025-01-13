'use client'; 
import { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; 
interface SearchBarProps {
  onSearch: (location: string, guests: number, startDate: string, endDate: string) => void;
  location: string;
  setLocation: (location: string) => void;
  guests: number;
  setGuests: (guests: number) => void;
  startDate: string;
  setStartDate: (startDate: string) => void;
  endDate: string;
  setEndDate: (endDate: string) => void;
}

const SearchBar = ({
  onSearch,
  location,
  setLocation,
  guests,
  setGuests,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: SearchBarProps) => {
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  const ports = [
    'All Ports', 
    'Port of Aliağa',
      'Port of Alidaş',
      'Port of Altıntel',
      'Port of Ambarlı',
      'Port of Anamur',
      'Port of Antalya',
      'Port of Ayvalık',
      'Port of Bandırma',
      'Port of Bartın',
      'Port of Bodrum',
      'Port of Botaş(Ceyhan)',
      'Port of Büyükdere',
      'Port of Çanakkale',
      'Port of Çeşme',
      'Port of Derince',
      'Port of Dikili',
      'Port of Edremit',
      'Port of Fethiye',
      'Port of Filyos',
      'Port of Finike',
      'Port of Gemlik',
      'Port of Giresun',
      'Port of Güllük',
      'Port of Haydarpaşa',
      'Port of Hopa',
      'Port of İnebolu',
      'Port of İskenderun',
      'Port of İstanbul',
      'Port of İzmir',
      'Port of İzmit',
      'Port of Karadeniz Ereğli',
      'Port of Karaköy',
      'Port of Karasu',
      'Port of Kuşadası',
      'Port of Marmaris',
      'Port of Mersin',
      'Port of Nemrut',
      'Port of Ordu',
      'Port of Ortadoğu',
      'Port of Rize',
      'Port of Samsun',
      'Port of Sinop',
      'Port of Taşucu',
      'Port of Tekirdağ',
      'Port of Trabzon',
      'Port of Tuzla',
      'Port of Yeşilovacık Medcem',
      'Port of Zeytinburnu',
      'Port of Zonguldak'
    ];

  // Handle focus on any input to extend the search button
  const handleFocus = () => setIsActive(true);
  const handleBlur = () => setIsActive(false);

  // Get today's date in the format YYYY-MM-DD for the minimum date
  const today = new Date().toISOString().split('T')[0];



// Handle search button click
const handleSearch = () => {
  // If "All Ports" is selected, treat location as an empty string
  const selectedLocation = location === 'All Ports' ? '' : location;

  // Call the onSearch prop, passing the parameters and redirecting to ListingsPage
  onSearch(selectedLocation, guests, startDate, endDate);

  // Optionally, you can redirect here with router.push (if you want to handle it directly in the SearchBar component):
  const queryParams = new URLSearchParams({
    location: selectedLocation,
    guests: guests.toString(),
    start_date: startDate || '', // handle empty dates
    end_date: endDate || '',     // handle empty dates
  }).toString();

  router.push(`/auth/ListingsPage?${queryParams}`);
};


  

  return (
    <div className="flex justify-between items-center bg-blue-100 p-1 rounded-full shadow-md hover:shadow-lg transition-all w-full max-w-3xl mx-auto">
      {/* Place Component */}
      <div className="flex items-center px-2 py-1 bg-blue-100 hover:bg-white focus-within:bg-white transition-all rounded-full" style={{ width: '25%' }}>
        <div className="flex flex-col items-start w-full">
          <label className="text-xs text-gray-500 mb-0.5">Port</label>
          <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}  // Only update the location state, no search trigger
              className="w-full p-0 bg-transparent focus:outline-none text-xs"
            >
            <option value="" disabled>Select a port</option>
            {ports.map((port, index) => (
              <option key={index} value={port}>
                {port}
              </option>
            ))}
          </select>
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
              onChange={(e) => setStartDate(e.target.value)}  // Only update start date
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
                onChange={(e) => setEndDate(e.target.value)}  // Only update start date, no search trigger
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="focus:outline-none bg-transparent text-xs"
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
              onChange={(e) => setGuests(Number(e.target.value))}  // Only update guests
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
        onClick={handleSearch}  // Trigger search on button click
      >
        <FaSearch className="text-sm" />
        {isActive && <span className="ml-2 text-xs">Search</span>}
      </button>
    </div>
  );
};

export default SearchBar;

"use client";
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Map, { GeolocateControl, Marker, Popup } from 'react-map-gl';
import { useRouter } from 'next/navigation';
import 'mapbox-gl/dist/mapbox-gl.css';
import { boatListings } from "./utils/boatListings";
import Container from "./components/Container";
import BoatListingCard from "./components/boatListingCard/BoatListingCard";
import SearchBar from "./components/SearchBar/SearchBar";
import WeatherComponent from "./components/WeatherComponent"; // Import WeatherComponent
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Home() {
    const [viewport, setViewport] = useState({
        latitude: 41.0082,
        longitude: 28.9784,
        zoom: 12,
    });
    const [boatListings, setBoatListings] = useState<BoatListing[]>([]); // Typed array
    {boatListings.map((boat) => (
        <BoatListingCard key={boat.boat_id} boat_id={boat.boat_id} />
      ))}
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [location, setLocation] = useState(''); // Location state
    const [guests, setGuests] = useState(1); // Guests state
    const [startDate, setStartDate] = useState(''); // Start date state
    const [endDate, setEndDate] = useState(''); // End date state
    const [hoveredPort, setHoveredPort] = useState<string | null>(null); // State for hovered port
    const [hoveredPortPosition, setHoveredPortPosition] = useState<{ latitude: number, longitude: number } | null>(null); // Store position of hovered port
    const [searchInitiated, setSearchInitiated] = useState(false);  // Track if search is initiated from homepage
    const router = useRouter();
    const ports = [
        { name: 'Port of Aliağa', latitude: 38.8175, longitude: 26.949167 },
        { name: 'Port of Alidaş', latitude: 36.533333, longitude: 32 },
        { name: 'Port of Altıntel', latitude: 40.767778, longitude: 29.540556 },
        { name: 'Port of Ambarlı', latitude: 40.965, longitude: 28.691111 },
        { name: 'Port of Anamur', latitude: 36.06908580584459, longitude: 32.868129618651956 },
        { name: 'Port of Antalya', latitude: 36.834167, longitude: 30.606111 },
        { name: 'Port of Ayvalık', latitude: 39.2, longitude: 26.691389 },
        { name: 'Port of Bandırma', latitude: 40.349722, longitude: 27.983333 }, // Fixed location
        { name: 'Port of Bartın', latitude: 41.686389, longitude: 32.228611 },
        { name: 'Port of Bodrum', latitude: 37.029722, longitude: 27.429444},
        { name: 'Port of Botaş(Ceyhan)', latitude: 36.875, longitude: 35.931111 },
        { name: 'Port of Büyükdere', latitude: 41.16210123390768, longitude: 29.046322661506938},
        { name: 'Port of Çanakkale', latitude: 40.264722, longitude:  26.525},
        { name: 'Port of Çeşme', latitude: 38.323056,  longitude: 26.296667},
        { name: 'Port of Derince', latitude: 40.748889,  longitude:29.833611},
        { name: 'Port of Dikili', latitude: 39.070556,  longitude: 26.886667},
        { name: 'Port of Edremit', latitude: 39.605754832541315, longitude: 26.737977835170877},
        { name: 'Port of Fethiye', latitude: 36.626111, longitude: 29.102778},
        { name: 'Port of Filyos', latitude: 41.564722, longitude: 32.021389},
        { name: 'Port of Finike', latitude: 36.293889,  longitude: 30.1525},
        { name: 'Port of Gemlik', latitude: 40.417778, longitude: 29.116667},
        { name: 'Port of Giresun', latitude: 40.917778, longitude: 38.382222},
        { name: 'Port of Güllük', latitude: 37.253889, longitude: 27.605833},
        { name: 'Port of Haydarpaşa', latitude: 41.000833, longitude: 28.958333 },
        { name: 'Port of Hopa', latitude: 41.426944,longitude:  41.431111},
        { name: 'Port of İnebolu', latitude: 41.979444,  longitude: 33.7675},
        { name: 'Port of İskenderun', latitude: 36.583333,  longitude: 36.183333 },
        { name: 'Port of İstanbul', latitude: 41.022778, longitude: 28.978333 },
        { name: 'Port of İzmir', latitude: 38.442222,longitude: 27.1525},
        { name: 'Port of İzmit', latitude: 40.75909453377116, longitude: 29.92098600859793},
        { name: 'Port of Karadeniz Ereğli', latitude: 41.296667,  longitude: 31.395833},
        { name: 'Port of Karaköy', latitude: 41.023109119259885, longitude:28.976235568354262},
        { name: 'Port of Karasu', latitude: 41.121389,  longitude: 30.676944},
        { name: 'Port of Kuşadası', latitude: 37.862222, longitude:  27.255278},
        { name: 'Port of Marmaris', latitude: 36.85, longitude: 28.28 },
        { name: 'Port of Mersin', latitude: 36.783333, longitude: 34.616667},
        { name: 'Port of Nemrut', latitude: 38.776944,  longitude: 26.923889},
        { name: 'Port of Ordu', latitude: 40.995833,  longitude: 37.876667},
        { name: 'Port of Ortadoğu', latitude: 36.833333,  longitude: 30.6},
        { name: 'Port of Rize', latitude: 41.037778, longitude: 40.511944},
        { name: 'Port of Samsun', latitude: 41.299722, longitude: 36.344444},
        { name: 'Port of Sinop', latitude: 42.023333, longitude: 35.148333},
        { name: 'Port of Taşucu', latitude: 36.312778,longitude: 33.884722},
        { name: 'Port of Tekirdağ', latitude: 40.964167,  longitude: 27.502778},
        { name: 'Port of Trabzon', latitude: 41.002222,  longitude: 39.737778 },
        { name: 'Port of Tuzla', latitude:40.851708657689336, longitude: 29.26747832049473 },
        { name: 'Port of Yeşilovacık Medcem', latitude: 36.185,  longitude:  33.660278},
        { name: 'Port of Zeytinburnu', latitude: 40.980278,  longitude: 28.895556},
        { name: 'Port of Zonguldak', latitude: 41.456944,longitude: 31.784722}
    ];
    
    interface BoatListing {
        boat_id: number;
        boat_name: string;
        description: string;
        trip_types: string;
        price_per_hour?: string;
        price_per_day?: string | null;
        capacity?: number;
        location: string;
        photos: string[];
    }
    
    useEffect(() => {
        // Fetch random boat listings
        const fetchRandomListings = async () => {
            try {
                const response = await axios.get('https://api.waveriders.com.tr/api/listings/random');
                setBoatListings(response.data);
            } catch (err) {
                console.error("Error fetching random listings:", err);
                setError("Failed to fetch random listings.");
            } finally {
                setLoading(false);
            }
        };

        fetchRandomListings();

        // Automatically set viewport to user's current location
        navigator.geolocation.getCurrentPosition((position) => {
            setViewport({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                zoom: 12,
            });
        });
    }, []);
    const handleSearch = () => {
        setSearchInitiated(true);
    
        // Set 'search_initiated' flag to sessionStorage
        sessionStorage.setItem('search_initiated', 'true');
        console.log('[DEBUG] search_initiated set to:', sessionStorage.getItem('search_initiated'));  // Ensure it's logged immediately
    
        // Ensure location is a string
        const queryLocation = location ? location.toString() : '';  // Convert location to string or use an empty string
    
        const queryParams = new URLSearchParams({
            location: queryLocation, 
            guests: guests.toString(),
            start_date: startDate ?? '', // Handle empty dates
            end_date: endDate ?? '', // Handle empty dates
        }).toString();
    
        console.log('[DEBUG] handleSearch queryParams:', queryParams);  // Debugging the queryParams
    
        // Navigate to ListingsPage with the query parameters
        router.push(`/auth/ListingsPage?${queryParams}`);
    };

    
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Container>
                {/* Map Section with SearchBar overlay */}
                <div className="relative w-full mb-10">
                    <Map
                        initialViewState={viewport}
                        mapStyle="mapbox://styles/mapbox/streets-v11"
                        mapboxAccessToken={MAPBOX_TOKEN}
                        style={{ width: '100%', height: '500px', borderRadius: '1rem' }}
                        onMove={(evt) => setViewport(evt.viewState)}
                    >
                        <GeolocateControl position="top-left" />
                        {/* Adding Port Markers */}
                        {ports.map((port, index) => (
                            <Marker
                                key={index}
                                longitude={port.longitude}
                                latitude={port.latitude}
                            >
                                <div
                                    onMouseEnter={() => {
                                        setHoveredPort(port.name);
                                        setHoveredPortPosition({ latitude: port.latitude, longitude: port.longitude });
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredPort(null);
                                        setHoveredPortPosition(null);
                                    }}
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        backgroundColor: 'blue',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <img
                                        src="/images/boat-svgrepo-com.svg" // Update with the correct path to your boat icon
                                        alt={port.name}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                        }}
                                    />
                                </div>
                            </Marker>
                        ))}

                        {/* Show Popup on Hover */}
                        {hoveredPort && hoveredPortPosition && (
                            <Popup
                                latitude={hoveredPortPosition.latitude}
                                longitude={hoveredPortPosition.longitude}
                                closeButton={false}
                                closeOnClick={false}
                                offset={[-15, -15]}
                            >
                                <div>{hoveredPort}</div>
                            </Popup>
                        )}
                    </Map>

                    {/* SearchBar Overlay at the Top of the Map */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 w-full max-w-3xl px-4 z-10 pointer-events-auto">
                    <SearchBar
                            location={location}
                            setLocation={setLocation}
                            guests={guests}
                            setGuests={setGuests}
                            startDate={startDate}
                            setStartDate={setStartDate}
                            endDate={endDate}
                            setEndDate={setEndDate}
                            onSearch={handleSearch}
                        />
                    </div>

                    {/* Weather Component Positioned at Bottom Right of Map */}
                    <div className="absolute bottom-4 right-4">
                        <WeatherComponent latitude={viewport.latitude} longitude={viewport.longitude} />
                    </div>
                </div>

                {/* WaveRiders Recommendations Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-2xl font-bold text-gray-800">WaveRiders recommends for you</div>
                    <Link href="/auth/ListingsPage" className="flex items-center text-blue-500 hover:text-blue-700 transition text-base font-semibold px-3 py-2">
                        <span className="mr-1">See All</span>
                        <FaArrowRight />
                    </Link>
                </div>
                
                {/* Random Boat Listings */}
                {loading ? (
                    <p>Loading listings...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                        {boatListings.map((boat) => (
                            <BoatListingCard key={boat.boat_id} {...boat} />
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}

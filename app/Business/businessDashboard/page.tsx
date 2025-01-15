'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import BoatListingCard from "../../components/boatListingCard/BoatListingCard";
import BoatListingCard2 from "../../components/boatListingCard2/boatListingCard2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaArrowRight } from 'react-icons/fa';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface RecentActivity {
  boat_id: number;
  comment?: string;
  rating?: number;
}

interface FavoriteBoat {
  boat_id: number;
}

interface Listing {
  boat_id: number;
  photos?: string[];
  boat_name: string;
}

const BusinessDashboard = () => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const [businessOwner, setBusinessOwner] = useState<string>('');
  const [customerCounts, setCustomerCounts] = useState<number[]>([]);
  const [favoriteBoats, setFavoriteBoats] = useState<FavoriteBoat[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [dashboardListings, setDashboardListings] = useState<Listing[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    if (isLoading) return; // Kullanıcı durumu yüklenirken bekle

    if (!isLoggedIn) {
      // Kullanıcı giriş yapmamışsa, giriş yapma sayfasına yönlendir
      router.push('/auth/sign-in');
      return;
    }

    if (user?.account_type !== 'business') {
      // Kullanıcı giriş yapmış ama account_type 'business' değilse ana sayfaya yönlendir
      router.push('/');
      return;
    }
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // API çağrılarını paralel olarak başlat
        const [businessOwnerResponse, customerCountsResponse, dashboardListingsResponse, favoriteBoatsResponse, recentActivitiesResponse] = await Promise.all([
          fetch('https://api.waveriders.com.tr/api/business/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://api.waveriders.com.tr/api/business/dashboard/monthly-rentals', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://api.waveriders.com.tr/api/business/dashboard/listings', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://api.waveriders.com.tr/api/favorites/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://api.waveriders.com.tr/api/rentals/dashboard', { // <== recent activities request
            headers: { Authorization: `Bearer ${token}` }, // Token ekleniyor
          }),
        ]);


        // İşlemleri kontrol et ve sonuçları al
        if (businessOwnerResponse.ok) {
          const businessOwnerData = await businessOwnerResponse.json();
          setBusinessOwner(businessOwnerData.name);
        } else {
          throw new Error("Failed to fetch business owner");
        }

        if (customerCountsResponse.ok) {
          const customerCountsData = await customerCountsResponse.json();
          console.log('API Response:', customerCountsData);

          // Backend'den gelen veriyi doğru bir şekilde işleyin
          const monthlyRentals = Array(12).fill(0);
          customerCountsData.monthlyRentals.forEach((item: number | null, index: number) => {
            if (item !== undefined && item !== null) {
              monthlyRentals[index] = item;
            }
          });


          console.log('Processed Monthly Rentals:', monthlyRentals);
          setCustomerCounts(monthlyRentals); // State'i güncelle
        }
        else {
          throw new Error("Failed to fetch customer counts");
        }

        if (dashboardListingsResponse.ok) {
          const dashboardListingsData = await dashboardListingsResponse.json();
          setDashboardListings(dashboardListingsData.boats || []);
        } else {
          throw new Error("Failed to fetch dashboard listings");
        }


        if (favoriteBoatsResponse.ok) {
          const favoriteBoatsData = await favoriteBoatsResponse.json();
          console.log("Favorite Boats API Response:", favoriteBoatsData); // Gelen API yanıtını kontrol et
          setFavoriteBoats(favoriteBoatsData.boats || []);
        } else {
          console.error("Failed to fetch favorite boats");
        }

        if (recentActivitiesResponse.ok) {
          const recentActivitiesData = await recentActivitiesResponse.json();
          console.log("Recent Activities API Response:", recentActivitiesData); // Gelen API yanıtını kontrol et
          setRecentActivities(recentActivitiesData || []);
        } else {
          console.error("Failed to fetch recent activities");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }


    };

    fetchDashboardData();
  }, [isLoading, isLoggedIn, user, router]);

  
  if (isLoading) {
    return <p>Loading...</p>; // Yükleniyor ekranı
  }

  if (!isLoggedIn || user?.account_type !== 'business') {
    return null; // Kullanıcı uygun değilse hiçbir şey render etme
  }

  // Determine the months to display up to the current month
  const currentMonth = new Date().getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = months.slice(0, currentMonth + 1);

  // Grafik verisini backend'den gelen verilere bağla
  console.log('Customer Counts State:', customerCounts); // Grafik verisi oluşturulmadan önce kontrol
  const data = {
    labels: displayMonths,
    datasets: [
      {
        label: 'Customer Count',
        data: displayMonths.map((_, index) => customerCounts[index] || 0), // Eksik ayları 0 ile dolduruyor
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
      },
    ],
  };

  console.log('Graph Data:', data);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'This year',
          color: '#333',
          font: {
            size: 14, // Specify size explicitly
            family: 'Arial, sans-serif', // Specify font family explicitly
            weight: 'bold' as 'bold', // Use a type assertion to satisfy TypeScript
          },
        },
      },
      y: {
        ticks: {
          stepSize: 5,
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.3)',
        },
      },
    },
  };
  



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Welcome Section */}
      <div className="relative bg-gray-200 mt-10 w-[980px]">
        <div
          className="bg-cover bg-center w-full h-[480px] rounded-2xl shadow-lg overflow-hidden"
          style={{ backgroundImage: 'url(/images/customerDashboard.png)' }}
        >
          <div className="absolute inset-0 bg-black opacity-30 rounded-2xl"></div>
          <div className="absolute left-6 bottom-8 z-10">
            <h1 className="text-white text-4xl font-bold">
              Welcome back, {businessOwner}!
            </h1>
            <p className="text-white text-lg mt-2">
              Here&apos;s a look at your recent rentals!
            </p>
          </div>
        </div>
      </div>

      {/* Customer Count Graph */}
      <section className="p-6 w-[980px] mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Count</h2>
        <div
          className="rounded-lg shadow-md border"
          style={{
            width: '100%',
            height: '200px',
            padding: '16px',
            backgroundColor: '#f3f4f6',
            borderColor: '#d1d5db',
          }}
        >
          <Line data={data} options={options} />
        </div>
      </section>

      {/* Listings Section */}
      <section className="p-6 w-[980px] mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Listings</h2>
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md border">
          {dashboardListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {dashboardListings.map((listing) => (
                <div key={listing.boat_id} className="w-20 h-20 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={listing.photos ? listing.photos[0] : "/images/placeholder.png"}
                    alt={listing.boat_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>No listings found</p>
          )}
          <button
            onClick={() => router.push('/Business/allListings')}
            title="See all listings"
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          >
            <FaArrowRight />
          </button>
        </div>
      </section>


      {/* Your Favorite Listings */}
      {/* Your Favorite Listings */}
      <section className="p-6 w-[980px] mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Your Favorite Boats</h3>
          <button
            onClick={() => router.push('/Favourites')}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          >
            <FaArrowRight />
          </button>
        </div>
        <div
          className="p-6 border-2 rounded-lg"
          style={{ borderColor: '#d1d5db', backgroundColor: 'transparent' }}
        >
          {favoriteBoats.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteBoats.map((boat) => (
                <BoatListingCard key={boat.boat_id} boat_id={boat.boat_id} />
              ))}
            </div>
          ) : (
            <p className="text-center">No favorites found</p>
          )}
        </div>
      </section>




      {/* Your Recent Activities */}
      <section className="p-6 w-[980px] mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Your Recent Activities</h3>
          <button
            onClick={() => router.push('/RecentActivities')}
            title="See all your recent activities"
            className="flex items-center bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <FaArrowRight className="text-xl" />
          </button>
        </div>
        <div
          className="p-6 border-2 rounded-lg"
          style={{ borderColor: '#d1d5db', backgroundColor: 'transparent' }}
        >
          {recentActivities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentActivities.map((activity) => (
                <div key={activity.boat_id}>
                  {/* BoatListingCard Bileşeni */}
                  <BoatListingCard2 boat_id={activity.boat_id} />

                  {/* Yorum */}
                  {activity.comment ? (
                    <p className="text-sm text-gray-700 mt-2 text-center">
                      {activity.comment}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      No comment
                    </p>
                  )}

                  {/* Rating */}
                  <div className="mt-2 flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${i < (activity.rating || 0)
                            ? "text-yellow-500"
                            : "text-gray-300"
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No recent activities found</p>
          )}
        </div>
      </section>


    </div>
  );
};

export default BusinessDashboard;

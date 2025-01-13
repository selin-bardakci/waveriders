'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BoatListingCard from '../../components/boatListingCard/BoatListingCard';
import BoatListingCard2 from '../../components/boatListingCard2/boatListingCard2';
import { useAuth } from '../../context/AuthContext';
import { FaArrowRight } from 'react-icons/fa';

interface RecentActivity {
  boat_id: number;
  comment: string | null;
  rating: number | null;
}
const Dashboard = () => {
  const { user, isLoggedIn } = useAuth(); 
  const [businessOwner, setBusinessOwner] = useState<string>('');
  const [favoriteBoats, setFavoriteBoats] = useState<{ boat_id: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/sign-in'); 
      return;
    }

    if (user?.account_type !== 'customer') {
      router.push('/'); 
      return;
    }

   
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');


        const [businessOwnerResponse, favoriteBoatsResponse, recentActivitiesResponse] = await Promise.all([
          fetch('http://localhost:8081/api/business/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8081/api/favorites/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8081/api/rentals/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        
        if (businessOwnerResponse.ok) {
          const businessOwnerData = await businessOwnerResponse.json();
          setBusinessOwner(businessOwnerData.name);
        } else {
          console.error('Failed to fetch business owner');
        }

        if (favoriteBoatsResponse.ok) {
          const favoriteBoatsData = await favoriteBoatsResponse.json();
          setFavoriteBoats(favoriteBoatsData.boats || []);
        } else {
          console.error('Failed to fetch favorite boats');
        }

        if (recentActivitiesResponse.ok) {
          const recentActivitiesData: RecentActivity[] = await recentActivitiesResponse.json();
          setRecentActivities(recentActivitiesData || []);
        } else {
          console.error('Failed to fetch recent activities');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.account_type !== 'customer') {
    return null; 
  }

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
            <p className="text-white text-lg mt-2">Here's a look at your recent rentals!</p>
          </div>
        </div>
      </div>

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
                  {/* BoatListingCard Component */}
                  <BoatListingCard2 boat_id={activity.boat_id} />

                  {/* Comment */}
                  {activity.comment ? (
                    <p className="text-sm text-gray-700 mt-2 text-center">{activity.comment}</p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2 text-center">No comment</p>
                  )}

                  {/* Rating */}
                  <div className="mt-2 flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${
                          i < (activity.rating || 0) ? 'text-yellow-500' : 'text-gray-300'
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

export default Dashboard;

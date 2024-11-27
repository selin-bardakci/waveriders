'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowRight } from 'react-icons/fa';

// Define types for the data
interface Listing {
    id: number;
    icon: string;
    placeName: string;
    location: string;
}

interface Activity extends Listing {
    rating?: number | null;
    comment?: string | null;
}

// Sample data
const favoriteListings: Listing[] = [
    { id: 1, icon: 'icon1.png', placeName: 'Listing 1', location: 'Location 1' },
    { id: 2, icon: 'icon2.png', placeName: 'Listing 2', location: 'Location 2' },
    { id: 3, icon: 'icon3.png', placeName: 'Listing 3', location: 'Location 3' },
    { id: 4, icon: 'icon4.png', placeName: 'Listing 4', location: 'Location 4' },
];

const recentActivities: Activity[] = [
    { id: 5, icon: 'icon1.png', placeName: 'Activity 1', location: 'Location A', rating: 4, comment: 'Great place!' },
    { id: 6, icon: 'icon2.png', placeName: 'Activity 2', location: 'Location B', rating: 5, comment: 'Amazing experience!' },
    { id: 7, icon: 'icon3.png', placeName: 'Activity 3', location: 'Location C', rating: 3, comment: 'It was okay.' },
    { id: 8, icon: 'icon4.png', placeName: 'Activity 4', location: 'Location D', rating: null, comment: null },
];

const Dashboard: React.FC = () => {
    const router = useRouter();

    const renderListings = (listings: Listing[]) => (
        <div className="flex justify-between items-center w-full">
            {listings.map((listing) => (
                <div
                    key={listing.id}
                    className="flex flex-col items-center w-1/4 cursor-pointer"
                    onClick={() => router.push(`/listings/${listing.id}`)} // Updated route for listings/id.js
                >
                    <div className="w-40 h-40 rounded-lg overflow-hidden shadow-md">
                        <img
                            src={`/images/${listing.icon}`}
                            alt={`Icon for ${listing.placeName}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-lg mt-2">{listing.placeName}</p>
                    <p className="text-sm text-[#4b799c]">{listing.location}</p>
                </div>
            ))}
        </div>
    );

    const renderActivities = (activities: Activity[]) => (
        <div className="flex justify-between items-start w-full">
            {activities.map((activity) => (
                <div key={activity.id} className="flex flex-col items-center w-1/4 p-4">
                    <div className="w-40 h-40 rounded-lg overflow-hidden">
                        <img
                            src={`/images/${activity.icon}`}
                            alt={`Icon for ${activity.placeName}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-lg mt-2">{activity.placeName}</p>
                    <p className="text-sm text-[#4b799c]">{activity.location}</p>
                    <div className="mt-1 h-12 flex items-center justify-center">
                        {activity.comment ? (
                            <p className="text-sm text-gray-700 text-center">{activity.comment}</p>
                        ) : (
                            <p className="text-sm text-gray-500 text-center">No comment</p>
                        )}
                    </div>
                    <div className="mt-2 h-6 flex items-center justify-center">
                        {activity.rating !== null ? (
                            [...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-2xl ${i < activity.rating ? 'text-[#2195f3]' : 'text-gray-300'}`}
                                >
                                    ★
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Not ranked yet</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

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
                            Welcome back, Jane Doe!
                        </h1>
                        <p className="text-white text-lg mt-2">
                            Here's a look at your recent rentals!
                        </p>
                    </div>
                </div>
            </div>

            {/* Your Favorite Listings */}
            <section className="p-6 w-[980px] mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Your Favorite Listings</h3>
                    <button
                        onClick={() => router.push('http://localhost:3000/Customer/Favourites')}
                        title="See all your favourites"
                        className="flex items-center bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <FaArrowRight className="text-xl" />
                    </button>
                </div>
                <div className="p-6 border-2 border-gray-300 rounded-lg shadow-md" style={{ backgroundColor: 'transparent' }}>
                    {renderListings(favoriteListings)}
                </div>
            </section>

            {/* Your Recent Activities */}
            <section className="p-6 w-[980px] mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Your Recent Activities</h3>
                    <button
                        onClick={() => router.push('http://localhost:3000/Customer/RecentActivities')}
                        title="See all your recent activities"
                        className="flex items-center bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <FaArrowRight className="text-xl" />
                    </button>
                </div>
                <div className="p-6 border-2 border-gray-300 rounded-lg shadow-md" style={{ backgroundColor: 'transparent' }}>
                    {renderActivities(recentActivities)}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;

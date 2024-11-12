'use client';

import React from 'react';

// Define types for the data
interface Listing {
    icon: string;
    placeName: string;
    location: string;
}

interface Activity extends Listing {
    rating?: number | null;
    comment?: string | null;
}

interface ActivityLog extends Listing {}

const favoriteListings: Listing[] = [
    { icon: 'icon1.png', placeName: 'Listing 1', location: 'Location 1' },
    { icon: 'icon2.png', placeName: 'Listing 2', location: 'Location 2' },
    { icon: 'icon3.png', placeName: 'Listing 3', location: 'Location 3' },
    { icon: 'icon4.png', placeName: 'Listing 4', location: 'Location 4' },
];

const recentActivities: Activity[] = [
    { icon: 'icon1.png', placeName: 'Activity 1', location: 'Location A', rating: 4, comment: 'Great place!' },
    { icon: 'icon2.png', placeName: 'Activity 2', location: 'Location B', rating: 5, comment: 'Amazing experience!' },
    { icon: 'icon3.png', placeName: 'Activity 3', location: 'Location C', rating: 3, comment: 'It was okay.' },
    { icon: 'icon4.png', placeName: 'Activity 4', location: 'Location D', rating: null, comment: null },
];

const recentActivityLog: ActivityLog[] = [
    { icon: 'icon1.png', placeName: 'Log Activity 1', location: 'Log Location 1' },
    { icon: 'icon2.png', placeName: 'Log Activity 2', location: 'Log Location 2' },
    { icon: 'icon3.png', placeName: 'Log Activity 3', location: 'Log Location 3' },
    { icon: 'icon4.png', placeName: 'Log Activity 4', location: 'Log Location 4' },
];

const Dashboard: React.FC = () => {
    const renderListings = (listings: Listing[]) => (
        <div className="flex justify-between w-full mb-10">
            {listings.map((listing, index) => (
                <div key={index} className="flex flex-col items-center w-1/4">
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
        <div className="flex justify-between w-full mb-10">
            {activities.map((activity, index) => (
                <div key={index} className="flex flex-col items-center w-1/4">
                    <div className="w-40 h-40 rounded-lg overflow-hidden shadow-md">
                        <img 
                            src={`/images/${activity.icon}`} 
                            alt={`Icon for ${activity.placeName}`} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <p className="text-lg mt-2">{activity.placeName}</p>
                    <p className="text-sm text-[#4b799c]">{activity.location}</p>
                    {activity.comment && (
                        <>
                            <p className="text-sm mt-1">{activity.comment}</p>
                            <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-2xl ${i < (activity.rating || 0) ? 'text-[#2195f3]' : 'text-gray-300'}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                    {!activity.rating && (
                        <p className="text-sm text-gray-500 mt-1">Not ranked yet</p>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-gray-100">
            {/* Gradient Box */}
            <div className="bg-gradient-to-r from-[#dfe1e3] to-[#949698] p-10 rounded-lg shadow-md text-center w-4/5 mb-10 min-h-[300px] flex flex-col items-start justify-center">
                <h2 className="text-5xl font-semibold text-white">Welcome back, Emre!</h2>
                <p className="text-xl text-white mt-2">Here's a look at your recent activity</p>
            </div>

            {/* Your Favorite Listings */}
            <div className="mt-10 w-full max-w-4xl">
                <h3 className="text-2xl font-semibold mb-4">Your Favorite Listings</h3>
                {renderListings(favoriteListings)}
            </div>

            {/* Your Recent Activities */}
            <div className="mt-10 w-full max-w-4xl">
                <h3 className="text-2xl font-semibold mb-4">Your Recent Activities</h3>
                {renderActivities(recentActivities)}
            </div>

            {/* Recent Activity Log */}
            <div className="mt-10 w-full max-w-4xl">
                <h3 className="text-2xl font-semibold mb-4">Recent Activity Log</h3>
                <div className="flex flex-col space-y-4">
                    {recentActivityLog.slice(0, 6).map((activity, index) => (
                        <div key={index} className="flex items-center">
                            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md">
                                <img 
                                    src={`/images/${activity.icon}`} 
                                    alt={`Icon for ${activity.placeName}`} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <div className="ml-4 flex flex-col">
                                <p className="text-lg">{activity.placeName}</p>
                                <p className="text-sm text-[#4b799c]">{activity.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

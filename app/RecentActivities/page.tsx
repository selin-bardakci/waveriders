'use client';

import { useState } from 'react';
import { FaStar } from 'react-icons/fa'; 

const activitiesData = [
  { 
    id: 1, 
    name: 'Luxury Yacht', 
    image: '/images/yacht.jpg', 
    rating: null, 
    comment: null 
  },
  { 
    id: 2, 
    name: 'Fishing Boat', 
    image: '/images/fishingboat.jpg', 
    rating: null, 
    comment: null 
  },
  { 
    id: 3, 
    name: 'Motorboat', 
    image: '/images/motorboat.jpg', 
    rating: 4.5, 
    comment: 'Great experience, very smooth ride!' 
  },
];

const CustomerRecentActivities = () => {
  const [activities, setActivities] = useState(activitiesData);
  const [showRankModal, setShowRankModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);

  const [generalRating, setGeneralRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [comment, setComment] = useState('');

  const openRankModal = (activity) => {
    setCurrentActivity(activity);
    setShowRankModal(true);
  };

  const closeRankModal = () => {
    setShowRankModal(false);
    setGeneralRating(0);
    setDriverRating(0);
    setCleanlinessRating(0);
    setComment('');
  };

  const saveRank = () => {
    const averageRating = ((generalRating + driverRating + cleanlinessRating) / 3).toFixed(1);

    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        activity.id === currentActivity.id
          ? { ...activity, rating: averageRating, comment }
          : activity
      )
    );
    closeRankModal();
  };

  const renderStars = (count, onClick) => (
    [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`cursor-pointer ${index < count ? 'text-yellow-500' : 'text-gray-300'}`}
        onClick={() => onClick(index + 1)}
      />
    ))
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Recent Activities</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex flex-col items-center">
            <div 
              className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center" 
            >
              <img src={activity.image} alt={activity.name} className="object-cover w-full h-full" />
            </div>
            <div className="mt-2 flex flex-col items-center w-full">
              <h3 className="text-md font-semibold text-gray-800">{activity.name}</h3>
              {activity.rating ? (
                <>
                  <div className="flex items-center mt-1">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span className="text-gray-800 font-medium">{activity.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 text-center">{activity.comment}</p>
                </>
              ) : (
                <button
                  onClick={() => openRankModal(activity)}
                  className="mt-2 bg-blue-500 text-white text-sm font-semibold py-1 px-4 rounded hover:bg-blue-600 transition"
                >
                  Rank Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rank Modal */}
      {showRankModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rate {currentActivity.name}</h3>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">General Rating</p>
              <div className="flex justify-center">{renderStars(generalRating, setGeneralRating)}</div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Driver Rating</p>
              <div className="flex justify-center">{renderStars(driverRating, setDriverRating)}</div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Cleanliness & Comfort</p>
              <div className="flex justify-center">{renderStars(cleanlinessRating, setCleanlinessRating)}</div>
            </div>
            <textarea
              placeholder="Write your review optional)"
              className="w-full border rounded-lg p-2 text-sm text-gray-800"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={closeRankModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveRank}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                disabled={!generalRating || !driverRating || !cleanlinessRating}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRecentActivities;

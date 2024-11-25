"use client";

import { useState } from 'react';
import { FaStar } from 'react-icons/fa'; // Yıldız ikonu için Font Awesome kullanıyoruz

const listingsData = [
  { id: 1, name: 'Sailboat', image: '/images/customerDashboard.png', rating: 4.8 },
  { id: 2, name: 'Motorboat', image: '/images/motorboat.jpg', rating: 4.5 },
  { id: 3, name: 'Yacht', image: '/images/yacht.jpg', rating: 4.9 },
  { id: 4, name: 'Houseboat', image: '/images/houseboat.jpg', rating: 4.7 },
  { id: 5, name: 'Fishing boat', image: '/images/fishingboat.jpg', rating: 4.6 },
];

const AllListings = () => {
  const [listings, setListings] = useState(listingsData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setSelectedListing(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setListings((prevListings) => prevListings.filter((listing) => listing.id !== selectedListing));
    setShowDeleteModal(false);
    setSelectedListing(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedListing(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Listings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-6">
        {listings.map((listing) => (
          <div key={listing.id} className="flex flex-col items-center">
            <div 
              className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center" 
            >
              <img src={listing.image} alt={listing.name} className="object-cover w-full h-full" />
            </div>
            <div className="mt-2 flex flex-col items-center w-full">
              <h3 className="text-md font-semibold text-gray-800">{listing.name}</h3>
              <div className="flex items-center mt-1">
                <FaStar className="text-yellow-500 mr-1" /> {/* Yıldız ikonu */}
                <span className="text-gray-800 font-medium">{listing.rating}</span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteClick(listing.id)}
              className="mt-2 bg-blue-500 text-white text-sm font-semibold py-1 px-4 rounded hover:bg-blue-600 transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Are you sure you want to delete this listing?</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllListings;

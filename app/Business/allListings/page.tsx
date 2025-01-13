"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import BoatListingCard from "../../components/boatListingCard/BoatListingCard";
import { useRouter } from 'next/navigation';

const AllListings = () => {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentBoatId, setCurrentBoatId] = useState<number | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8081/api/business/listings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setListings(response.data.boats);
        } else {
          throw new Error("Failed to fetch listings");
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Failed to fetch listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const openConfirmModal = (boat_id: number) => {
    setCurrentBoatId(boat_id);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setCurrentBoatId(null);
  };

  const handleRemoveListing = async () => {
    if (!currentBoatId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8081/api/boats/${currentBoatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((boat: any) => boat.boat_id !== currentBoatId));
    } catch (err) {
      console.error("Error removing listing:", err);
      alert("Failed to remove listing.");
    } finally {
      closeConfirmModal();
    }
  };

  if (loading) return <p>Loading listings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto py-4 w-full md:w-3/4 lg:w-4/5">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Your Listings</h2>
        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {listings.length > 0 ? (
            listings.map((boat: any) => (
              <div key={boat.boat_id} className="relative">
                <BoatListingCard boat_id={boat.boat_id} />
                <button
                  onClick={() => openConfirmModal(boat.boat_id)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 transition"
                >
                  Remove Listing
                </button>
                <div className="flex justify-center mt-4">
                <button
              onClick={() => router.push(`/listings/${boat.boat_id}/edit`)}
              className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
             Edit Your Listing
              </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-700">No listings found.</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[400px] h-[150px]">
            <p className="text-gray-800 mb-6">
              Are you sure you want to remove this listing?
            </p>
            <div className="flex justify-around">
              <button
                onClick={closeConfirmModal}
                className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveListing}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllListings;

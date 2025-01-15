"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import BoatListingCard from "../components/boatListingCard/BoatListingCard";
import { useAuth } from "../context/AuthContext";

const Favourites = () => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentBoatId, setCurrentBoatId] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      router.push("/auth/sign-in"); // Giriş yapılmamışsa giriş sayfasına yönlendir
      return;
    }

    if (user?.account_type === "admin") {
      router.push("/admin/control"); // Admin ise kontrol paneline yönlendir
      return;
    }
    
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://api.waveriders.com.tr/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setFavorites(response.data.favorites);
        } else {
          throw new Error("Failed to fetch favorites");
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Failed to fetch favorite boats.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isLoading, isLoggedIn, user, router]);
  
  if (isLoading || !isLoggedIn || user?.account_type === "admin") {
    return null; // Yükleniyor ya da yönlendirme sırasında hiçbir şey render etme
  }
  
  const openConfirmModal = (boat_id: number) => {
    setCurrentBoatId(boat_id);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setCurrentBoatId(null);
  };

  const handleRemoveFavorite = async () => {
    if (!currentBoatId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete("https://api.waveriders.com.tr/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
        data: { boat_id: currentBoatId },
      });
      setFavorites((prev) => prev.filter((boat: any) => boat.boat_id !== currentBoatId));
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Failed to remove boat from favorites.");
    } finally {
      closeConfirmModal();
    }
  };

  if (loading) return <p>Loading your favorite boats...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto py-4 w-full md:w-3/4 lg:w-4/5">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Your Favourite Listings</h2>
        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {favorites.length > 0 ? (
            favorites.map((boat: any) => (
              <div key={boat.boat_id} className="relative">
                <BoatListingCard boat_id={boat.boat_id} />
                <button
                  onClick={() => openConfirmModal(boat.boat_id)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-700">No favorite boats added yet.</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[400px] h-[150px]">
            <p className="text-gray-800 mb-6">
              Are you sure you want to remove this boat from favorites?
            </p>
            <div className="flex justify-around">
              <button
                onClick={closeConfirmModal}
                className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveFavorite}
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

export default Favourites;

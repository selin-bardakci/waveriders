"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import BoatListingCard from "../components/boatListingCard/BoatListingCard";


const Favourites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8081/api/favorites", {
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
  }, []);

  const handleRemoveFavorite = async (boat_id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:8081/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
        data: { boat_id },
      });
      setFavorites((prev) => prev.filter((boat: any) => boat.boat_id !== boat_id));
      alert("Boat removed from favorites.");
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Failed to remove boat from favorites.");
    }
  };

  if (loading) return <p>Loading your favorite boats...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto py-4 w-full md:w-3/4 lg:w-4/5">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 pl-0 ">Your Favourite Listings</h2>
        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {favorites.length > 0 ? (
            favorites.map((boat: any) => (
              <div key={boat.boat_id} className="relative">
                <BoatListingCard boat_id={boat.boat_id} />

                <button
                  onClick={() => handleRemoveFavorite(boat.boat_id)}
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
    </div>
  );
};

export default Favourites;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

interface BoatListingCardProps {
  boat_id: number;
}

const BoatListingCard: React.FC<BoatListingCardProps> = ({ boat_id }) => {
  const [boat, setBoat] = useState<any>(null);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/listings/${boat_id}`);
        if (response.status === 200) {
          setBoat(response.data);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        console.error(`Error fetching boat details for ID ${boat_id}:`, err);
        setError("Failed to load boat details.");
      }
    };

    fetchBoatDetails();
  }, [boat_id]);

  if (error) {
    console.error(`Error rendering card for ID ${boat_id}:`, error);
    return <p className="text-red-500">{error}</p>;
  }

  if (!boat) {
    return <p>Loading...</p>;
  }

  const { boat_name, price_per_hour, price_per_day, capacity, location, photos } = boat;

  // Use the first photo URL directly (already signed)
  const imageUrl = photos && photos.length > 0 ? photos[0] : null;

  return (
    <Link href={`/listings/${boat_id}`} passHref>
  <div
    onClick={() => {
      const currentPage = window.location.pathname; // Get current path
      let source;

      if (currentPage === "/") {
        source = "homepage";
      } else if (currentPage === "/ListingsPage") {
        source = "ListingsPage";
      } else if (currentPage === "/allListings") {
        source = "allListings";
      } else if (currentPage === "/Favourites") {
        source = "Favourites";
      }else if (currentPage === "/RecentActivities") {
        source = "RecentActivities";
      } else {
        source = "OtherPage"; // Fallback for unhandled routes
      }
      sessionStorage.setItem("navigation_source", source); // Save source to sessionStorage
    }}
    className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
  >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Image of ${boat_name}`}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{boat_name || "Unknown Boat"}</h3>
          <p className="text-sm text-gray-500">
            {price_per_day
              ? `$${Number(price_per_day).toFixed(2)}/day`
              : price_per_hour
              ? `$${Number(price_per_hour).toFixed(2)}/hour`
              : "Price Unavailable"}{" "}
            • {capacity || "N/A"} guests
          </p>
          <p className="text-sm text-gray-500">{location || "Location Unavailable"}</p>
        </div>
      </div>
    </Link>
  );
};

export default BoatListingCard;

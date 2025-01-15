"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface BoatListingCardProps {
  boat_id: number;
}

const BoatListingCard: React.FC<BoatListingCardProps> = ({ boat_id }) => {
  const [boat, setBoat] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const response = await axios.get(`https://api.waveriders.com.tr/api/listings/${boat_id}`);
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

  const { boat_name, photos } = boat;

  // Use the first photo URL directly (already signed)
  const imageUrl = photos && photos.length > 0 ? photos[0] : null;

  return (
    <Link href={`/listings/${boat_id}`} passHref>
      <div className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Image of ${boat_name}`}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
            No Image Available
          </div>
        )}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-center text-sm font-medium text-gray-800 truncate">
            {boat_name || "Unknown Boat"}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default BoatListingCard;

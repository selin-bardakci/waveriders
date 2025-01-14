"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface BoatListingCardProps {
  boat_id: number;
}

const BoatListingCard: React.FC<BoatListingCardProps> = ({ boat_id }) => {
  const [boat, setBoat] = useState<any>(null);
  const [tripTypes, setTripTypes] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/listings/${boat_id}`
        );
        if (response.status === 200) {
          const data = response.data;
          setBoat(data);

          // data.trip_types might be "short, day, sunrise" or similar
          // If it's an array, handle accordingly (e.g. setTripTypes(data.trip_types))
          const rawTypes = data?.trip_types || "";
          if (typeof rawTypes === "string") {
            const splitted = rawTypes
              .split(",")
              .map((type: string) => type.trim())
              .filter((t: string) => t !== "");
            setTripTypes(splitted);
          } else if (Array.isArray(rawTypes)) {
            setTripTypes(rawTypes);
          } else {
            setTripTypes([]);
          }
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (err: any) {
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

  // Determine whether boat has overnight vs. hourly trips
  const hasOvernight = tripTypes.includes("overnight");
  const hasHourlyTrip = tripTypes.some((t) =>
    ["short", "day", "sunrise"].includes(t)
  );

  // Decide how to display price
  let priceDisplay = "";
  if (hasOvernight && hasHourlyTrip) {
    priceDisplay = `From $${Number(price_per_hour).toFixed(2)}/hour or $${Number(
      price_per_day
    ).toFixed(2)}/day`;
  } else if (hasOvernight) {
    // Only overnight
    if (price_per_day && Number(price_per_day) > 0) {
      priceDisplay = `$${Number(price_per_day).toFixed(2)}/day`;
    } else {
      priceDisplay = "Price Unavailable";
    }
  } else if (hasHourlyTrip) {
    // Short/day/sunrise
    if (price_per_hour && Number(price_per_hour) > 0) {
      priceDisplay = `$${Number(price_per_hour).toFixed(2)}/hour`;
    } else {
      priceDisplay = "Price Unavailable";
    }
  } else {
    priceDisplay = "Price Unavailable";
  }

  // Use first photo if available
  const imageUrl = photos && photos.length > 0 ? photos[0] : "/fallback.jpg";

  return (
    <Link href={`/listings/${boat_id}`} passHref>
      <div
        onClick={() => {
          // Optional: track navigation source
          const currentPage = window.location.pathname;
          let source;
          if (currentPage === "/") {
            source = "homepage";
          } else if (currentPage === "/ListingsPage") {
            source = "ListingsPage";
          } else if (currentPage === "/allListings") {
            source = "allListings";
          } else if (currentPage === "/Favourites") {
            source = "Favourites";
          } else if (currentPage === "/RecentActivities") {
            source = "RecentActivities";
          } else {
            source = "OtherPage";
          }
          sessionStorage.setItem("navigation_source", source);
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
          <h3 className="text-lg font-semibold truncate">
            {boat_name || "Unknown Boat"}
          </h3>
          <p className="text-sm text-gray-500">
            {priceDisplay} • {capacity || "N/A"} guests
          </p>
          <p className="text-sm text-gray-500">
            {location || "Location Unavailable"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BoatListingCard;

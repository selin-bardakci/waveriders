"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import BoatListingCard from "../components/boatListingCard/BoatListingCard";

const CustomerRecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRankModal, setShowRankModal] = useState(false);
  const [showReviewConfirmationModal, setShowReviewConfirmationModal] = useState(false);
  const [showBookingCancelModal, setShowBookingCancelModal] = useState(false);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [generalRating, setGeneralRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [comment, setComment] = useState("");

  // Fetch recent rentals
  useEffect(() => {
    const fetchRecentRentals = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8081/api/rentals/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const sortedActivities = response.data.sort((a, b) => {
            if (a.status === "ongoing" && b.status !== "ongoing") return -1;
            if (a.status !== "ongoing" && b.status === "ongoing") return 1;
            if (!a.rating && b.rating) return -1;
            if (a.rating && !b.rating) return 1;
            return 0;
          });

          setActivities(sortedActivities);
        } else {
          throw new Error("Failed to fetch recent rentals");
        }
      } catch (err) {
        console.error("Error fetching recent rentals:", err);
        setError("Failed to fetch recent rentals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentRentals();
  }, []);

  const openRankModal = (activity) => {
    setCurrentActivity(activity);
    setShowRankModal(true);
  };

  const closeRankModal = () => {
    setShowRankModal(false);
    setGeneralRating(0);
    setDriverRating(0);
    setCleanlinessRating(0);
    setComment("");
  };

  const openBookingDetailsModal = async (activity) => {
    setCurrentActivity(activity);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8081/api/rentals/${activity.rental_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setBookingDetails(response.data);
        setShowBookingDetailsModal(true);
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
    }
  };


  const closeBookingDetailsModal = () => {
    setShowBookingDetailsModal(false);
    setBookingDetails(null);
  };


  const openDetailsModal = (activity) => {
    setCurrentActivity(activity);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
  };

  const openReviewConfirmationModal = () => {
    setShowReviewConfirmationModal(true);
  };

  const closeReviewConfirmationModal = () => {
    setShowReviewConfirmationModal(false);
  };

  const openBookingCancelModal = () => {
    setShowBookingCancelModal(true);
  };

  const closeBookingCancelModal = () => {
    setShowBookingCancelModal(false);
  };

  const cancelBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8081/api/rentals/${currentActivity.rental_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setActivities((prev) =>
        prev.filter((activity) => activity.rental_id !== currentActivity.rental_id)
      );
      closeBookingCancelModal();
      closeBookingDetailsModal();
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  const saveRank = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8081/api/rentals/review",
        {
          rental_id: currentActivity.rental_id,
          general_rating: generalRating,
          driver_rating: driverRating,
          cleanliness_rating: cleanlinessRating,
          review_text: comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        const updatedActivities = await axios.get("http://localhost:8081/api/rentals/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedActivities = updatedActivities.data.sort((a, b) => {
          if (a.status === "ongoing" && b.status !== "ongoing") return -1;
          if (a.status !== "ongoing" && b.status === "ongoing") return 1;
          if (!a.rating && b.rating) return -1;
          if (a.rating && !b.rating) return 1;
          return 0;
        });

        setActivities(sortedActivities);
        closeRankModal();
        alert("Your review has been submitted successfully!");
      }
    } catch (err) {
      console.error("Error saving rating:", err);
      alert("An error occurred while submitting your review. Please try again later.");
    }
  };

  const handleRemoveReview = async (rental_id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8081/api/rentals/review/${rental_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setActivities((prev) =>
        prev.filter((activity) => activity.rental_id !== rental_id)
      );
      closeReviewConfirmationModal();
    } catch (err) {
      console.error("Error removing review:", err);
    }
  };



  if (loading) return <p>Loading your recent activities...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto py-4 w-full md:w-3/4 lg:w-4/5">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Recent Activities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div key={activity.rental_id} className="relative">
              <BoatListingCard boat_id={activity.boat_id} />
              <div className="flex justify-center items-center mt-4">

              {activity.status === "completed" && !activity.rating ? (
                  <button
                    onClick={() => openRankModal(activity)}
                    className="bg-blue-500 text-white text-sm font-semibold py-1 px-4 rounded hover:bg-blue-600 transition"
                  >
                    Rank Now
                  </button>
                ) : activity.status === "completed" && activity.rating ? (
                  <button
                    onClick={() => openDetailsModal(activity)}
                    className="bg-blue-500 text-white text-sm font-semibold py-1 px-4 rounded hover:bg-blue-600 transition"
                  >
                    See Rating Details
                  </button>
                ) : activity.status === "ongoing" ? (
                  <>
                    <button
                      onClick={() => openBookingDetailsModal(activity)}
                      className="bg-gray-300 text-gray-700 text-sm font-semibold py-1 px-4 rounded hover:bg-gray-400 transition"
                    >
                      See Booking Details
                    </button>
                    <button
                      onClick={openBookingCancelModal}
                       className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 transition"
                    >
                      Cancel Booking
                    </button>
                  </>
                ) : null}

              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Booking Details Modal */}
      {showBookingDetailsModal && bookingDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Details</h3>
            <p className="text-sm font-medium text-gray-700">Start Date: {new Date(bookingDetails.start_date).toISOString().split('T')[0]}</p>
            <p className="text-sm font-medium text-gray-700">Total Price: ${bookingDetails.total_price}</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={closeBookingDetailsModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showBookingCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Are you sure you want to cancel this booking?</h3>
            <div className="flex justify-around mt-4">
              <button
                onClick={closeBookingCancelModal}
                className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={cancelBooking}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rank Modal */}
      {showRankModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rate {currentActivity.name}</h3>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">General Rating</p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`cursor-pointer ${index < generalRating ? "text-yellow-500" : "text-gray-300"}`}
                    onClick={() => setGeneralRating(index + 1)}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Driver Rating</p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`cursor-pointer ${index < driverRating ? "text-yellow-500" : "text-gray-300"}`}
                    onClick={() => setDriverRating(index + 1)}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Cleanliness & Comfort</p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`cursor-pointer ${index < cleanlinessRating ? "text-yellow-500" : "text-gray-300"}`}
                    onClick={() => setCleanlinessRating(index + 1)}
                  />
                ))}
              </div>
            </div>
            <textarea
              placeholder="Write your review (optional)"
              className="w-full border rounded-lg p-2 text-sm text-gray-800"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button onClick={closeRankModal} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                Cancel
              </button>
              <button
                onClick={saveRank}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                disabled={!generalRating || !driverRating || !cleanlinessRating}
              >Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Details Modal */}
      {showDetailsModal && currentActivity && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Ranking Details</h3>

            {/* General Rating */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">General Rating:</p>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < currentActivity.rating ? "text-yellow-500" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>

            {/* Driver Rating */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Driver Rating:</p>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < currentActivity.driver ? "text-yellow-500" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>

            {/* Cleanliness Rating */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Cleanliness & Comfort:</p>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < currentActivity.cleanliness ? "text-yellow-500" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-700">Comment:</p>
              <p className="text-sm text-gray-600">{currentActivity.comment || "No comment provided"}</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={closeDetailsModal}
                className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowReviewConfirmationModal(true);
                }}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Remove Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Confirmation Modal */}
      {showReviewConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
            <h3 className="text-lg  text-gray-800 mb-4">
              Are you sure you want to remove this review?
            </h3>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => {
                  setShowReviewConfirmationModal(false);
                  setShowDetailsModal(true);
                }}
                className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRemoveReview(currentActivity.rental_id);
                  setShowReviewConfirmationModal(false);
                }}
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

export default CustomerRecentActivities;

               

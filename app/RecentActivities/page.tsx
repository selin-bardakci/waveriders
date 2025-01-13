'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import BoatListingCard from "../components/boatListingCard/BoatListingCard";
import { format, parseISO, isValid as isValidDateFn } from 'date-fns';

// Type Definitions
interface Rating {
  general_rating: number;
  driver_rating: number;
  cleanliness_rating: number;
  review_text?: string;
}

interface BookingDetails {
  rental_id: string;
  boat_id: string;
  name?: string;
  start_date: string; // 'YYYY-MM-DD' format
  end_date?: string;  // 'YYYY-MM-DD' format, optional
  start_time?: string; // 'HH:mm' format, optional
  end_time?: string;  // 'HH:mm' format, optional
  total_price: number; // Changed from rental_price to total_price
  status: string;
  rating?: Rating | null; // Rating structure
}

const CustomerRecentActivities = () => {
  const [activities, setActivities] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal visibility states
  const [showRankModal, setShowRankModal] = useState(false);
  const [showReviewConfirmationModal, setShowReviewConfirmationModal] = useState(false);
  const [showBookingCancelModal, setShowBookingCancelModal] = useState(false);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [currentActivity, setCurrentActivity] = useState<BookingDetails | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Rating states
  const [generalRating, setGeneralRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [comment, setComment] = useState("");

  // Submission message state
  const [submissionMessage, setSubmissionMessage] = useState<{ type: string; text: string } | null>(null);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    general: false,
    driver: false,
    cleanliness: false,
  });

  // Tooltip state for disabled submit button (optional)
  const [showTooltip, setShowTooltip] = useState(false);

  // Function to validate date
  const isValidDate = (dateString?: string): boolean => {
    if (!dateString) return false;
    try {
      const date = parseISO(dateString);
      return isValidDateFn(date);
    } catch (error) {
      return false;
    }
  };

  // Function to validate time
  const isValidTime = (timeString?: string): boolean => {
    if (!timeString) return false;
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(timeString);
  };

  // Fetch recent rentals
  useEffect(() => {
    const fetchRecentRentals = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8081/api/rentals/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const sortedActivities = response.data.sort((a: BookingDetails, b: BookingDetails) => {
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

  // Modal open and close functions
  const openRankModal = (activity: BookingDetails) => {
    setCurrentActivity(activity);
    setShowRankModal(true);
  };

  const closeRankModal = () => {
    setShowRankModal(false);
    setGeneralRating(0);
    setDriverRating(0);
    setCleanlinessRating(0);
    setComment("");
    setValidationErrors({ general: false, driver: false, cleanliness: false });
  };

  const openBookingDetailsModal = async (activity: BookingDetails) => {
    setCurrentActivity(activity);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const response = await axios.get(`http://localhost:8081/api/rentals/${activity.rental_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setBookingDetails(response.data);
        setShowBookingDetailsModal(true);
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError("Failed to fetch booking details. Please try again later.");
    }
  };

  const closeBookingDetailsModal = () => {
    setShowBookingDetailsModal(false);
    setBookingDetails(null);
  };

  const openDetailsModal = (activity: BookingDetails) => {
    setCurrentActivity(activity);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
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

  // Cancel booking
  const cancelBooking = async () => {
    if (!currentActivity) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      await axios.delete(`http://localhost:8081/api/rentals/${currentActivity.rental_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setActivities((prev) =>
        prev.filter((activity) => activity.rental_id !== currentActivity.rental_id)
      );
      closeBookingCancelModal();
      closeBookingDetailsModal();
      setSubmissionMessage({ type: "success", text: "Booking has been canceled successfully!" });
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("Failed to cancel booking. Please try again later.");
    }
  };

  // Save rating
  const saveRank = async () => {
    // Reset validation errors
    setValidationErrors({
      general: !generalRating,
      driver: !driverRating,
      cleanliness: !cleanlinessRating,
    });

    // Debugging: Log validation errors
    console.log("Validation Errors:", {
      general: !generalRating,
      driver: !driverRating,
      cleanliness: !cleanlinessRating,
    });

    // Stop if any rating is missing
    if (!generalRating || !driverRating || !cleanlinessRating) {
      return;
    }

    if (!currentActivity) {
      setError("No activity selected for rating.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

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
        // Update the specific activity with the new rating
        setActivities((prev) =>
          prev.map((activity) =>
            activity.rental_id === currentActivity.rental_id
              ? {
                  ...activity,
                  rating: {
                    general_rating: generalRating,
                    driver_rating: driverRating,
                    cleanliness_rating: cleanlinessRating,
                    review_text: comment,
                  },
                }
              : activity
          )
        );
        closeRankModal();
        setSubmissionMessage({ type: "success", text: "Your review has been submitted successfully!" });
      } else {
        throw new Error("Failed to submit review");
      }
    } catch (err) {
      console.error("Error saving rating:", err);
      setSubmissionMessage({ type: "error", text: "An error occurred while submitting your review. Please try again later." });
    }
  };

  // Remove review
  const handleRemoveReview = async (rental_id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      await axios.delete(`http://localhost:8081/api/rentals/review/${rental_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the specific activity's rating fields to null
      setActivities((prev) =>
        prev.map((activity) => {
          if (activity.rental_id === rental_id) {
            return {
              ...activity,
              rating: null,
            };
          }
          return activity;
        })
      );
      closeReviewConfirmationModal();
      setSubmissionMessage({ type: "success", text: "Your review has been removed successfully!" });
    } catch (err) {
      console.error("Error removing review:", err);
      setError("Failed to remove review. Please try again later.");
    }
  };

  // Handle mouse enter and leave for tooltip (optional)
  const handleMouseEnter = () => {
    if (!generalRating || !driverRating || !cleanlinessRating) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Render loading or error states
  if (loading) return <p>Loading your recent activities...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      {/* Submission Message */}
      {submissionMessage && (
        <div
          className={`mb-4 p-4 rounded ${
            submissionMessage.type === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
          } text-center`}
        >
          {submissionMessage.text}
        </div>
      )}

      <div className="container mx-auto py-4 w-full md:w-3/4 lg:w-4/5">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Recent Activities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div key={activity.rental_id} className="relative">
              <BoatListingCard boat_id={Number(activity.boat_id)} />
              <div className="flex justify-center items-center mt-4 space-x-2">
                {activity.status === "completed" && !activity.rating && (
                  <button
                    onClick={() => openRankModal(activity)}
                    className="bg-blue-500 text-white text-sm font-semibold py-1 px-4 rounded hover:bg-blue-600 transition"
                  >
                    Rank Now
                  </button>
                )}
                {activity.status === "completed" && activity.rating && (
                  <button
                    onClick={() => openDetailsModal(activity)}
                    className="bg-blue-500 text-white text-sm font-semibold py-1 px-4 rounded hover:bg-blue-600 transition"
                  >
                    See Rating Details
                  </button>
                )}
                {activity.status === "ongoing" && (
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
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingDetailsModal && bookingDetails && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-labelledby="booking-details-title"
          aria-modal="true"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-96" id="booking-details-title">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Booking Details</h3>
            <div className="text-sm font-medium text-gray-700 mb-2">
              <p>Start Date:</p>
              {bookingDetails.start_date && isValidDate(bookingDetails.start_date) ? (
                <p>{format(parseISO(bookingDetails.start_date), 'dd/MM/yyyy')}</p>
              ) : (
                <p className="text-red-500">Invalid Start Date</p>
              )}
            </div>
            {/* Conditional Rendering of End Date */}
            {bookingDetails.end_date && bookingDetails.end_date !== bookingDetails.start_date && (
              <div className="text-sm font-medium text-gray-700 mb-2">
                <p>End Date:</p>
                {isValidDate(bookingDetails.end_date) ? (
                  <p>{format(parseISO(bookingDetails.end_date), 'dd/MM/yyyy')}</p>
                ) : (
                  <p className="text-red-500">Invalid End Date</p>
                )}
              </div>
            )}
            {/* Conditional Rendering of Times */}
            {bookingDetails.end_date && bookingDetails.end_date === bookingDetails.start_date && (
              <>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  <p>Start Time:</p>
                  {bookingDetails.start_time && isValidTime(bookingDetails.start_time) ? (
                    <p>{bookingDetails.start_time}</p>
                  ) : (
                    <p className="text-red-500">Invalid Start Time</p>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  <p>End Time:</p>
                  {bookingDetails.end_time && isValidTime(bookingDetails.end_time) ? (
                    <p>{bookingDetails.end_time}</p>
                  ) : (
                    <p className="text-red-500">Invalid End Time</p>
                  )}
                </div>
              </>
            )}
            <p className="text-sm font-medium text-gray-700">Total Price: ${bookingDetails.total_price}</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={closeBookingDetailsModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Cancellation Confirmation Modal */}
      {showBookingCancelModal && currentActivity && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-labelledby="cancel-booking-title"
          aria-modal="true"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80" id="cancel-booking-title">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Are you sure you want to cancel this booking?</h3>
            <div className="flex justify-around mt-4">
              <button
                onClick={closeBookingCancelModal}
                className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={cancelBooking}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition"
                type="button"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rank Modal */}
      {showRankModal && currentActivity && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-labelledby="rank-modal-title"
          aria-modal="true"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96" id="rank-modal-title">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rate {currentActivity.name || "this boat"}</h3>

            {/* General Rating */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">General Rating</p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`cursor-pointer ${
                      index < generalRating ? "text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => setGeneralRating(index + 1)}
                  />
                ))}
              </div>
              {validationErrors.general && (
                <p className="text-red-500 text-xs mt-1">Please rate this category.</p>
              )}
            </div>

            {/* Driver Rating */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Driver Rating</p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`cursor-pointer ${
                      index < driverRating ? "text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => setDriverRating(index + 1)}
                  />
                ))}
              </div>
              {validationErrors.driver && (
                <p className="text-red-500 text-xs mt-1">Please rate this category.</p>
              )}
            </div>

            {/* Cleanliness Rating */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Cleanliness & Comfort</p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`cursor-pointer ${
                      index < cleanlinessRating ? "text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => setCleanlinessRating(index + 1)}
                  />
                ))}
              </div>
              {validationErrors.cleanliness && (
                <p className="text-red-500 text-xs mt-1">Please rate this category.</p>
              )}
            </div>

            {/* Comment */}
            <textarea
              placeholder="Write your review (optional)"
              className="w-full border rounded-lg p-2 text-sm text-gray-800"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={closeRankModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                type="button" // Explicitly set type to prevent form submission
              >
                Cancel
              </button>
              <div className="relative">
                <button
                  onClick={saveRank}
                  className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition ${
                    !generalRating || !driverRating || !cleanlinessRating
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  // disabled={!generalRating || !driverRating || !cleanlinessRating} // Removed disabled
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  type="button" // Explicitly set type to prevent form submission
                >
                  Submit
                </button>
                {/* Tooltip (optional) */}
                {showTooltip && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2">
                    Please fill out all rating fields to submit.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Details Modal */}
      {showDetailsModal && currentActivity && currentActivity.rating && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-labelledby="ranking-details-title"
          aria-modal="true"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96" id="ranking-details-title">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Ranking Details</h3>

            {/* General Rating */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">General Rating:</p>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < (currentActivity.rating?.general_rating || 0) ? "text-yellow-500" : "text-gray-300"}
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
                    className={index < (currentActivity.rating?.driver_rating || 0) ? "text-yellow-500" : "text-gray-300"}
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
                    className={index < (currentActivity.rating?.cleanliness_rating || 0) ? "text-yellow-500" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            {currentActivity.rating?.review_text && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="font-semibold text-gray-700">Comment:</p>
                <p className="text-sm text-gray-600">
                  {currentActivity.rating.review_text}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={closeDetailsModal}
                className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                type="button"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowReviewConfirmationModal(true);
                }}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition"
                type="button"
              >
                Remove Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Confirmation Modal */}
      {showReviewConfirmationModal && currentActivity && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-labelledby="review-confirmation-title"
          aria-modal="true"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80" id="review-confirmation-title">
            <h3 className="text-lg text-gray-800 mb-4">
              Are you sure you want to remove this review?
            </h3>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => {
                  setShowReviewConfirmationModal(false);
                  setShowDetailsModal(true);
                }}
                className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRemoveReview(currentActivity.rental_id);
                }}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition"
                type="button"
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

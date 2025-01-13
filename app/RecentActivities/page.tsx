'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import BoatListingCard from "../components/boatListingCard/BoatListingCard";
import { format, parseISO, isValid as isValidDateFn, isSameDay } from 'date-fns';

// Tip Tanımları
interface BookingDetails {
  rental_id: string;
  boat_id: string;
  start_date: string; // 'YYYY-MM-DD' formatında
  end_date?: string;  // 'YYYY-MM-DD' formatında, opsiyonel
  start_time?: string; // 'HH:mm' formatında, opsiyonel
  end_time?: string;  // 'HH:mm' formatında, opsiyonel
  total_price: number; // Değiştirildi: rental_price -> total_price
  status: string;
  rating?: any;       // Rating yapısına göre düzenleyin
  name?: string;
  comment?: string;
}

const CustomerRecentActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal görünürlük durumları
  const [showRankModal, setShowRankModal] = useState(false);
  const [showReviewConfirmationModal, setShowReviewConfirmationModal] = useState(false);
  const [showBookingCancelModal, setShowBookingCancelModal] = useState(false);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Rating durumları
  const [generalRating, setGeneralRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [comment, setComment] = useState("");

  // Gönderim mesaj durumu
  const [submissionMessage, setSubmissionMessage] = useState<{ type: string; text: string } | null>(null);

  // Doğrulama hataları durumu
  const [validationErrors, setValidationErrors] = useState({
    general: false,
    driver: false,
    cleanliness: false,
  });

  // Start Date'in Geçerli Olduğunu Kontrol Etme
  const isValidDate = (dateString?: string): boolean => {
    if (!dateString) return false;
    try {
      const date = parseISO(dateString);
      return isValidDateFn(date);
    } catch (error) {
      return false;
    }
  };

  // Start Time ve End Time'in Geçerli Olduğunu Kontrol Etme
  const isValidTime = (timeString?: string): boolean => {
    if (!timeString) return false;
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(timeString);
  };

  // Son kiralamaları al
  useEffect(() => {
    const fetchRecentRentals = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8081/api/rentals/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const sortedActivities = response.data.sort((a: any, b: any) => {
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

  // Modal açma ve kapatma fonksiyonları
  const openRankModal = (activity: any) => {
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

  const openBookingDetailsModal = async (activity: any) => {
    setCurrentActivity(activity);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8081/api/rentals/${activity.rental_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Booking Details Response:", response.data); // Hata ayıklama için log

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

  const openDetailsModal = (activity: any) => {
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

  // Rezervasyon iptal etme
  const cancelBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (currentActivity) {
        await axios.delete(`http://localhost:8081/api/rentals/${currentActivity.rental_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setActivities((prev) =>
        prev.filter((activity: any) => currentActivity && activity.rental_id !== currentActivity.rental_id)
      );
      closeBookingCancelModal();
      closeBookingDetailsModal();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("Failed to cancel booking. Please try again later.");
    }
  };

  // Puan kaydetme
  const saveRank = async () => {
    // Doğrulama hatalarını sıfırla
    setValidationErrors({
      general: !generalRating,
      driver: !driverRating,
      cleanliness: !cleanlinessRating,
    });

    // Herhangi bir puan eksikse işlemi durdur
    if (!generalRating || !driverRating || !cleanlinessRating) {
      return; // Her kategori yanında uyarılar görüntülenecek
    }

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

        const sortedActivities = updatedActivities.data.sort((a: any, b: any) => {
          if (a.status === "ongoing" && b.status !== "ongoing") return -1;
          if (a.status !== "ongoing" && b.status === "ongoing") return 1;
          if (!a.rating && b.rating) return -1;
          if (a.rating && !b.rating) return 1;
          return 0;
        });

        setActivities(sortedActivities);
        closeRankModal();
        setSubmissionMessage({ type: "success", text: "Your review has been submitted successfully!" });
      }
    } catch (err) {
      console.error("Error saving rating:", err);
      setSubmissionMessage({ type: "error", text: "An error occurred while submitting your review. Please try again later." });
    }
  };

  // İncelemeyi kaldırma
  const handleRemoveReview = async (rental_id: any) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8081/api/rentals/review/${rental_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setActivities((prev) => prev.filter((activity) => activity.rental_id !== rental_id));
      closeReviewConfirmationModal();
    } catch (err) {
      console.error("Error removing review:", err);
      setError("Failed to remove review. Please try again later.");
    }
  };

  if (loading) return <p>Loading your recent activities...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      {/* Gönderim Mesajı */}
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
          {activities.map((activity: any) => (
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
            {bookingDetails.end_date && bookingDetails.end_date === bookingDetails.start_date ? (
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
            ) : null}
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

      {/* Onay Modal */}
      {showBookingCancelModal && (
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
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-labelledby="rank-modal-title"
          aria-modal="true"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96" id="rank-modal-title">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rate {currentActivity.name}</h3>

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

            {/* Butonlar */}
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={closeRankModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveRank}
                className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition ${
                  !generalRating || !driverRating || !cleanlinessRating
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Details Modal */}
      {showDetailsModal && currentActivity && (
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
              <p className="text-sm text-gray-600">
                {currentActivity.comment || "No comment provided"}
              </p>
            </div>

            {/* Butonlar */}
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
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (currentActivity) {
                    handleRemoveReview(currentActivity.rental_id);
                  }
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

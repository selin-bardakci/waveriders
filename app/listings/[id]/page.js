'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const BoatListingDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTripType, setSelectedTripType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(null);

  const listing = {
    id,
    title: "Day on the Bay",
    year: 2018,
    size: "55ft",
    images: [
      "/images/boat1.png",
      "/images/boat2.png",
      "/images/boat3.png"
    ],
    description: "Spend a day on the bay with friends and family...",
    tripTypes: ["Short trip (1-2 hours)", "Day trip (3-6 hours)", "Sunrise & Sunset trip (7-12 hours)", "Overnight adventure (1+ days)"],
    pricePerHour: 300,
    pricePerDay: 1500,
    rating: 4.8,
    reviews: [
      { general: 4.8, driver: 4.7, cleanliness: 4.9 },
      { general: 4.6, driver: 4.9, cleanliness: 4.7 },
      { general: 4.9, driver: 4.8, cleanliness: 4.8 }
    ]
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedImage(null);
  };

  // Restrict date picker to future dates
  const today = new Date().toISOString().split("T")[0];

  // Handle initial booking submission to show review modal
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setShowReview(true);
  };

  // Confirm booking after user reviews details
  const confirmBooking = () => {
    const bookingDetails = selectedTripType === "Overnight adventure (1+ days)"
      ? `From ${selectedDate} to ${endDate}.`
      : `${selectedDate} from ${selectedTime} to ${endTime}.`;
    setConfirmationMessage(`Your booking details:<br />${bookingDetails}<br />Have a great vacation!`);
    setShowReview(false);
  };

  // Calculate maximum end time based on selected trip type
  const calculateMaxEndTime = (startTime) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(":").map(Number);

    let maxHours;
    switch (selectedTripType) {
      case "Short trip (1-2 hours)":
        maxHours = hours + 2;
        break;
      case "Day trip (3-6 hours)":
        maxHours = hours + 6;
        break;
      case "Sunrise & Sunset trip (7-12 hours)":
        maxHours = hours + 12;
        break;
      default:
        return "";
    }
    const endHours = maxHours > 23 ? 23 : maxHours;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
  };
  const calculateAverageRating = (attribute) => {
    const total = listing.reviews.reduce((sum, review) => sum + review[attribute], 0);
    return (total / listing.reviews.length).toFixed(1);
  };

  const generalAverage = calculateAverageRating("general");
  const driverAverage = calculateAverageRating("driver");
  const cleanlinessAverage = calculateAverageRating("cleanliness");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 relative">
        {/* Back Button */}
        <button onClick={() => router.push('/auth/ListingsPage')} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 mr-1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-semibold text-center">{listing.title} - {listing.year} • {listing.size}</h1>
      </header>

      <main className="container mx-auto py-8">
        {/* Image carousel */}
        <div className="mb-8 max-w-5xl mx-auto">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
            className="w-full h-80 rounded-lg overflow-hidden"
          >
            {listing.images.map((src, index) => (
              <SwiperSlide key={index}>
                <img
                  src={src}
                  alt="Boat Image"
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => openModal(src)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Modal for enlarged image */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="relative bg-white p-4 rounded-lg max-w-lg max-h-full">
              <button onClick={closeModal} className="absolute top-2 right-2 text-gray-700">
                &times;
              </button>
              <img
                src={selectedImage}
                alt="Enlarged Boat"
                className="w-full h-auto max-h-screen object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Boat information */}
        <section className="mb-8 max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">About this experience</h2>
          <p className="text-gray-700 mb-4">{listing.description}</p>

          <h3 className="font-semibold mt-4 mb-2">Trip Types</h3>
          <ul className="grid grid-cols-2 gap-2 text-gray-700">
            {listing.tripTypes.map((type, index) => (
              <li key={index}>✅ {type}</li>
            ))}
          </ul>

          <h3 className="font-semibold mt-4 mb-2">Rate Details</h3>
          <p className="text-gray-700">
            {listing.tripTypes.includes("Overnight adventure (1+ days)")
              ? `$${listing.pricePerDay} per day`
              : `$${listing.pricePerHour} per hour`}
          </p>
        </section>

        {/* Average Ranking */}
        <section className="mb-8 max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Average Rankings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p><strong>General Rating:</strong> ⭐ {generalAverage}</p>
            </div>
            <div>
              <p><strong>Driver Rating:</strong> ⭐ {driverAverage}</p>
            </div>
            <div>
              <p><strong>Cleanliness & Comfort:</strong> ⭐ {cleanlinessAverage}</p>
            </div>
          </div>
        </section>

        {/* Booking form */}
        <section className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Select a date, time, and trip type</h3>
          <form onSubmit={handleBookingSubmit}>
            {/* Trip Type Selection */}
            <label className="block text-gray-700 font-medium mb-2">Choose Trip Type</label>
            <select
              value={selectedTripType}
              onChange={(e) => {
                setSelectedTripType(e.target.value);
                setEndDate(""); // Reset end date if trip type changes
              }}
              className="w-full p-2 mb-4 border rounded"
              required
            >
              <option value="" disabled>Select a trip type</option>
              {listing.tripTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>

            {/* Date Picker */}
            <label className="block text-gray-700 font-medium mb-2">Select Start Date</label>
            <input
              type="date"
              className="w-full p-2 mb-4 border rounded"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />

            {/* End Date Picker (for Overnight Adventures) */}
            {selectedTripType === "Overnight adventure (1+ days)" ? (
              <>
                <label className="block text-gray-700 font-medium mb-2">Select End Date</label>
                <input
                  type="date"
                  className="w-full p-2 mb-4 border rounded"
                  min={selectedDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </>
            ) : (
              <>
                {/* Start Time Picker */}
                <label className="block text-gray-700 font-medium mb-2">Select Start Time</label>
                <input
                  type="time"
                  className="w-full p-2 mb-4 border rounded"
                  value={selectedTime}
                  onChange={(e) => {
                    setSelectedTime(e.target.value);
                    setEndTime(calculateMaxEndTime(e.target.value));
                  }}
                  required
                />

                {/* End Time Picker */}
                <label className="block text-gray-700 font-medium mb-2">Select End Time</label>
                <input
                  type="time"
                  className="w-full p-2 mb-4 border rounded"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  max={calculateMaxEndTime(selectedTime)}
                  required
                />
              </>
            )}

            {/* Number of Guests */}
            <label className="block text-gray-700 font-medium mb-2">Select Number of Guests</label>
            <input
              type="number"
              className="w-full p-2 mb-4 border rounded"
              placeholder="Number of Guests"
              min="1"
              required
            />

        <div className="flex justify-center">
          <button type="submit" className="w-1/2 bg-blue-500 text-white p-2 rounded">
            Book the trip!
          </button>
        </div>
          </form>
        </section>

        {/* Review Booking Details Modal */}
        {showReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <p>Your selected booking details:</p>
              <p>
                {selectedTripType === "Overnight adventure (1+ days)"
                  ? `From ${selectedDate} to ${endDate}`
                  : `${selectedDate} from ${selectedTime} to ${endTime}`}
              </p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setShowReview(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Final Confirmation Message */}
        {confirmationMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <p dangerouslySetInnerHTML={{ __html: confirmationMessage }} />
              <button
                onClick={() => setConfirmationMessage(null)}
                className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BoatListingDetails;

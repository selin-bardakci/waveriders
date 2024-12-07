'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);

  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/rentals/unavailable-dates?boat_id=${id}`);
        const data = await response.json();
        if (response.ok) {
          setUnavailableDates(data.unavailableDates);
        } else {
          console.error('Error fetching unavailable dates:', data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUnavailableDates();
  }, [id]);

  console.log('Unavailable Dates:', unavailableDates); 

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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedImage(null);
  };

  const today = new Date().toISOString().split("T")[0];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setShowReview(true);
  };

  const confirmBooking = async () => {
    const rentalData = {
      boat_id: id, 
      start_date: selectedDate.toISOString().split('T')[0],
      end_date: selectedTripType === "Overnight adventure (1+ days)" ? endDate.toISOString().split('T')[0] : null, 
      rental_price: calculateTotalPrice(),
      start_time: selectedTripType === "Overnight adventure (1+ days)" ? "00:00" : selectedTime,
      end_time: selectedTripType === "Overnight adventure (1+ days)" ? "23:59" : endTime,
    };

    try {
      const response = await fetch('http://localhost:8081/api/rentals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, 
        },
        body: JSON.stringify(rentalData),
      });

      const result = await response.json();

      if (response.ok) {
        setConfirmationMessage(`Your booking was successful! `);
      } else {
        alert(result.message || 'Failed to create rental.');
      }

      setShowReview(false); 
    } catch (error) {
      console.error('Error creating rental:', error);
      alert('An error occurred while creating the rental.');
    }
  };


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

  const calculateTotalPrice = () => {
    if (selectedTripType === "Overnight adventure (1+ days)") {
      if (!selectedDate || !endDate) return 0; 
      const days = Math.ceil(
        (new Date(endDate) - new Date(selectedDate)) / (1000 * 60 * 60 * 24)
      );
      return days * listing.pricePerDay;
    } else {
      if (!selectedTime || !endTime) return 0; // Saat seçilmemişse fiyat 0
      const [startHours, startMinutes] = selectedTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      const totalHours = totalMinutes / 60;

      return Math.ceil(totalHours * listing.pricePerHour);
    }
  };

  const calculateAverageRating = (attribute) => {
    const total = listing.reviews.reduce((sum, review) => sum + review[attribute], 0);
    return (total / listing.reviews.length).toFixed(1);
  };



  const excludedDates = unavailableDates.flatMap(({ start_date, end_date }) => {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const dates = [];
    while (start <= end) {
      dates.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return dates;
  });

  const generalAverage = calculateAverageRating("general");
  const driverAverage = calculateAverageRating("driver");
  const cleanlinessAverage = calculateAverageRating("cleanliness");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 relative">
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
        <h1 className="text-2xl font-semibold text-center">
          {listing.title} - {listing.year} • {listing.size}
        </h1>
        <button
          onClick={toggleFavorite}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFavorite ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.284 7.011h7.374c.969 0 1.371 1.24.588 1.81l-5.98 4.343 2.284 7.011c.3.921-.755 1.688-1.54 1.11L12 18.347l-5.88 4.154c-.784.578-1.84-.19-1.54-1.11l2.283-7.011-5.98-4.343c-.783-.57-.38-1.81.588-1.81h7.374l2.284-7.011z"
            />
          </svg>
          <span className="ml-1">{isFavorite ? "Favorited" : "Add to Favorites"}</span>
        </button>
      </header>

      <main className="container mx-auto py-8">
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

        <section className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Select a date, time, and trip type</h3>
          <form onSubmit={handleBookingSubmit}>
            <label className="block text-gray-700 font-medium mb-2">Choose Trip Type</label>
            <select
              value={selectedTripType}
              onChange={(e) => {
                setSelectedTripType(e.target.value);
                setEndDate("");
              }}
              className="w-full p-2 mb-4 border rounded"
              required
            >
              <option value="" disabled>Select a trip type</option>
              {listing.tripTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>

            <label className="block text-gray-700 font-medium mb-2">Select Start Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              excludeDates={excludedDates} 
              minDate={new Date()} 
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 mb-4 border rounded"

            />

            {selectedTripType === "Overnight adventure (1+ days)" ? (
              <>
                <label className="block text-gray-700 font-medium mb-2">Select End Date</label>
                <DatePicker
                  selected={endDate} 
                  onChange={(date) => setEndDate(date)} 
                  minDate={selectedDate || new Date()} 
                  excludeDates={excludedDates} 
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
              </>
            ) : (
              <>
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

            <label className="block text-gray-700 font-medium mb-2">Select Number of Guests</label>
            <input
              type="number"
              className="w-full p-2 mb-4 border rounded"
              placeholder="Number of Guests"
              min="1"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(e.target.value)}
              required
            />

            <div className="flex justify-center">
              <button type="submit" className="w-1/2 bg-blue-500 text-white p-2 rounded">
                Book the trip!
              </button>
            </div>
          </form>
        </section>

        {showReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <p>Your selected booking details:</p>
              <p>
                {selectedTripType === "Overnight adventure (1+ days)"
                  ? `From ${selectedDate?.toLocaleDateString('tr-TR')} to ${endDate?.toLocaleDateString('tr-TR')}`
                  : `${selectedDate?.toLocaleDateString('tr-TR')} from ${selectedTime} to ${endTime}`}
              </p>

              <p className="mt-2">Guests: {numberOfGuests}</p>
              <p className="mt-2 text-blue-600">
                Total Price: ${calculateTotalPrice()}
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

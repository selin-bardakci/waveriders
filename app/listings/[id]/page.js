'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Map database trip types to user-friendly descriptions
const mapTripTypesToDescriptions = {
  short: "Short trip (1-2 hours)",
  day: "Day trip (3-6 hours)",
  sunrise: "Sunrise & Sunset trip (7-12 hours)",
  overnight: "Overnight adventure (1+ days)",
};

const BoatListingDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [selectedTripType, setSelectedTripType] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/listings/${id}`);
        if (response.status === 200) {
          const fetchedListing = response.data;

          // Handle trip_types: ensure it is an array
          if (typeof fetchedListing.trip_types === 'string') {
            fetchedListing.tripTypes = [fetchedListing.trip_types]; // Convert single string to array
          } else if (Array.isArray(fetchedListing.trip_types)) {
            fetchedListing.tripTypes = fetchedListing.trip_types; // Already an array
          } else {
            fetchedListing.tripTypes = []; // Fallback if unexpected format
          }

          setListing(fetchedListing);
        } else {
          throw new Error(`Unexpected status code: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching boat details:', error);
        setError(error.message || 'Failed to fetch boat details. Please try again.');
      }
    };

    fetchListing();
  }, [id]);

  // Fetch unavailable dates
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/rentals/unavailable-dates?boat_id=${id}`);
        if (response.status === 200) {
          setUnavailableDates(response.data.unavailableDates);
        } else {
          console.error('Error fetching unavailable dates:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching unavailable dates:', error);
      }
    };

    fetchUnavailableDates();
  }, [id]);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/boats/${id}/reviews`);
        if (response.status === 200 && response.data.reviews) {
          setReviews(response.data.reviews); // Ensure the response updates `reviews` state
          console.log('Reviews:', response.data.reviews); // Debugging log
        } else {
          console.error('Failed to fetch reviews:', response.data.message);
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      }
    };
  
    fetchReviews();
  }, [id]);
  
  

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!listing) {
    return <p>Loading...</p>;
  }

  const {
    boat_name,
    description,
    tripTypes,
    price_per_hour,
    price_per_day,
    capacity,
    location,
    photos,
  } = listing;

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
  // Format trip types to display descriptions
  const formattedTripTypes = tripTypes
    .map((type) => mapTripTypesToDescriptions[type])
    .filter(Boolean); // Filter out invalid or undefined types

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setShowReview(true);
  };

  const confirmBooking = async () => {
    const rentalData = {
      boat_id: id,
      start_date: selectedDate.toISOString().split('T')[0],
      end_date: selectedTripType === 'overnight' ? endDate.toISOString().split('T')[0] : null,
      rental_price: calculateTotalPrice(),
      start_time: selectedTime || "00:00",
      end_time: endTime || "23:59",
    };

    try {
      const response = await axios.post('http://localhost:8081/api/rentals/create', rentalData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 201) {
        setConfirmationMessage('Your booking was successful!');
      } else {
        alert(response.data.message || 'Failed to create rental.');
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      alert('An error occurred while creating the rental.');
    }

    setShowReview(false);
  };

  const calculateAverageRating = (attribute) => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return "0.0";
    }
  
    const total = reviews.reduce((sum, review) => sum + (review[attribute] || 0), 0);
    return (total / reviews.length).toFixed(1);
  };
  
  // Use the function to calculate averages
  const generalAverage = calculateAverageRating("overall_rating");
  const driverAverage = calculateAverageRating("driver_rating");
  const cleanlinessAverage = calculateAverageRating("cleanliness_rating");
  
  


  const calculateTotalPrice = () => {
    if (selectedTripType === 'overnight') {
      if (!selectedDate || !endDate) return 0;
      const days = Math.ceil((new Date(endDate) - new Date(selectedDate)) / (1000 * 60 * 60 * 24));
      return days * price_per_day;
    } else {
      if (!selectedTime || !endTime) return 0;
      const [startHours, startMinutes] = selectedTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      const totalHours = totalMinutes / 60;
      return Math.ceil(totalHours * price_per_hour);
    }
  };

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
        <h1 className="text-2xl font-semibold text-center">{boat_name}</h1>
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
    className="rounded-lg overflow-hidden"
  >
    {photos.map((url, index) => (
      <SwiperSlide key={index}>
        <img
          src={url}
          alt={`Boat Image ${index + 1}`}
          className="w-full h-80 object-cover cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-shadow"
          onClick={() => openModal(url)}
        />
      </SwiperSlide>
    ))}
  </Swiper>

  {isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded-lg max-w-3xl w-full">
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <img
          src={selectedImage}
          alt="Enlarged Boat"
          className="w-full h-auto object-contain rounded-lg shadow-md"
        />
      </div>
    </div>
  )}
</div>


        <div className="mb-8 max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">About this experience</h2>
          <p className="text-gray-700 mb-4">{description}</p>

          <h3 className="font-semibold mt-4 mb-2">Trip Types</h3>
          <ul className="grid grid-cols-2 gap-2 text-gray-700">
            {formattedTripTypes.map((type, index) => (
              <li key={index}>✅ {type}</li>
            ))}
          </ul>

          <h3 className="font-semibold mt-4 mb-2">Rate Details</h3>
          <p className="text-gray-700">
            {price_per_day && !isNaN(Number(price_per_day))
              ? `$${Number(price_per_day).toFixed(2)} per day`
              : price_per_hour && !isNaN(Number(price_per_hour))
              ? `$${Number(price_per_hour).toFixed(2)} per hour`
              : 'N/A'}
          </p>
        </div>
        <section className="mb-8 max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Average Ratings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p><strong>Overall Rating:</strong> ⭐ {generalAverage}</p>
              </div>
              <div>
                <p><strong>Driver Rating:</strong> ⭐ {driverAverage}</p>
              </div>
              <div>
                <p><strong>Cleanliness & Comfort Rating:</strong> ⭐ {cleanlinessAverage}</p>
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
                setEndDate(null);
              }}
              className="w-full p-2 mb-4 border rounded"
              required
            >
              <option value="" disabled>Select a trip type</option>
              {formattedTripTypes.map((type, index) => (
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

            {selectedTripType === mapTripTypesToDescriptions.overnight ? (
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
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                />
                <label className="block text-gray-700 font-medium mb-2">Select End Time</label>
                <input
                  type="time"
                  className="w-full p-2 mb-4 border rounded"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
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
                {selectedTripType === mapTripTypesToDescriptions.overnight
                  ? `From ${selectedDate?.toLocaleDateString()} to ${endDate?.toLocaleDateString()}`
                  : `${selectedDate?.toLocaleDateString()} from ${selectedTime} to ${endTime}`}
              </p>
              <p className="mt-2">Guests: {numberOfGuests}</p>
              <p className="mt-2 text-blue-600">Total Price: ${calculateTotalPrice()}</p>
              <div className="mt-4 flex justify-between">
                <button onClick={() => setShowReview(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                  Cancel
                </button>
                <button onClick={confirmBooking} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmationMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <p>{confirmationMessage}</p>
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

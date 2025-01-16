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

// Helper function to format date as 'yyyy-MM-dd' in local timezone
const formatDate = (date) => {
  const year = date.getFullYear();
  // Months are zero-indexed in JavaScript Date objects
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const [warningMessage, setWarningMessage] = useState(null);
  const [userBusinessId, setUserBusinessId] = useState(null);
  const [canRentBoat, setCanRentBoat] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {

    const fetchListingAndFavoriteStatus = async () => {
      try {
        console.log('Fetching listing details...');

        const listingResponse = await axios.get(`https://api.waveriders.com.tr/api/listings/${id}`);
        if (listingResponse.status === 200) {
          const fetchedListing = listingResponse.data;

          console.log('Fetched Listing:', fetchedListing);
          console.log('Boat ID:', fetchedListing.boat_id);
          console.log('Business ID:', fetchedListing.business_id);

          // Handle trip types
          if (typeof fetchedListing.trip_types === 'string') {
            fetchedListing.tripTypes = fetchedListing.trip_types.split(',').map(type => type.trim());
          } else if (Array.isArray(fetchedListing.trip_types)) {
            fetchedListing.tripTypes = fetchedListing.trip_types.flatMap(type => type.split(',').map(t => t.trim()));
          } else {
            fetchedListing.tripTypes = [];
          }

          setListing(fetchedListing);

          // Fetch verification status
          const verificationResponse = await axios.get(`https://api.waveriders.com.tr/api/verification/status/${fetchedListing.boat_id}`);
          console.log('Verification Status Response:', verificationResponse.data);

          const verificationStatus = verificationResponse.data.status;
          console.log('Verification Status:', verificationStatus);
          setVerificationStatus(verificationStatus);
          // Default to not rentable
          let canRent = false;

          // Check verification status first
          if (verificationStatus === 'approved') {
            // If approved, check ownership
            const token = localStorage.getItem('token');

            if (token) {
              try {

                const userResponse = await axios.get('https://api.waveriders.com.tr/api/business/profile', {
                  headers: { Authorization: `Bearer ${token}` },
                });


                if (userResponse.data.success) {
                  setUserBusinessId(userResponse.data.business_id);

                  // Can rent if user has no business profile (business_id is null) 
                  // or if the business_id doesn't match the listing's business_id
                  canRent = !userResponse.data.business_id ||
                    userResponse.data.business_id !== fetchedListing.business_id;
                }

                console.log('User business ID:', userResponse.data.business_id);
                console.log('Listing business ID:', fetchedListing.business_id);
                console.log('Can rent (based on ownership):', canRent);
              } catch (error) {
                console.error('Error fetching business profile:', error);
                canRent = true; // Allow rental if request fails
              }
            }
            // No token means user isn't logged in, but can still see rental option


          } else {
            console.log('Boat is not approved, status:', verificationStatus);
            canRent = false;
          }
          
          const token = localStorage.getItem('token');
          console.log("Fetched token:", token);
          if (token) {
            const favoriteResponse = await axios.get('https://api.waveriders.com.tr/api/favorites', {
              headers: { Authorization: `Bearer ${token}` },
            });

            const isFavoriteBoat = favoriteResponse.data.favorites.some((boat) => boat.boat_id === Number(id));
            setIsFavorite(isFavoriteBoat);
            console.log("Is favorite boat:", isFavoriteBoat);
          }          

          console.log('Final canRent value:', canRent);
          setCanRentBoat(canRent);

        }
      } catch (error) {
        console.error('Error in fetchListingAndFavoriteStatus:', error);
        setError(error.response?.data?.message || 'Failed to fetch boat details. Please try again.');
        setCanRentBoat(false);
      }
    };

    fetchListingAndFavoriteStatus();
  }, [id]);


  const handleBackButtonClick = () => {
    const source = sessionStorage.getItem("navigation_source");

    if (source === "homepage") {
      router.push("/");
    } else if (source === "ListingsPage") {
      router.push("/ListingsPage");
    } else if (source === "allListings") {
      router.push("/allListings"); // Navigate back to allListings
    } else if (source === "Favourites") {
      router.push("/Favourites"); // Navigate back to Favourites
    } else if (source === "RecentActivities") {
      router.push("/RecentActivities"); // Navigate back to RecentActivities
    } else {
      router.back(); // Fallback navigation
    }
  };

  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const response = await axios.get(`https://api.waveriders.com.tr/api/rentals/unavailable-dates?boat_id=${id}`);
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
        const response = await axios.get(`https://api.waveriders.com.tr/api/boats/${id}/reviews`);
        if (response.status === 200 && response.data.reviews) {
          setReviews(response.data.reviews);
        } else {
          console.error('Failed to fetch reviews:', response.data.message);
          setReviews([]); // Handle missing data gracefully
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]); // Graceful fallback for errors
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

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("Toggling favorite with token:", token);

        if (!token) {
        // User is not authenticated
        const currentPath = `/listings/${id}`;
        console.log("Storing redirect path in sessionStorage:", currentPath);
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        router.push('/auth/sign-in'); // Ensure this path matches your Sign-In page route
        return;
      }

      if (isFavorite) {
        await axios.delete('https://api.waveriders.com.tr/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
          data: { boat_id: id },
        });
        setIsFavorite(false);
        console.log("Boat removed from favorites.");
      } else {
        await axios.post(
          'https://api.waveriders.com.tr/api/favorites',
          { boat_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
        console.log("Boat added to favorites.");
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert(error.response?.data?.message || 'An error occurred.');
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedImage(null);
  };

  // Ensure tripTypes is an array of trimmed strings
  const tripTypesArray = Array.isArray(tripTypes) && tripTypes.length > 0
    ? tripTypes.flatMap(type => type.split(',').map(t => t.trim()))
    : typeof tripTypes === 'string'
      ? tripTypes.split(',').map(t => t.trim())
      : [];

  // Map trip types to their descriptions
  const formattedTripTypes = tripTypesArray
    .map((type) => mapTripTypesToDescriptions[type])
    .filter(Boolean); // Filter out undefined or invalid types

  // Debugging
  console.log('Raw trip_types:', tripTypes);
  console.log('Processed tripTypesArray:', tripTypesArray);
  console.log('Mapped trip types (descriptions):', formattedTripTypes);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    console.log("Booking form submitted");

    const token = localStorage.getItem('token');
    console.log("Token:", token);

    if (!token) {
      // User is not authenticated
      const currentPath = `/listings/${id}`;
      console.log("Storing redirect path in sessionStorage:", currentPath);
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      router.push('/auth/sign-in'); // Ensure this path matches your Sign-In page route
      return;
    }

    // If authenticated, proceed to show the review modal
    console.log("User is authenticated, showing review modal");
    setShowReview(true);
  };
  const validateTripDuration = (tripType, hours) => {
    switch (tripType) {
      case mapTripTypesToDescriptions.short:
        return hours >= 1 && hours <= 2;
      case mapTripTypesToDescriptions.day:
        return hours >= 3 && hours <= 6;
      case mapTripTypesToDescriptions.sunrise:
        return hours >= 7 && hours <= 12;
      case mapTripTypesToDescriptions.overnight:
        return hours > 12; // Overnight trips should be more than 12 hours
      default:
        return false; // Invalid trip type
    }
  };

  const confirmBooking = async () => {
    if (!selectedDate) {
      setWarningMessage("Please select a start date.");
      return;
    }

    if (selectedTripType === mapTripTypesToDescriptions.overnight && !endDate) {
      setWarningMessage("Please select an end date for the overnight trip.");
      return;
    }

    // Validate the number of guests
    if (numberOfGuests > capacity) {
      setWarningMessage(`The maximum capacity for this boat is ${capacity} guests. Please adjust the number of guests.`);
      return;
    }

    // Validate trip duration for non-overnight trips
    if (selectedTripType !== mapTripTypesToDescriptions.overnight) {
      const [startHours, startMinutes] = selectedTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      const totalHours = totalMinutes / 60;

      if (!validateTripDuration(selectedTripType, totalHours)) {
        setWarningMessage(`Invalid time duration for ${selectedTripType}. Please adhere to the duration limits.`);
        return;
      }
    }

    const rentalData = {
      boat_id: id,
      start_date: formatDate(selectedDate),
      end_date: selectedTripType === mapTripTypesToDescriptions.overnight ? formatDate(endDate) : null,
      rental_price: calculateTotalPrice(),
      start_time: selectedTime || "00:00",
      end_time: endTime || "23:59",
      number_of_guests: Number(numberOfGuests),
    };

    try {
      setLoading(true);
      const response = await axios.post('https://api.waveriders.com.tr/api/rentals/create', rentalData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 201) {
        setShowReview(false);
        setConfirmationMessage('Your booking was successful!');
        setSelectedDate(null);
        setEndDate(null);
        setSelectedTime("");
        setEndTime("");
        setNumberOfGuests(1);
      } else {
        setWarningMessage(response.data.message || 'Failed to create rental.');
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      setWarningMessage(error.response?.data?.message || 'An error occurred while creating the rental.');
    }
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
    if (selectedTripType === mapTripTypesToDescriptions.overnight) {
      if (!selectedDate || !endDate) return 0;
      const days = Math.ceil((endDate - selectedDate) / (1000 * 60 * 60 * 24));
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
      <header className="bg-white shadow p-4 flex items-center justify-between">
        {/* Back Button */}
        <button
          onClick={handleBackButtonClick}
          className="text-blue-500 flex items-center"
        >
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


        {/* Header */}
        <h1 className="text-2xl font-semibold">{boat_name}</h1>

        {/* Add to Favorites Button */}
        <button
          onClick={toggleFavorite}
          className="flex items-center text-yellow-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFavorite ? 'currentColor' : 'none'}
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
          <span className="ml-1">{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
        </button>
      </header>

      <main className="container mx-auto py-8">
        {/* Image Slider */}
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
                  className="cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => openModal(url)}
                  style={{
                    height: '400px', // Fixed vertical size
                    width: '100%', // Fill container width
                    objectFit: 'contain', // Maintain aspect ratio and fit within bounds
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative bg-white p-4 rounded-lg max-w-5xl w-full flex items-center justify-center">
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
                  className="object-contain rounded-lg shadow-md"
                  style={{
                    height: '600px', // Fixed vertical size
                    maxWidth: '90%', // Ensure it doesn't overflow horizontally
                  }}
                />
              </div>
            </div>
          )}

        </div>



        {/* About Section */}
        <div className="mb-8 max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">About this experience</h2>
          <p className="text-gray-700 mb-4">{description}</p>
          <h3 className="font-semibold mt-4 mb-2">Trip Types</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
            {formattedTripTypes.length > 0 ? (
              formattedTripTypes.map((type, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>{type}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No trip types available</p>
            )}
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

        {/* Ratings Section */}
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

        {/* Reviews Section */}
        <section className="mb-8 max-w-5xl mx-auto bg-white p-6 rounded-lg shadow relative">
          <h3 className="text-xl font-semibold mb-4">Reviews</h3>

          <div className="flex">
            {/* Review Boxes */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                {reviews.slice(0, 3).map((review, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 p-4 rounded-lg shadow-md border border-gray-300 flex flex-col justify-between"
                  >
                    {/* Author */}
                    <p className="font-semibold text-gray-800 mb-2">
                      {review.author && review.author.trim() ? review.author : 'Anonymous'}
                    </p>
                    {/* Date */}
                    <p className="text-gray-600 text-sm mb-2">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                    {/* Review Content */}
                    <p className="text-gray-700 text-sm flex-grow">
                      {review.review_text && review.review_text.trim()
                        ? review.review_text
                        : 'No review content available.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 p-4 rounded-lg shadow-md border border-gray-300 flex items-center justify-center"
                  >
                    <p className="text-gray-500 text-sm">No reviews available</p>
                  </div>
                ))}
              </div>
            )}

            {/* Arrow Button */}
            <div className="flex items-center ml-4">
              <button
                onClick={() => router.push(`/listings/${id}/reviews`)}
                className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center"
                aria-label="View All Reviews"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
        {/* Conditional rendering of the Booking Form */}
        {/* Booking Form or Your Listing Message */}
        {canRentBoat ? (
          <section className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Select a date, time, and trip type</h3>
            {/* Warning Message */}
            {warningMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{warningMessage}</span>
                <button
                  onClick={() => setWarningMessage(null)}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <svg
                    className="fill-current h-6 w-6 text-red-500"
                    role="button"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M14.348 14.849a1 1 0 01-1.414 0L10 11.414 7.066 14.35a1 1 0 01-1.415-1.415l2.934-2.934L5.65 7.067a1 1 0 111.415-1.415L10 8.586l2.934-2.934a1 1 0 011.415 1.415l-2.934 2.934 2.934 2.934a1 1 0 010 1.415z" />
                  </svg>
                </button>
              </div>
            )}
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
                required
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
        ) : !localStorage.getItem('token') ? (
          <section className="bg-red-50 p-6 rounded-lg shadow max-w-5xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-red-800">Register to Book</h3>
              <p className="text-red-700">
                Please sign up to book this boat and enjoy your adventure.
              </p>
              <button
                onClick={() => router.push('/auth/sign-in')} // Update to your login/sign-up route
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
              >
                Sign Up
              </button>
            </div>
          </section>
        ) : userBusinessId === listing?.business_id ? (
          <section className="bg-blue-50 p-6 rounded-lg shadow max-w-5xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-blue-800">Your Listing</h3>
              <p className="text-blue-700">This is your boat listing. You can manage it from your business dashboard.</p>
            </div>
          </section>
        ) : verificationStatus !== 'approved' ? (
          <section className="bg-yellow-50 p-6 rounded-lg shadow max-w-5xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-yellow-800">This Boat is Under Review</h3>
              <p className="text-yellow-700">
                This boat is currently under review and cannot be booked at this time. Please check back later.
              </p>
            </div>
          </section>
        ) : null}
        {/* Review Modal */}
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
                <button
                  onClick={confirmBooking}
                  className={`bg-blue-500 text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading} // Butonu devre dışı bırak
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Message */}
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

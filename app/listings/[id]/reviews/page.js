'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ReviewsPage = () => {
  const { id } = useParams(); // Get boat ID from URL
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch reviews for the specific boat
  useEffect(() => {
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`https://api.waveriders.com.tr/api/boats/${id}/reviews`);
            setReviews(response.data.reviews);
        } catch (err) {
            console.error('Error fetching reviews:', err.message);
            setError('An error occurred while fetching reviews.');
        } finally {
            setLoading(false); // Ensure loading state is updated
        }
    };
    
      

    fetchReviews();
  }, [id]);

  if (loading) {
    return <p>Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
<header className="bg-white p-4 shadow-md relative flex items-center">
  {/* Back Button */}
  <button
    onClick={() => router.back()} // Navigate back to the previous page
    className="text-blue-500 flex items-center absolute left-4"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-6 h-6 mr-1"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
    Back
  </button>

  {/* Centered Title */}
  <h1 className="text-2xl font-semibold text-center w-full">
    Reviews & Ratings
  </h1>
</header>



      <main className="container mx-auto py-8 px-4">
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-300"
              >
                <p className="text-sm text-gray-600 mb-1">
                  <strong>{review.author || 'Anonymous'}</strong>
                  <span className="text-gray-400"> - {new Date(review.created_at).toLocaleDateString()}</span>
                </p>
                <p className="text-sm text-gray-500 italic mb-4">&quot;{review.review_text}&quot;</p>
                <div className="text-sm text-gray-600">
                  <p>Overall Rating: ⭐ {review.overall_rating}</p>
                  <p>Driver Rating: ⭐ {review.driver_rating}</p>
                  <p>Cleanliness Rating: ⭐ {review.cleanliness_rating}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No reviews or ratings available for this boat.</p>
        )}
      </main>
    </div>
  );
};

export default ReviewsPage;

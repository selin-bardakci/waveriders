"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaArrowRight } from 'react-icons/fa';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BusinessDashboard = () => {
  const [businessOwner, setBusinessOwner] = useState('Jane Doe');
  const router = useRouter();

  useEffect(() => {
    // Placeholder since backend is not available
  }, []);

  // Determine the months to display up to the current month
  const currentMonth = new Date().getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = months.slice(0, currentMonth + 1);

  // Placeholder data for the chart
  const data = {
    labels: displayMonths,
    datasets: [
      {
        label: 'Customer Count',
        data: Array.from({ length: currentMonth + 1 }, () => Math.floor(Math.random() * 20) + 10),
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'This year',
          color: '#333',
          font: {
            weight: 'bold',
          },
        },
      },
      y: {
        ticks: {
          stepSize: 5,
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.3)',
        },
      },
    },
  };

  // Placeholder listings data (assuming we have more than 4 for testing purposes)
  const listings = [
    "https://via.placeholder.com/100",
    "https://via.placeholder.com/100",
    "https://via.placeholder.com/100",
    "https://via.placeholder.com/100",
    "https://via.placeholder.com/100",
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Welcome Section */}
      <div className="relative bg-gray-200 mt-10 w-[980px]">
        <div
          className="bg-cover bg-center w-full h-[480px] rounded-2xl shadow-lg overflow-hidden"
          style={{ backgroundImage: 'url(/images/customerDashboard.png)' }}
        >
          <div className="absolute inset-0 bg-black opacity-30 rounded-2xl"></div>
          <div className="absolute left-6 bottom-8 z-10">
            <h1 className="text-white text-4xl font-bold">
              Welcome back, {businessOwner}!
            </h1>
            <p className="text-white text-lg mt-2">
              Here's a look at your recent rentals!
            </p>
          </div>
        </div>
      </div>

      {/* Customer Count Graph */}
      <section className="p-6 w-[980px] mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Count</h2>
        <div
          className="rounded-lg shadow-md border"
          style={{
            width: '100%',
            height: '200px',
            padding: '16px',
            backgroundColor: '#f3f4f6',
            borderColor: '#d1d5db', // Açık gri renk (gray-300)
          }}
        >
          <Line data={data} options={options} />
        </div>
      </section>

      {/* Listings Section */}
      <section className="p-6 w-[980px] mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Listings</h2>
        <div
          className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md border"
          style={{
            borderColor: '#d1d5db', // Listings kısmına da açık gri çerçeve ekledik
          }}
        >
          {/* Single or Grid Image Display */}
          <div className="w-20 h-20 relative">
            {listings.length > 4 ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
                <img src={listings[0]} alt="Listing 1" className="w-full h-full object-cover rounded-md" />
                <img src={listings[1]} alt="Listing 2" className="w-full h-full object-cover rounded-md" />
                <img src={listings[2]} alt="Listing 3" className="w-full h-full object-cover rounded-md" />
                <img src={listings[3]} alt="Listing 4" className="w-full h-full object-cover rounded-md" />
              </div>
            ) : (
              <img src={listings[0]} alt="Listing" className="w-full h-full object-cover rounded-md" />
            )}
          </div>

          {/* Arrow button for navigating to all listings with tooltip */}
          <button
            onClick={() => router.push('/auth/allListings')}
            title="See all listings and edit"
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <FaArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
};

export default BusinessDashboard;

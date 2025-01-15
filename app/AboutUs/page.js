"use client";

import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaUserTie } from "react-icons/fa"; // SVG for Business Account (Captain-like)
import { FaUserAlt } from "react-icons/fa"; // SVG for Customer Account (Person-like)
import { GiBoatFishing } from "react-icons/gi";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Section */}
      <header className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">About Us</h1>
          <p className="mt-2 text-lg">
            Discover how WaveRiders connects businesses and customers for unique yacht experiences.
          </p>
        </div>
      </header>

      {/* About Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center">
          <GiBoatFishing className="text-blue-500 text-6xl mb-4" />
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Who We Are
          </h2>
          <p className="text-gray-700 leading-relaxed text-center max-w-3xl">
            Welcome to WaveRiders! Our platform bridges the gap between yacht businesses and customers seeking unforgettable adventures on the water. Whether you&apos;re planning a serene cruise, a yacht party, or a fishing trip, we simplify the process of finding the perfect boat.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <AiOutlineInfoCircle className="text-blue-500 text-6xl mb-4" />
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              How It Works
            </h2>
            <p className="text-gray-700 leading-relaxed text-center max-w-3xl mb-8">
              Our platform makes yacht rentals simple and hassle-free. Yacht businesses list their boats, while customers explore a variety of options tailored to their needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Business Account */}
            <div className="flex flex-col items-center bg-blue-50 p-6 rounded-lg shadow-md">
  <FaUserTie className="text-blue-500 text-6xl mb-4" />
  <h3 className="text-xl font-semibold text-gray-800">
    Business Account
  </h3>
  <p className="text-gray-700 mt-4 text-center">
    A Business account allows you to list your yachts, reach potential customers, and grow your rental operations. Each business is responsible for providing captains for their boats and ensuring a seamless experience for customers.
  </p>
</div>

{/* Customer Account */}
<div className="flex flex-col items-center bg-blue-50 p-6 rounded-lg shadow-md">
  <FaUserAlt className="text-blue-500 text-6xl mb-4" />
  <h3 className="text-xl font-semibold text-gray-800">
    Customer Account
  </h3>
  <p className="text-gray-700 mt-4 text-center">
    A Customer account lets you explore a wide range of yachts, customize your rental experience, and book your next water adventure effortlessly. Enjoy your journey with a trusted and verified captain provided by the business.
  </p>
</div>
          </div>
        </div>
      </section>

{/* Contact Section */}
<section className="container mx-auto px-4 py-12">
  <div className="flex flex-col items-center">
    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
      Need Help?
    </h2>
    <p className="text-gray-700 leading-relaxed text-center max-w-3xl">
      If you have questions about how the platform works, feel free to <a href="mailto:waveriders.help@gmail.com" className="text-blue-500">contact us</a>. We're here to ensure your experience is smooth and enjoyable.
    </p>
  </div>
</section>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">©2024 WaveRiders. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

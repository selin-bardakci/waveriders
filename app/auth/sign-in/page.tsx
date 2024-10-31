'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // Initially set to false

  // Listen for custom 'userLoggedIn' event or check localStorage on mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    };

    // Listen to custom 'userLoggedIn' event
    const handleUserLoggedIn = () => {
      checkLoginStatus();
    };

    // Check login status on component mount
    checkLoginStatus();

    // Add event listener for login event
    window.addEventListener('userLoggedIn', handleUserLoggedIn);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState); // Toggle the dropdown state
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setIsDropdownOpen(false); // Close dropdown on logout
  };

  return (
    <div className="sticky top-0 w-full mx-auto bg-white border-b-2 border-gray-300 shadow-md z-30 h-20 p-4 flex items-center rounded-tl-[1rem] rounded-tr-[1rem]">
      <div className="flex w-full justify-between items-center px-6">
        <Link href="/" className="text-lg font-semibold">WaveRiders</Link>

        <div className="flex items-center gap-8 md:gap-8">
          {isLoggedIn ? (
            <div className="relative">
              <img
                src="/images/plac.png" 
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={toggleDropdown} // Only toggle on click
              />

              {isDropdownOpen && ( // Show dropdown only if isDropdownOpen is true
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Dashboard</Link>
                  <Link href="/mylistings" className="block px-4 py-2 hover:bg-gray-100">My Listings</Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/sign-in" className="px-4">Log In</Link>
              <Link href="/auth/register" className="px-4">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;

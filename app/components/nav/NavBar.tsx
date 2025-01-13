'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const NavBar = () => {
  const { user, setUser, isLoggedIn, setIsLoggedIn } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:8081/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            setUser(null);
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Error checking login status:', err);
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkLoginStatus();
  }, [setUser, setIsLoggedIn]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/');
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const renderNavLinks = () => {
    if (!isLoggedIn || !user) {
      return (
        <>
          <Link href="/auth/sign-in" className="px-4">
            Log In
          </Link>
          <Link href="/auth/AccountSetup" className="px-4">
            Sign Up
          </Link>
        </>
      );
    }

    const { account_type } = user;

    if (account_type === 'admin') {
      // Admin için sadece "Log Out" gösterecek
      return (
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Log Out
        </button>
      );
    }

    if (account_type === 'customer') {
      return (
        <>
          <Link
            href="/auth/ListingsPage"
            className="text-base font-medium py-2 px-4 hover:bg-gray-200 transition rounded-md"
          >
            Rent a boat
          </Link>
          <div className="relative">
            <img
              src="/images/userIcon.jpeg"
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <Link
                  href="/Customer/customerDashboard"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  Dashboard
                </Link>
                <Link
                  href="/Favourites"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  Favourites
                </Link>
                <Link
                  href="/RecentActivities"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  Recent Activities
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </>
      );
    }

    if (account_type === 'business') {
      return (
        <>
          <Link
            href="/auth/ListingsPage"
            className="text-base font-medium py-2 px-4 hover:bg-gray-200 transition rounded-md"
          >
            Rent a boat
          </Link>
          <Link
            href="/newBoat/addNewBoat"
            className="px-5 py-2 bg-blue-500 text-white text-base font-medium rounded-lg hover:bg-blue-600 transition"
          >
            Add Boat
          </Link>
          <div className="relative">
            <img
              src="/images/userIcon.jpeg"
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <Link
                  href="/Business/businessDashboard"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  Dashboard
                </Link>
                <Link
                  href="/Favourites"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  Favourites
                </Link>
                <Link
                  href="/RecentActivities"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  Recent Activities
                </Link>
                <Link
                  href="/Business/allListings"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  My Listings
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="sticky top-0 w-full mx-auto bg-white border-b-2 border-gray-300 shadow-md z-30 h-20 p-4 flex items-center rounded-tl-[1rem] rounded-tr-[1rem]">
      <div className="flex w-full justify-between items-center px-6">
        <Link href="/" className="text-lg font-semibold">
          WaveRiders
        </Link>
        <div className="flex items-center gap-8 md:gap-8">{renderNavLinks()}</div>
      </div>
    </div>
  );
};

export default NavBar;

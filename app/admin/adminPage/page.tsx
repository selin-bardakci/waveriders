'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  account_type: 'customer' | 'business';
  created_at: string;
  date_of_birth: string;
  business_id?: number;
}

interface Boat {
  boat_id: number;
  boat_business_id: number;
  boat_name : string;
  boat_desctiption: string;
  boat_registration: string;
  boat_trip_type: string;
  boat_price_per_hour: number;
  boat_price_per_day: number;
  boat_capacity: number;
  boat_type: string;
  boat_location: string;
  boat_available: boolean;
  boat_created_at: string;
  boat_image: string;
  boat_licaense_path: string;
}

interface Captain {
  captain_id: number;
  business_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  experience_years: number;
  registration_papers: string;
}
const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [boat, setBoats] = useState<Boat[]>([]);
  const [boat_name, setBoatName] = useState<string | null>(null);
  const [boat_description, setBoatDescription] = useState<string | null>(null);
  const [boat_registration, setBoatRegistration] = useState<string | null>(null);
  const [boat_trip_type, setBoatTripType] = useState<string | null>(null);
  const [boat_price_per_hour, setBoatPricePerHour] = useState<number | null>(null);
  const [boat_price_per_day, setBoatPricePerDay] = useState<number | null>(null);
  const [boat_capacity, setBoatCapacity] = useState<number | null>(null);
  const [boat_type, setBoatType] = useState<string | null>(null);
  const [boat_location, setBoatLocation] = useState<string | null>(null);
  const [boat_available, setBoatAvailable] = useState<boolean | null>(null);
  const [boat_created_at, setBoatCreatedAt] = useState<string | null>(null);
  const [boat_image, setBoatImage] = useState<string | null>(null);
  const [boat_license_path, setBoatLicensePath] = useState<string | null>(null);
  const [captain, setCaptain] = useState<Captain[]>([]);
  const [captain_name, setCaptainName] = useState<string | null>(null);
  const [captain_surname, setCaptainSurname] = useState<string | null>(null);
  const [captain_phone, setCaptainPhone] = useState<string | null>(null);
  const [captain_dob, setCaptainDob] = useState<string | null>(null);
  const [captain_exp, setCaptainExp] = useState<number | null>(null);
  const [captain_reg, setCaptainReg] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [business_id, setBusinessId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectTextBox, setShowRejectTextBox] = useState(false);
  const [rejectEmailContent, setRejectEmailContent] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8081/api/auth/user');
        setUsers(response.data.users);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to fetch user data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      setBoats([]); // Boat verilerini sıfırla
      setCaptain([]); // Captain verilerini sıfırla
    }
  }, [isModalOpen]);


  const showUserDetails = async (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setShowRejectTextBox(false);
    setRejectEmailContent('');
  
    try {
      const businessIdResponse = await axios.get('http://localhost:8081/api/auth/businessID', {
        params: { user_id: user.user_id },
      });
      const businessId = businessIdResponse.data.business_id;
      user.business_id = businessId;
  
      if (businessId) {
        // Fetch boats
        const boatResponse = await axios.get('http://localhost:8081/api/auth/boat', {
          params: { business_id: businessId },
        });
  
        const boats = boatResponse.data.boats; // Access the 'boats' array
        if (boats && boats.length > 0) {
          const firstBoat = boats[0];
          setBoats(boats);
          setBoatName(firstBoat.boat_name);
          setBoatDescription(firstBoat.description);
          setBoatRegistration(firstBoat.boat_registration);
          setBoatTripType(firstBoat.trip_types);
          setBoatPricePerHour(parseFloat(firstBoat.price_per_hour));
          setBoatPricePerDay(firstBoat.price_per_day ? parseFloat(firstBoat.price_per_day) : null);
          setBoatCapacity(firstBoat.capacity);
          setBoatType(firstBoat.boat_type);
          setBoatLocation(firstBoat.location);
          setBoatAvailable(firstBoat.available === 1);
          setBoatCreatedAt(firstBoat.created_at);
          setBoatImage(firstBoat.photos && firstBoat.photos.length > 0 ? firstBoat.photos[0] : null);
          setBoatLicensePath(firstBoat.boat_license_path);
        } else {
          console.warn('No boats found for this business ID');
        }
  
        // Fetch captains
        const captainResponse = await axios.get('http://localhost:8081/api/auth/captain', {
          params: { business_id: businessId },
        });
  
        const captains = captainResponse.data.captains; // Access the 'captains' array
        if (captains && captains.length > 0) {
          const firstCaptain = captains[0];
          setCaptain(captains);
          setCaptainName(firstCaptain.first_name);
          setCaptainSurname(firstCaptain.last_name);
          setCaptainPhone(firstCaptain.phone_number);
          setCaptainDob(firstCaptain.date_of_birth);
          setCaptainExp(firstCaptain.experience_years);
          setCaptainReg(firstCaptain.registration_papers);
        } else {
          console.warn('No captains found for this business ID');
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setBoats([]);
      setCaptain([]);
    }
  };
  
  

const handleApprove = async () => {
    if (selectedUser) {
      try {
        await axios.post('http://localhost:8081/api/auth/approve', {
          userId: selectedUser.user_id,
        });
        alert('User approved.');
        setIsModalOpen(false);
      } catch (err) {
        console.error('Failed to approve user:', err);
        alert('Failed to approve user.');
      }
    }
  };

  const handleReject = async () => {
    if (selectedUser && rejectEmailContent.trim()) {
      try {
        await axios.post('http://localhost:8081/api/auth/reject', {
          userId: selectedUser.user_id,
          emailContent: rejectEmailContent,
        });
        alert('User rejected.');
        setIsModalOpen(false);
      } catch (err) {
        console.error('Failed to reject user:', err);
        alert('Failed to reject user.');
      }
    } else {
      alert('Please enter rejection email content.');
    }
  };

  return (

    <div className="min-h-screen bg-gray-100 p-8">
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.user_id}
              className="bg-white p-4 border border-gray-200 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
              onClick={() => showUserDetails(user)}
            >
              <h3 className="text-lg font-bold text-gray-700">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-gray-500">{user.email}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No users found.</p>
      )}

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="w-full max-w-md bg-white p-8 border border-gray-300 rounded-lg shadow-lg relative">
            <button
              onClick={() => setIsModalOpen(false)}
                
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              User Information
            </h2>
            <p><strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone:</strong> {selectedUser.phone_number}</p>
            <p><strong>Account Type:</strong> {selectedUser.account_type}</p>
            <p><strong>Account Created:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
            <p><strong>Date of Birth:</strong> {new Date(selectedUser.date_of_birth).toLocaleDateString()}</p>

            {selectedUser.account_type === 'business' && (
              <>
                <h3 className="text-xl font-bold mt-6">Boat</h3>
                <p><strong>Boat Name:</strong> {boat_name}</p>
                <p><strong>Description:</strong> {boat_description}</p>
                <p><strong>Registration:</strong> {boat_registration}</p>
                <p><strong>Trip Type:</strong> {boat_trip_type}</p>
                <p><strong>Price per Hour:</strong> {boat_price_per_hour}</p>
                <p><strong>Price per Day:</strong> {boat_price_per_day}</p>
                <p><strong>Capacity:</strong> {boat_capacity}</p>
                <p><strong>Type:</strong> {boat_type}</p>
                <p><strong>Location:</strong> {boat_location}</p>
                <p><strong>Available:</strong> {boat_available ? 'Yes' : 'No'}</p>
                <p><strong>Created At:</strong> {new Date(boat_created_at || '').toLocaleString()}</p>
                <p><strong>Image:</strong> {boat_image}</p>
                <p><strong>License Path:</strong> {boat_license_path}</p>

                <h3 className="text-xl font-bold mt-6">Captain</h3>
                <p><strong>Name:</strong> {captain_name} {captain_surname}</p>
                <p><strong>Phone:</strong> {captain_phone}</p>
                <p><strong>Date of Birth:</strong> {captain_dob}</p>
                <p><strong>Experience:</strong> {captain_exp} years</p>
                <p><strong>Registration Papers:</strong> {captain_reg}</p>


              </>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={handleApprove}
                className="w-1/2 mr-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectTextBox(true)}
                className="w-1/2 ml-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Reject
              </button>
            </div>

            {showRejectTextBox && (
              <div className="mt-4">
                <textarea
                  placeholder="Enter rejection reason..."
                  value={rejectEmailContent}
                  onChange={(e) => setRejectEmailContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
                <button
                  onClick={handleReject}
                  className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Reject and Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

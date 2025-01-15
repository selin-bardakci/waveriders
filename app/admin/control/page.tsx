'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface Boat {
  verification_id: number;
  boat_id: number;
  boat_name: string;
  business_id: number;
}

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  account_type: string;
  created_at: string;
  date_of_birth: string;
  business_name?: string; // Add business_name as optional
}


interface Captain {
  captain_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  experience_years: number;
  registration_papers: string;
}

const ControlPage = () => {
  const { user, isLoggedIn } = useAuth(); // Kullanıcı bilgileri ve giriş durumu
  const router = useRouter();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [captainDetails, setCaptainDetails] = useState<Captain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectTextBox, setShowRejectTextBox] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Erişim kontrolü
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/admin/adminLogin'); // Giriş yapılmamışsa admin login sayfasına yönlendirme
      return;
    }

    if (user?.account_type !== 'admin') {
      router.push('/'); // Admin değilse ana sayfaya yönlendirme
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    const fetchInReviewBoats = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8081/api/verification/inReview');
        setBoats(response.data);
      } catch (err) {
        console.error('Failed to fetch boats under review:', err);
        setError('Failed to fetch boats under review.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInReviewBoats();
  }, []);

  // Kullanıcı ve kaptan bilgilerini çek
  const fetchDetails = async (boat: Boat) => {
    try {
      // Kullanıcı bilgilerini çek
      const userResponse = await axios.get('http://localhost:8081/api/verification/userDetails', {
        params: { boat_id: boat.boat_id },
      });
      setUserDetails(userResponse.data);

      // Captain bilgilerini çek
      const captainResponse = await axios.get('http://localhost:8081/api/auth/captain', {
        params: { business_id: boat.business_id },
      });

      if (captainResponse.data.captains && captainResponse.data.captains.length > 0) {
        setCaptainDetails(captainResponse.data.captains[0]);
      } else {
        setCaptainDetails(null);
      }

      // Bot lisansını çek (boat_id ile sorgula)
      const boatResponse = await axios.get('http://localhost:8081/api/auth/boat', {
        params: { boat_id: boat.boat_id }, // Burada boat_id kullanıyoruz.
      });
      console.log('User Details Response:', userResponse.data);
      if (boatResponse.data.boats && boatResponse.data.boats.length > 0) {
        const currentBoat = boatResponse.data.boats[0];
        setSelectedBoat({
          ...currentBoat,
          boat_license_path: currentBoat.boat_license_path || null,
        });
      } else {
        setSelectedBoat(null);
      }
    } catch (err) {
      console.error('Failed to fetch details:', err);
      setUserDetails(null);
      setCaptainDetails(null);
      alert('Failed to fetch user, captain, and boat details.');
    }
  };
  const handleApprove = async () => {
    if (!selectedBoat || !selectedBoat.boat_id) {
      console.error('handleApprove - No boat selected or boat_id is missing.');
      return alert('Boat ID is required to approve.');
    }

    try {
      const response = await axios.post('http://localhost:8081/api/verification/approve', {
        boat_id: selectedBoat.boat_id, // boat_id gönderiliyor
      });

      console.log('handleApprove - Response:', response.data);

      setBoats((prevBoats) => prevBoats.filter((b) => b.boat_id !== selectedBoat.boat_id));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to approve boat:', err);
      alert('Failed to approve boat.');
    }
  };


  const handleReject = async () => {
    if (!selectedBoat || !selectedBoat.boat_id || !rejectReason.trim()) {
      console.error('handleReject - Boat ID or rejection reason is missing.');
      return alert('Boat ID and rejection reason are required to reject.');
    }

    try {
      const response = await axios.post('http://localhost:8081/api/verification/reject', {
        boat_id: selectedBoat.boat_id,
        reason: rejectReason,
      });

      console.log('handleReject - Response:', response.data);


      setBoats((prevBoats) => prevBoats.filter((b) => b.boat_id !== selectedBoat.boat_id));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to reject boat:', err);
      alert('Failed to reject boat.');
    }
  };


  const showDetails = async (boat: Boat) => {
    setSelectedBoat(boat);
    setIsModalOpen(true);
    await fetchDetails(boat);
  };

  if (isLoading) {
    return <div>Loading...</div>; // Yükleniyor durumunu göster
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : boats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {boats.map((boat) => (
            <div
              key={boat.verification_id}
              className="bg-white p-4 border border-gray-200 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
              onClick={() => showDetails(boat)}
            >
              <h3 className="text-lg font-bold text-gray-700">{boat.boat_name}</h3>
              <p className="text-gray-500">Boat ID: {boat.boat_id}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No boats under review.</p>
      )}

      {isModalOpen && selectedBoat && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div
            className="w-full max-w-lg bg-white p-8 border border-gray-300 rounded-lg shadow-lg relative overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <div className="modal-content p-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Boat Details
              </h2>
              <div className="modal-body">
                <p><strong>Name:</strong> {selectedBoat.boat_name}</p>
                <p><strong>Boat ID:</strong> {selectedBoat.boat_id}</p>

                {userDetails && (
                  <>
                    <h3 className="text-xl font-bold mt-6">User Details</h3>
                    <p>
                      <strong>Name:</strong>{' '}
                      {userDetails.first_name && userDetails.last_name
                        ? `${userDetails.first_name} ${userDetails.last_name}`
                        : userDetails.business_name || 'N/A'}
                    </p>
                    <p><strong>Email:</strong> {userDetails.email}</p>
                    <p><strong>Phone:</strong> {userDetails.phone_number}</p>
                    <p><strong>Account Type:</strong> {userDetails.account_type}</p>
                    <p>
                      <strong>Account Created:</strong> {new Date(userDetails.created_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>Date of Birth:</strong> {new Date(userDetails.date_of_birth).toLocaleDateString()}
                    </p>
                  </>
                )}

                <h3 className="text-xl font-bold mt-6">Boat License</h3>
                {selectedBoat?.boat_license_path ? (
                  <div className="mt-4">
                    <img
                      src={selectedBoat.boat_license_path}
                      alt="Boat License"
                      className="w-full h-auto rounded-lg border border-gray-200 hover:shadow-lg transition cursor-pointer"
                      onClick={() => window.open(selectedBoat.boat_license_path, '_blank', 'noopener,noreferrer')}
                    />
                  </div>
                ) : (
                  <p>No boat license available.</p>
                )}

                {captainDetails && (
                  <>
                    <h3 className="text-xl font-bold mt-6">Captain Details</h3>
                    <p><strong>Name:</strong> {captainDetails.first_name} {captainDetails.last_name}</p>
                    <p><strong>Phone:</strong> {captainDetails.phone_number}</p>
                    <p>
                      <strong>Date of Birth:</strong>{' '}
                      {new Date(captainDetails.date_of_birth).toLocaleDateString()}
                    </p>
                    <p><strong>Experience:</strong> {captainDetails.experience_years} years</p>

                    <h3 className="text-xl font-bold mt-6">Captain License</h3>
                    <div className="mt-4">
                      <img
                        src={captainDetails.registration_papers}
                        alt="Captain License"
                        className="w-full h-auto rounded-lg border border-gray-200 hover:shadow-lg transition cursor-pointer"
                        onClick={() =>
                          window.open(captainDetails.registration_papers, '_blank', 'noopener,noreferrer')
                        }
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer mt-6 flex justify-between">
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
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
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
        </div>
      )}

    </div>
  );




};

export default ControlPage;

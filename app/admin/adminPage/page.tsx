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
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectTextBox, setShowRejectTextBox] = useState(false);
  const [rejectEmailContent, setRejectEmailContent] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/auth/user');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Failed to fetch user data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const showUserDetails = (user: User): void => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setShowRejectTextBox(false); // Reset reject text box visibility on modal open
    setRejectEmailContent(''); // Reset email content
  };

  const handleApprove = async () => {
    if (selectedUser) {
      try {
        await axios.post(`http://localhost:8081/api/auth/approve`, { userId: selectedUser.user_id });
        alert("User approved.");
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to approve user:", error);
        alert("Failed to approve user.");
      }
    }
  };

  const handleReject = async () => {
    if (selectedUser && rejectEmailContent) {
      try {
        await axios.post(`http://localhost:8081/api/auth/reject`, { 
          userId: selectedUser.user_id,
          emailContent: rejectEmailContent 
        });
        alert("User rejected.");
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to reject user:", error);
        alert("Failed to reject user.");
      }
    } else {
      alert("Please enter rejection email content.");
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

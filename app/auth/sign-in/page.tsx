'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; 
import axios from 'axios';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setIsLoggedIn } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/'); // Redirect authenticated users to homepage
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); 

    try {
      const response = await axios.post('https://api.waveriders.com.tr/api/auth/login', {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, user } = response.data; 
        localStorage.setItem('token', token); 
        setUser(user); 
        setIsLoggedIn(true); 
        console.log("Sign-in successful, token stored.");

        // Retrieve the redirect URL from sessionStorage
        const redirect = sessionStorage.getItem('redirectAfterLogin') || '/';
        console.log("Redirecting to:", redirect);

        // Remove the redirect path from sessionStorage
        sessionStorage.removeItem('redirectAfterLogin');

        // Redirect to the intended page
        router.push(redirect);
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle Axios error
        console.error('Sign-in error:', err);
        setError(err.response?.data?.message || 'An unexpected error occurred.');
      } else {
        // Handle non-Axios error
        console.error('An unexpected error occurred:', err);
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-20 flex justify-center">
      <div className="w-full max-w-md bg-white p-8 border border-gray-300 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Password Input */}
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Error Message */}
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          {/* Sign In Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-10 py-3 text-sm rounded-lg hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="text-center mt-4">
  <a
    href="/forgot-password"
    className="text-gray-500 hover:underline text-sm hover:text-gray-700"
  >
    Forgot your password?
  </a>
</div>


        </form>
      </div>
    </div>
  );
};

export default SignInPage;

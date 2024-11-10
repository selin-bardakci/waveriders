'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Basit bir kullanıcı adı ve şifre doğrulaması
    if (username === 'admin' && password === 'password') {
      setError('');
      router.push('/admin/adminPage'); // Admin sayfasına yönlendirme
    } else {
      setError('Geçersiz kullanıcı adı veya şifre!');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sol Taraf Görseli */}
      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center">
      </div>

      {/* Sağ Taraf Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center overflow-y-auto max-h-screen">
        <div className="w-full max-w-lg bg-white p-8 border border-gray-300 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Admin Giriş
          </h2>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <div className="text-center">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-10 py-3 text-sm rounded-lg hover:bg-blue-600 transition"
              >
                Giriş Yap
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

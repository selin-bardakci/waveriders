'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // AuthContext'i kullanıyoruz
import axios from 'axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setIsLoggedIn } = useAuth(); // AuthContext'ten kullanıcıyı ayarla ve giriş durumunu yönet
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Eğer token varsa giriş yapmış bir kullanıcıyı kontrol et
      axios
        .get('http://localhost:8081/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const { account_type } = response.data;
          if (account_type === 'admin') {
            router.push('/admin/control'); // Admin ise admin kontrol sayfasına yönlendir
          } else {
            router.push('/'); // Customer veya Business ise ana sayfaya yönlendir
          }
        })
        .catch(() => {
          localStorage.removeItem('token'); // Token geçersizse kaldır
        });
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, user } = response.data;

        if (user.account_type === 'admin') {
          // Eğer kullanıcı admin ise
          localStorage.setItem('token', token); // Tokeni localStorage'a kaydet
          setUser(user); // Admin bilgilerini AuthContext'e kaydet
          setIsLoggedIn(true); // Giriş durumunu güncelle
          setError(''); // Hata mesajını sıfırla
          router.push('/admin/control'); // Admin kontrol paneline yönlendir
        } else {
          setError('Only admins can access this page.'); // Admin değilse hata göster
        }
      } else {
        setError('Invalid email or password.'); // Yanlış bilgiler için hata
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false); // Yükleme durumunu sıfırla
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sol Taraf (İsteğe bağlı görsel veya tasarım alanı) */}
      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center">
        {/* Görsel alanı */}
      </div>

      {/* Sağ Taraf (Giriş Formu) */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center overflow-y-auto max-h-screen">
        <div className="w-full max-w-lg bg-white p-8 border border-gray-300 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Admin Login
          </h2>

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Login Button */}
            <div className="text-center">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-10 py-3 text-sm rounded-lg hover:bg-blue-600 transition"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

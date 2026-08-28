import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FONT_STACK = "font-['Helvetica_Neue',Helvetica,Arial,'Lucida_Grande',sans-serif]";

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 bg-[#FAFAFA] ${FONT_STACK}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl uppercase tracking-[0.4px] [transform:scaleY(0.85)] leading-none mb-2">
            Rektelier
          </h1>
          <p className="text-xs uppercase tracking-wide text-rektelier-muted">Admin Panel</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-rektelier-border rounded-lg shadow-sm px-8 py-10 space-y-5"
        >
          <div>
            <label className="block text-xs uppercase tracking-wide text-rektelier-muted mb-1.5">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="Masukkan username"
              className="w-full border border-rektelier-border bg-white px-4 py-2.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-rektelier-black focus:border-rektelier-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-rektelier-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan password"
                className="w-full border border-rektelier-border bg-white px-4 py-2.5 pr-16 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-rektelier-black focus:border-rektelier-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-rektelier-muted hover:text-rektelier-black transition-colors"
              >
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rektelier-black text-white uppercase tracking-wide text-sm px-6 py-3 rounded-md transition-colors duration-300 hover:bg-rektelier-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-xs text-rektelier-muted mt-6">
          Halaman ini khusus untuk tim internal Rektelier.
        </p>
      </div>
    </div>
  );
}
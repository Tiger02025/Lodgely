import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState('');

  const loginMutation = useMutation(
    (data: LoginForm) => api.post('/auth/login', data).then((res) => res.data.data),
    {
      onSuccess: ({ accessToken, user }) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(accessToken, user);
        navigate('/');
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Login failed');
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="max-w-md w-full space-y-8 p-8 card">
        <div>
          <img src="/logo.png" alt="Lodgely" className="mx-auto h-16 w-auto" />
          <p className="mt-3 text-center text-sm text-primary-700">Sign in to your admin account</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="admin@lodgely.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isLoading}
            className="w-full btn-primary"
          >
            {loginMutation.isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

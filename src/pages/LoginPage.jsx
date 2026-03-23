import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setError('');
    setUsername('');
    setPassword('');
  };

  const isLogin = mode === 'login';

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <h1 className="login-brand">WOTN</h1>
          <p className="login-tagline">Wisdom of the Noise</p>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-title">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="login-subtitle">
              {isLogin
                ? 'Sign in to access your insights'
                : 'Start building your intelligence library'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Username */}
            <div className="login-field">
              <label htmlFor="username" className="login-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input login-input-password"
                  placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <span className="login-submit-loading">
                  <span className="login-spinner" />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                <span className="login-submit-content">
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? 'Sign in' : 'Create account'}
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="login-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" className="login-toggle-btn" onClick={toggleMode}>
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

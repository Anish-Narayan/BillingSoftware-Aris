import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Use imported auth instance here
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setLoading(false);
        navigate('/dashboard');
      })
      .catch((error) => {
        setLoading(false);
        switch (error.code) {
          case 'auth/user-not-found':
            setError('No account found with this email address.');
            break;
          case 'auth/invalid-credential':
            setError('Incorrect password. Please try again.');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          default:
            setError('Failed to log in. Please try again later.');
            break;
        }
        console.error("Firebase login error:", error);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">BillingPro Login</h2>
        {error && <p className="text-red-500 text-center mb-4 font-semibold">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email Address:</label>
            <input
              type="email"
              id="email"
              className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-8">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password:</label>
            <input
              type="password"
              id="password"
              className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full text-lg
                       transition duration-200 ease-in-out transform hover:scale-105 shadow-md
                       disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
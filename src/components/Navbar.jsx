import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Import Firebase auth functions
import { onAuthStateChanged, signOut } from 'firebase/auth';
// Adjust the import path to your Firebase config file
import { auth } from '../../firebase'; 

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State to hold the current logged-in user
  const [user, setUser] = useState(null);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Clients', path: '/clients' },
    { name: 'Invoices', path: '/invoices' },
    { name: 'Payments', path: '/payments' },
  ];

  // Effect to listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user if logged in, null if not
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to login or home page after logout
      navigate('/login'); 
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <nav className="bg-white text-gray-800 shadow-lg p-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-200">
      {/* Left Section: Brand and Navigation */}
      <div className="flex items-center space-x-8">
        <Link to="/dashboard" className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-900 transition-colors duration-200">
          <span className="text-3xl font-extrabold">BS</span>
          <span className="text-2xl font-bold">BillingSystem</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center space-x-2 py-2 px-3 rounded-md text-lg font-medium transition-colors duration-200
                ${location.pathname === link.path
                  ? 'bg-indigo-100 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
            >
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Section: User Info, Logout */}
      <div className="flex items-center space-x-4">
        {/* User Info and Logout: Displayed only if a user is logged in */}
        {user ? (
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <span className="text-gray-700 font-medium">
                  {/* Use displayName or fallback to the email prefix */}
                  Welcome, {user.displayName || user.email.split('@')[0]}
                </span>
                <p className="text-gray-500 text-sm">
                  {user.email}
                </p>
             </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-md"
            >
              <span>Logout</span>
            </button>
          </div>
        ) : (
          // Optional: Show a Login button if no user is logged in
          <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Clients', path: '/clients' },
    { name: 'Invoices', path: '/invoices' },
    { name: 'Payments', path: '/payments' },
  ];

  return (
    <nav className="bg-white text-gray-800 shadow-lg p-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-200">
      {/* Left Section: Brand and Navigation */}
      <div className="flex items-center space-x-8">
        <Link to="/dashboard" className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-900 transition-colors duration-200">
          {/* You can replace this with your actual logo, or keep the text */}
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

      {/* Right Section: Search, User Info, Logout */}
      <div className="flex items-center space-x-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-4 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          />
          {/* Removed SearchIcon */}
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium hidden sm:block">Welcome, Admin!</span>
          <span className="text-gray-500 text-sm hidden lg:block">admin@billing.com</span>
          <button className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-md">
            {/* Removed LogoutIcon */}
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
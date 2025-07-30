import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-200">
      <div className="text-2xl font-semibold text-gray-800">Admin Panel</div>
      <div>
        <span className="mr-4 text-gray-700 font-medium">Welcome, Admin!</span>
        <button
          onClick={() => (window.location.href = '/login')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-md"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Clients', path: '/clients' },
    { name: 'Invoices', path: '/invoices' },
    { name: 'Payments', path: '/payments' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed shadow-xl">
      <div className="p-6 text-3xl font-extrabold text-indigo-400 border-b border-gray-700">
        BillingSystem
      </div>
      <nav className="mt-8">
        <ul>
          {navLinks.map((link) => (
            <li key={link.name} className="mb-2">
              <Link
                to={link.path}
                className={`block py-3 px-6 text-lg font-medium rounded-r-full transition-all duration-200 ease-in-out
                  ${location.pathname === link.path
                    ? 'bg-indigo-700 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
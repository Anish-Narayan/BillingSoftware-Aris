import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import Navbar from './Navbar'; // Assuming Navbar is in the same folder

// A simple spinner component for the loading state
const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const ProtectedRoute = () => {
  const { loggedIn, checkingStatus } = useAuthStatus();

  // 1. While Firebase is checking the auth status, show a spinner
  if (checkingStatus) {
    return <Spinner />;
  }

  // 2. If the check is complete, either render the protected content or redirect
  return loggedIn ? (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-4 md:p-8">
        <Outlet /> 
      </main>
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
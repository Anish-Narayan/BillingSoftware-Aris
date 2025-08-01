import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Payments from './pages/Payments';

// Import the ProtectedRoute component
import ProtectedRoute from './components/ProtectedRoute';

import './index.css'; // Import Tailwind CSS

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route: Anyone can access the login page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes: Only logged-in users can access these */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/payments" element={<Payments />} />
          
          {/* Fallback for any other route for a logged-in user */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
        
        {/* Redirect root path to login by default */}
        <Route path="/" element={<Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}

export default App;
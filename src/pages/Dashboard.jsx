// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import AddClientModal from '../components/AddClientModal';
import AddEditInvoiceModal from '../components/AddEditInvoiceModal';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const Dashboard = () => {
  // State for dynamic summary data
  const [totalClients, setTotalClients] = useState(0);
  const [totalInvoiced, setTotalInvoiced] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [outstandingAmount, setOutstandingAmount] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [clients, setClients] = useState([]); // State for clients list for the modal

  // State for UI control
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const fetchData = async () => {
    setError(null);
    try {
      // Fetch clients and invoices in parallel for better performance
      const clientsQuery = query(collection(db, 'clients'), orderBy('name', 'asc'));
      const invoicesQuery = collection(db, 'invoices');
      
      const [clientSnapshot, invoiceSnapshot] = await Promise.all([
          getDocs(clientsQuery),
          getDocs(invoicesQuery)
      ]);

      // Process Clients data
      setTotalClients(clientSnapshot.size);
      setClients(clientSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      // Process Invoices data
      const fetchedInvoices = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      let invoicedSum = 0, paidSum = 0, currentOverdueSum = 0;
      const currentOverdueInvoices = [];

      fetchedInvoices.forEach(invoice => {
        const currentTotalAmount = parseFloat(invoice.totalAmount) || 0;
        const currentPaidAmount = parseFloat(invoice.paidAmount) || 0;
        invoicedSum += currentTotalAmount;
        paidSum += currentPaidAmount;
        const outstandingForThisInvoice = currentTotalAmount - currentPaidAmount;
        if (invoice.status === 'overdue' && outstandingForThisInvoice > 0) {
          currentOverdueInvoices.push(invoice);
          currentOverdueSum += outstandingForThisInvoice;
        }
      });

      const totalOutstandingSum = invoicedSum - paidSum;
      const currentOutstandingNotOverdue = totalOutstandingSum - currentOverdueSum;
      setTotalInvoiced(invoicedSum);
      setTotalPaid(paidSum);
      setOutstandingAmount(currentOutstandingNotOverdue);
      setOverdueAmount(currentOverdueSum);
      setOverdueInvoices(currentOverdueInvoices);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Generic success handler for modals
  const handleSuccess = () => {
    setIsClientModalOpen(false);
    setIsInvoiceModalOpen(false);
    fetchData(); // Re-fetch all data to update the dashboard
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-gray-800">Admin Panel</h1>
            <p className="text-gray-600 text-lg">Dashboard Overview</p>
            <p className="text-gray-500 text-md mt-1">Monitor your business performance, track invoices, and manage client relationships all in one place.</p>
          </div>
          <div className="bg-indigo-50 rounded-full p-6 hidden md:block">
            <div className="h-16 w-16 bg-indigo-400 opacity-60 rounded-full flex items-center justify-center text-white text-3xl font-bold">📈</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          <SummaryCard title="Total Clients" value={totalClients} colorClass="text-indigo-500" />
          <SummaryCard title="Total Invoiced" value={`₹${totalInvoiced.toFixed(2)}`} colorClass="text-green-500" />
          <SummaryCard title="Total Paid" value={`₹${totalPaid.toFixed(2)}`} colorClass="text-blue-500" />
          <SummaryCard title="Outstanding" value={`₹${outstandingAmount.toFixed(2)}`} colorClass="text-yellow-500" />
          <SummaryCard title="Overdue" value={`₹${overdueAmount.toFixed(2)}`} colorClass="text-red-500" alertCount={overdueInvoices.length} />
        </div>

        <div className="mb-12">
          <div className="flex items-center text-3xl font-bold text-gray-800 mb-6">
            <h2>Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <QuickActionCard title="Add New Client" description="Register a new client to your system" icon="👤" bgColor="bg-blue-50" iconBgColor="bg-blue-200" iconColor="text-blue-600" onClick={() => setIsClientModalOpen(true)} />
            <QuickActionCard title="Create Invoice" description="Generate a new invoice for services" icon="📝" bgColor="bg-green-50" iconBgColor="bg-green-200" iconColor="text-green-600" onClick={() => setIsInvoiceModalOpen(true)} />
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">Overdue Invoices</h2>
            {overdueInvoices.length > 0 && (
              <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                {overdueInvoices.length} overdue
              </span>
            )}
          </div>
          {overdueInvoices.length > 0 ? (
            <ul className="list-none pl-0 space-y-3">
              {overdueInvoices.map(invoice => {
                const outstandingAmountForInvoice = (parseFloat(invoice.totalAmount) || 0) - (parseFloat(invoice.paidAmount) || 0);
                return (
                  <li key={invoice.id} className="text-lg text-gray-700 p-3 bg-red-50 rounded-md flex justify-between items-center flex-wrap">
                    <div>
                      Invoice <Link to={`/invoices/${invoice.id}`} className="font-semibold text-indigo-600 hover:underline">{invoice.invoiceNumber}</Link> for <span className="font-semibold">{invoice.clientName}</span> - <span className="font-bold text-red-700">₹{outstandingAmountForInvoice.toFixed(2)}</span>
                    </div>
                    <span className="text-sm text-gray-600 mt-1 sm:mt-0">Due: {invoice.dueDate}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xl text-green-600 font-medium">No overdue invoices! Everything is up to date.</p>
          )}
        </div>
      </div>

      {/* Reusable Modals */}
      <AddClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={handleSuccess}
      />
      <AddEditInvoiceModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={handleSuccess}
        clients={clients} // Pass the fetched clients list to the modal
      />
    </div>
  );
};

const QuickActionCard = ({ title, description, icon, bgColor, iconBgColor, iconColor, onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg border border-gray-200 text-center
                ${bgColor} transition-transform duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl cursor-pointer`}
  >
    <div className={`p-3 rounded-full ${iconBgColor} mb-4`}>
      <span className={`h-12 w-12 flex items-center justify-center text-3xl ${iconColor}`}>{icon}</span>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default Dashboard;
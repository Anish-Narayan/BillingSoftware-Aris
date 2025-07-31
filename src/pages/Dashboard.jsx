import React from 'react';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import { invoices } from '../data/invoices';
import { clients } from '../data/clients';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'Overdue');

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
          {/* Illustrative graphic (can be replaced with an image if desired) */}
          <div className="bg-indigo-50 rounded-full p-6 hidden md:block">
            {/* Placeholder for a chart/analytics icon or graphic */}
            <div className="h-16 w-16 bg-indigo-400 opacity-60 rounded-full flex items-center justify-center text-white text-3xl font-bold">📈</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <SummaryCard
            title="Total Clients"
            value={clients.length}
            percentageChange="+12"
            // Removed icon prop
            colorClass="text-indigo-500"
          />
          <SummaryCard
            title="Total Invoiced"
            value={`₹${totalInvoiced.toFixed(2)}`}
            percentageChange="+8"
            // Removed icon prop
            colorClass="text-green-500"
          />
          <SummaryCard
            title="Total Paid"
            value={`₹${totalPaid.toFixed(2)}`}
            percentageChange="+5"
            // Removed icon prop
            colorClass="text-blue-500"
          />
          <SummaryCard
            title="Total Outstanding"
            value={`₹${totalOutstanding.toFixed(2)}`}
            percentageChange="-3"
            // Removed icon prop
            colorClass="text-red-500"
            alertCount={overdueInvoices.length}
          />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <div className="flex items-center text-3xl font-bold text-gray-800 mb-6">
            <span className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3 text-xl font-bold">+</span> {/* Placeholder for PlusIcon */}
            <h2>Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <QuickActionCard
              title="Add New Client"
              description="Register a new client to your system"
              icon="👤" // Placeholder icon
              bgColor="bg-blue-50"
              iconBgColor="bg-blue-200"
              iconColor="text-blue-600"
              link="/clients"
            />
            <QuickActionCard
              title="Create Invoice"
              description="Generate a new invoice for services"
              icon="📝" // Placeholder icon
              bgColor="bg-green-50"
              iconBgColor="bg-green-200"
              iconColor="text-green-600"
              link="/invoices"
            />
            <QuickActionCard
              title="View Analytics"
              description="Track performance and insights"
              icon="📊" // Placeholder icon
              bgColor="bg-purple-50"
              iconBgColor="bg-purple-200"
              iconColor="text-purple-600"
              link="/dashboard" // Link to self for prototype
            />
            <QuickActionCard
              title="Quick Actions"
              description="Access frequently used tools"
              icon="⚡" // Placeholder icon
              bgColor="bg-orange-50"
              iconBgColor="bg-orange-200"
              iconColor="text-orange-600"
              link="/dashboard" // Link to self for prototype
            />
          </div>
        </div>

        {/* Overdue Invoices Section */}
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
              {overdueInvoices.map(invoice => (
                <li key={invoice.id} className="text-lg text-gray-700 p-2 bg-red-50 rounded-md">
                  Invoice <span className="font-semibold text-red-700">{invoice.id}</span> for <span className="font-semibold">{invoice.clientName}</span> - <span className="font-bold text-red-700">₹{invoice.amount.toFixed(2)}</span> (Due: {invoice.dueDate})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xl text-green-600 font-medium">No overdue invoices! Everything is up to date.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for Quick Action Cards
const QuickActionCard = ({ title, description, icon, bgColor, iconBgColor, iconColor, link }) => (
  <Link
    to={link}
    className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg border border-gray-200 text-center
                ${bgColor} transition-transform duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl cursor-pointer`}
  >
    <div className={`p-3 rounded-full ${iconBgColor} mb-4`}>
      <span className={`h-12 w-12 flex items-center justify-center text-3xl ${iconColor}`}>{icon}</span>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </Link>
);

export default Dashboard;
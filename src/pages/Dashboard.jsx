import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import { invoices } from '../data/invoices';
import { clients } from '../data/clients';

const Dashboard = () => {
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'Overdue');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <div className="p-10 overflow-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-10">Dashboard Overview</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <SummaryCard title="Total Clients" value={clients.length} />
            <SummaryCard title="Total Invoiced" value={`₹${totalInvoiced.toFixed(2)}`} />
            <SummaryCard title="Total Paid" value={`₹${totalPaid.toFixed(2)}`} />
            <SummaryCard title="Total Outstanding" value={`₹${totalOutstanding.toFixed(2)}`} />
          </div>

          <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-red-600 mb-6">Overdue Invoices</h2>
            {overdueInvoices.length > 0 ? (
              <ul className="list-disc pl-6 space-y-3">
                {overdueInvoices.map(invoice => (
                  <li key={invoice.id} className="text-lg text-gray-700">
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
    </div>
  );
};

export default Dashboard;
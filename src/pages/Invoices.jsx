import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import InvoiceTable from '../components/InvoiceTable';
import { invoices } from '../data/invoices';

const Invoices = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <div className="p-10 overflow-auto">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-10">Invoices</h1>
          <InvoiceTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
};

export default Invoices;
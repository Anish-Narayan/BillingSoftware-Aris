import React from 'react';
import Navbar from '../components/Navbar';
import InvoiceTable from '../components/InvoiceTable';
import { invoices } from '../data/invoices';

const Invoices = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10">Invoices</h1>
        <InvoiceTable invoices={invoices} />
      </div>
    </div>
  );
};

export default Invoices;
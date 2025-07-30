import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ClientTable from '../components/ClientTable';
import Modal from '../components/Modal';
import { clients } from '../data/clients';

const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClientClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <div className="p-10 overflow-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800">Clients</h1>
            <button
              onClick={handleAddClientClick}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                         transition duration-200 ease-in-out transform hover:scale-105"
            >
              Add New Client
            </button>
          </div>

          <ClientTable clients={clients} />

          <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Client">
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientName">
                  Client Name
                </label>
                <input
                  type="text"
                  id="clientName"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientEmail">
                  Email
                </label>
                <input
                  type="email"
                  id="clientEmail"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientPhone">
                  Phone
                </label>
                <input
                  type="text"
                  id="clientPhone"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="123-456-7890"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientAddress">
                  Address
                </label>
                <textarea
                  id="clientAddress"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
                  placeholder="123 Main St, Anytown, USA"
                ></textarea>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                             transition duration-200 ease-in-out transform hover:scale-105"
                >
                  Save Client (Non-functional)
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Clients;
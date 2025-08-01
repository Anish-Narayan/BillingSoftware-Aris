// src/pages/Clients.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ClientTable from '../components/ClientTable';
import AddClientModal from '../components/AddClientModal'; // Import the new modal
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch clients from Firestore
  const fetchClients = async () => {
    setLoading(true);
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClients(clientsList);
    setLoading(false);
  };

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // This function is called on successful submission from the modal
  const handleClientAdded = () => {
    handleCloseModal(); // Close the modal
    fetchClients();     // And refresh the client list
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">Clients</h1>
          <button
            onClick={() => setIsModalOpen(true)} // Just open the modal
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                       transition duration-200 ease-in-out transform hover:scale-105"
          >
            Add New Client
          </button>
        </div>
        
        {loading ? <p>Loading clients...</p> : <ClientTable clients={clients} />}

        {/* Use the reusable modal component */}
        <AddClientModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleClientAdded}
        />
      </div>
    </div>
  );
};

export default Clients;
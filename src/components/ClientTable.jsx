import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase'; // Import Firestore db
import { collection, onSnapshot } from 'firebase/firestore'; // Use onSnapshot for real-time updates

const ClientTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    setLoading(true);
    const clientsCollection = collection(db, 'clients');
    const unsubscribe = onSnapshot(
      clientsCollection,
      (snapshot) => {
        const clientsList = snapshot.docs.map((doc) => ({
          id: doc.id, // Use Firestore document ID as the client ID
          name: doc.data().name,
          email: doc.data().email,
          phone: doc.data().phone,
          address: doc.data().address,
        }));
        setClients(clientsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching clients:', err.code, err.message);
        setError('Failed to load clients. Please try again.');
        setLoading(false);
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Loading clients...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Render empty state
  if (clients.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">No clients found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
            <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
              <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{client.phone}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{client.email}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{client.address}</td>
              <td className="py-4 px-6 whitespace-nowrap text-center text-sm font-medium">
                <Link
                  to={`/clients/${client.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:scale-105"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
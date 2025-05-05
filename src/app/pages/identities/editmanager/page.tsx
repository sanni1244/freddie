'use client'

import { useState, useEffect } from 'react';
import api from "@/lib/api"; // Ensure this is correctly pointing to your API

interface Manager {
  id: string;
  fullName: string;
}

interface Identity {
  id: string;
  identityType: string;
  identity: string;
  verificationStatus: string;
  createdAt: string;
}

const Home = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [selectedManagerName, setSelectedManagerName] = useState<string | null>(null); // To display the selected name

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get('/managers'); // Fetch managers data
        console.log(response.data); // Log the response to inspect the structure
        setManagers(response.data); // Assuming the response is an array of managers
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, []);

  useEffect(() => {
    if (selectedManagerId) {
      const fetchIdentities = async () => {
        try {
          const response = await api.get(`/managers/${selectedManagerId}/identities`);
          setIdentities(response.data.identities); console.log(response.data.identities); 
        } catch (error) {
          console.error('Error fetching identities:', error);
        }
      };

      fetchIdentities();
    } else {
      setIdentities([]); // Clear identities when no manager is selected
    }
  }, [selectedManagerId]);

  const handleManagerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setSelectedManagerId(selectedId);

    // Find the name of the selected manager to display
    const selectedManager = managers.find(manager => manager.id === selectedId);
    setSelectedManagerName(selectedManager ? selectedManager.fullName : null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Select a Manager</h1>

      {/* Display loading message if managers are not loaded */}
      {managers.length === 0 ? (
        <p>Loading managers...</p>
      ) : (
        <select
          className="border p-2 rounded"
          onChange={handleManagerChange}
          value={selectedManagerId || ''} // Use selectedManagerId directly as value
        >
          <option value="">Select a manager</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}> {/* Use manager.id as the value */}
              {manager.fullName}
            </option>
          ))}
        </select>
      )}
      <p>Selected Manager ID: {selectedManagerId}</p> {/* Display the ID */}
      {selectedManagerName && <p>Selected Manager Name: {selectedManagerName}</p>} {/* Display the name */}

      {/* Display manager identities after selection */}
      {selectedManagerId && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Manager's Identities: </h2>
          {identities.length > 0 ? (
            identities.map((identity) => (
              <div key={identity.id} className="mt-2">
                <p>Email: {identity.identity}</p>
                <p>Verification Status: {identity.verificationStatus}</p>
                <p>Created At: {new Date(identity.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>No identities available for this manager.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
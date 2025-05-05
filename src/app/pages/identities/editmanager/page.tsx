'use client'

import { useState, useEffect } from 'react';
import api from "@/lib/api";
import SuccessMessage from "../../../components/success";
import ErrorMessage from "../../../components/error";
import Back from "../../../components/backbutton";

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
  const [selectedManagerName, setSelectedManagerName] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIdentity, setEditedIdentity] = useState<Identity | null>(null);
  const [newIdentity, setNewIdentity] = useState<Identity>({
    id: '',
    identityType: '',
    identity: '',
    verificationStatus: '', // Add this for verification status
    createdAt: '',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get('/managers');
        setManagers(response.data);
      } catch (error) {
        setErrorMessage('Error fetching managers.');
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, []);

  useEffect(() => {
    if (selectedManagerId) {
      const fetchIdentities = async () => {
        try {
          const response = await api.get(`/managers/${selectedManagerId}/identities?managerId=${selectedManagerId}`);
          setIdentities(response.data.identities);
        } catch (error) {
          setErrorMessage('Error fetching identities.');
          console.error('Error fetching identities:', error);
        }
      };

      fetchIdentities();
    } else {
      setIdentities([]);
    }
  }, [selectedManagerId]);

  const handleManagerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setSelectedManagerId(selectedId);
    const selectedManager = managers.find(manager => manager.id === selectedId);
    setSelectedManagerName(selectedManager ? selectedManager.fullName : null);
  };

  const handleDeleteIdentity = async (identityId: string) => {
    if (!showConfirmDelete) return;
    try {
      await api.delete(`/managers/${selectedManagerId}/identities/${identityId}`);
      setIdentities(identities.filter(identity => identity.id !== identityId));
      setSuccessMessage('Identity deleted successfully.');
      setShowConfirmDelete(null);
    } catch (error) {
      setErrorMessage('Error deleting identity.');
      console.error('Error deleting identity:', error);
    }
  };

  const handleEditIdentity = (identity: Identity) => {
    if (identity.verificationStatus === 'verified') {
      setErrorMessage('Verified identities cannot be edited.');
      return; // Prevent editing for verified identities
    }
    setIsEditing(true);
    setEditedIdentity(identity);
    setNewIdentity({
      ...identity,
      identity: identity.identity,
      identityType: identity.identityType,
      verificationStatus: identity.verificationStatus, // Ensure it includes verification status
    });
  };

  const handleSaveEdit = async () => {
    if (!editedIdentity || !selectedManagerId) return;
    try {
      const updatedIdentity = { ...editedIdentity, ...newIdentity };
      const response = await api.patch(
        `/managers/${selectedManagerId}/identities/${editedIdentity.id}`,
        updatedIdentity
      );
      setIdentities(
        identities.map((identity) =>
          identity.id === editedIdentity.id ? response.data : identity
        )
      );
      setSuccessMessage('Identity updated successfully.');
      setIsEditing(false);
      setEditedIdentity(null);
    } catch (error) {
      setErrorMessage('Error saving identity.');
      console.error('Error saving identity:', error);
    }
  };

  const handleCreateIdentity = async () => {
    if (!selectedManagerId || !newIdentity.identity || !newIdentity.identityType || !newIdentity.verificationStatus) {
      setErrorMessage('All fields are required.');
      return;
    }
    try {
      const newIdentityData = { ...newIdentity, createdAt: new Date().toISOString() };
      const response = await api.post(`/managers/${selectedManagerId}/identities`, newIdentityData);
      setIdentities([...identities, response.data]);
      setSuccessMessage('Identity created successfully.');
      setNewIdentity({
        id: '',
        identityType: '',
        identity: '',
        verificationStatus: '', // Reset verification status after creation
        createdAt: '',
      });
    } catch (error) {
      setErrorMessage('Error creating identity.');
      console.error('Error creating identity:', error);
    }
  };

  return (
    <div className='relative'>
      <Back />

      <div className=" container mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
        {successMessage && <SuccessMessage message={successMessage} />}
        {errorMessage && <ErrorMessage message={errorMessage} />}

        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Select a Manager</h1>

        {managers.length === 0 ? (
          <p className="text-gray-500">Loading managers...</p>
        ) : (
          <select
            className="border border-gray-300 p-3 rounded-lg w-full mb-4 bg-white"
            onChange={handleManagerChange}
            value={selectedManagerId || ''}
          >
            <option value="">Select a manager</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.fullName}
              </option>
            ))}
          </select>
        )}

        {selectedManagerName && <p className="text-xl font-medium text-gray-700">Selected Manager: {selectedManagerName}</p>}

        {selectedManagerId && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Manager's Identities:</h2>
            {identities.length > 0 ? (
              identities.map((identity) => (
                <div key={identity.id} className="mt-4 p-6 border rounded-xl shadow-sm bg-white">
                  <p className="text-lg font-semibold text-gray-700">Email: {identity.identity}</p>
                  <p className="text-md text-gray-600">Identity Type: {identity.identityType}</p>
                  <p className="text-md text-gray-600">Verification Status: {identity.verificationStatus}</p>
                  <p className="text-sm text-gray-500">Created At: {new Date(identity.createdAt).toLocaleDateString()}</p>
                  <div className="mt-4 flex items-center space-x-4">
                    <button
                      className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                      onClick={() => handleEditIdentity(identity)}
                      disabled={identity.verificationStatus === 'verified'}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                      onClick={() => setShowConfirmDelete(identity.id)}
                    >
                      Delete
                    </button>
                  </div>
                  {showConfirmDelete === identity.id && (
                    <div className="mt-4 flex items-center space-x-4">
                      <button
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
                        onClick={() => handleDeleteIdentity(identity.id)}
                      >
                        Confirm Delete
                      </button>
                      <button
                        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
                        onClick={() => setShowConfirmDelete(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No identities available for this manager.</p>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create a New Identity</h2>
            <input
              type="text"
              className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
              placeholder="Enter Identity (Email or Domain)"
              value={newIdentity.identity}
              onChange={(e) => setNewIdentity({ ...newIdentity, identity: e.target.value })}
            />
            <input
              type="text"
              className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
              placeholder="Identity Type"
              value={newIdentity.identityType}
              onChange={(e) =>
                setNewIdentity({ ...newIdentity, identityType: e.target.value })
              }
            />
            <select
              className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
              value={newIdentity.verificationStatus}
              onChange={(e) =>
                setNewIdentity({ ...newIdentity, verificationStatus: e.target.value })
              }
            >
              <option value="">Select Verification Status</option>
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
            </select>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full mt-4 hover:bg-blue-600 transition duration-300"
              onClick={handleCreateIdentity}
            >
              Create Identity
            </button>
          </div>
        )}

        {isEditing && editedIdentity && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Identity</h2>
            <input
              type="text"
              className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
              value={newIdentity.identity}
              onChange={(e) => setNewIdentity({ ...newIdentity, identity: e.target.value })}
              disabled={editedIdentity.verificationStatus === 'verified'}
            />
            <input
              type="text"
              className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
              value={newIdentity.identityType}
              onChange={(e) =>
                setNewIdentity({ ...newIdentity, identityType: e.target.value })
              }
              disabled={editedIdentity.verificationStatus === 'verified'}
            />
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
              onClick={handleSaveEdit}
            >
              Save Changes
            </button>
            <button
              className="bg-gray-500 text-white py-2 px-4 rounded-lg ml-4 hover:bg-gray-600 transition duration-300"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div></div>
  );
};

export default Home;

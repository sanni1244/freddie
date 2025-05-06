'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { Identity } from '@/types';

interface CreateIdentityProps {
  managerId: string;
  onIdentityCreated: (newIdentity: Identity) => void;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const CreateIdentity: React.FC<CreateIdentityProps> = ({
  managerId,
  onIdentityCreated,
  setSuccessMessage,
  setErrorMessage,
}) => {
  const [newIdentity, setNewIdentity] = useState<Omit<Identity, 'id' | 'createdAt'>>({
    identityType: '',
    identity: '',
    verificationStatus: '',
  });

  const handleCreate = async () => {
    if (!managerId || !newIdentity.identity || !newIdentity.identityType || !newIdentity.verificationStatus) {
      setErrorMessage('All fields are required.');
      return;
    }
    try {
      const newIdentityData = { ...newIdentity, createdAt: new Date().toISOString() };
      const response = await api.post(`/managers/${managerId}/identities`, newIdentityData);
      onIdentityCreated(response.data);
      setSuccessMessage('Identity created successfully.');
      setNewIdentity({
        identityType: '',
        identity: '',
        verificationStatus: '',
      });
    } catch (error) {
      setErrorMessage('Error creating identity.');
      console.error('Error creating identity:', error);
    }
  };

  return (
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
        onChange={(e) => setNewIdentity({ ...newIdentity, identityType: e.target.value })}
      />
      <select
        className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
        value={newIdentity.verificationStatus}
        onChange={(e) => setNewIdentity({ ...newIdentity, verificationStatus: e.target.value })}
      >
        <option value="">Select Verification Status</option>
        <option value="unverified">Unverified</option>
        <option value="verified">Verified</option>
      </select>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full mt-4 hover:bg-blue-600 transition duration-300"
        onClick={handleCreate}
      >
        Create Identity
      </button>
    </div>
  );
};

export default CreateIdentity;
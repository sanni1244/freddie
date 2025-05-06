'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Identity } from '@/types';

interface EditIdentityProps {
  managerId: string;
  identity: Identity;
  onIdentityUpdated: (updatedIdentities: Identity[]) => void;
  onCancel: () => void;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const EditIdentity: React.FC<EditIdentityProps> = ({
  managerId,
  identity,
  onIdentityUpdated,
  onCancel,
  setSuccessMessage,
  setErrorMessage,
}) => {
  const [editedIdentity, setEditedIdentity] = useState<Omit<Identity, 'createdAt'>>(identity);

  useEffect(() => {
    setEditedIdentity(identity);
  }, [identity]);

  const handleSave = async () => {
    try {
      const response = await api.patch(
        `/managers/${managerId}/identities/${editedIdentity.id}`,
        editedIdentity
      );
      onIdentityUpdated([response.data]); // Assuming the API returns the updated identity
      setSuccessMessage('Identity updated successfully.');
      onCancel();
    } catch (error) {
      setErrorMessage('Error saving identity.');
      console.error('Error saving identity:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedIdentity((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Identity</h2>
      <input
        type="text"
        className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
        value={editedIdentity.identity}
        name="identity"
        onChange={handleChange}
        disabled={identity.verificationStatus === 'verified'}
      />
      <input
        type="text"
        className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
        value={editedIdentity.identityType}
        name="identityType"
        onChange={handleChange}
        disabled={identity.verificationStatus === 'verified'}
      />
      <select
        className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
        value={editedIdentity.verificationStatus}
        name="verificationStatus"
        onChange={handleChange}
        disabled={identity.verificationStatus === 'verified'}
      >
        <option value="unverified">Unverified</option>
        <option value="verified">Verified</option>
      </select>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
        onClick={handleSave}
      >
        Save Changes
      </button>
      <button
        className="bg-gray-500 text-white py-2 px-4 rounded-lg ml-4 hover:bg-gray-600 transition duration-300"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};

export default EditIdentity;
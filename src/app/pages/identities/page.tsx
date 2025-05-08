'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import SuccessMessage from '../../components/success';
import ErrorMessage from '../../components/error';
import DisplayManagerIdentities from '../../components/display/displayidentites';
import CreateIdentity from '../../components/create/createidentities';
import EditIdentity from '../../components/edit/editidentities';
import { Identity, Manager } from '@/types';
import BackButton from '../../components/backbutton';

const IdentityPage = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [selectedManagerName, setSelectedManagerName] = useState<string | null>(null);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIdentity, setEditedIdentity] = useState<Identity | null>(null);

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
    const fetchIdentities = async () => {
      if (selectedManagerId) {
        try {
          const response = await api.get(`/managers/${selectedManagerId}/identities?managerId=${selectedManagerId}`);
          setIdentities(response.data.identities);
        } catch (error) {
          setErrorMessage('Error fetching identities.');
          console.error('Error fetching identities:', error);
        }
      } else {
        setIdentities([]);
      }
    };

    fetchIdentities();
  }, [selectedManagerId]);

  const handleManagerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setSelectedManagerId(selectedId);
    const selectedManager = managers.find((manager) => manager.id === selectedId);
    setSelectedManagerName(selectedManager ? selectedManager.fullName : null);
  };

  const handleIdentityUpdated = (updatedIdentities: Identity[]) => {
    setIdentities(updatedIdentities);
  };

  const handleIdentityCreated = (newIdentity: Identity) => {
    setIdentities((prevIdentities) => [...prevIdentities, newIdentity]);
  };

  const handleEdit = (identity: Identity) => {
    setIsEditing(true);
    setEditedIdentity(identity);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedIdentity(null);
  };

  return (
    <div className="relative">
      <BackButton />
      <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
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

        {selectedManagerName && (
          <p className="text-xl font-medium text-gray-700">Selected Manager: {selectedManagerName}</p>
        )}

        {selectedManagerId && (
          <DisplayManagerIdentities
            managerId={selectedManagerId}
            identities={identities}
            onIdentityDeleted={(id) => setIdentities((prev) => prev.filter((i) => i.id !== id))}
            onEdit={handleEdit}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        )}

        {!isEditing && selectedManagerId && (
          <CreateIdentity
            managerId={selectedManagerId}
            onIdentityCreated={handleIdentityCreated}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        )}

        {isEditing && editedIdentity && selectedManagerId && (
          <EditIdentity
            managerId={selectedManagerId}
            identity={editedIdentity}
            onIdentityUpdated={handleIdentityUpdated}
            onCancel={handleCancelEdit}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        )}
      </div>
    </div>
  );
};

export default IdentityPage;
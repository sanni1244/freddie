'use client';
import React, { useState, useEffect } from 'react';
import { Managerdetails } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import DisplayManagers from '../../components/display/displaymanagers';
import CreateManager from '../../components/create/createmanager';
import EditManager from '../../components/edit/editmanager';
import SuccessMessage from '@/app/components/success';
import ErrorMessage from '@/app/components/error';
import api from '@/lib/api';

const ManagersPage = () => {
  const [managers, setManagers] = useState<Managerdetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editManager, setEditManager] = useState<Managerdetails | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchManagers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/managers');
      setManagers(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch managers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleCreateManager = (newManager: Managerdetails) => {
    setManagers((prevManagers) => [...prevManagers, newManager]);
    setMessage('Manager created!');
    setOpen(false);
    fetchManagers();
  };

  const handleUpdateManager = (updatedManager: Managerdetails) => {
    setManagers((prevManagers) =>
      prevManagers.map((m) => (m.id === updatedManager.id ? updatedManager : m))
    );
    setMessage('Manager updated!');
    setEditManager(null);
    fetchManagers();
  };

  const handleDeleteManager = (managerId: string) => {
    setManagers((prevManagers) => prevManagers.filter((m) => m.id !== managerId));
    setMessage('Manager deleted!');
    fetchManagers();
  };

  const handleEdit = (manager: Managerdetails) => {
    setEditManager(manager);
  };

  const handleCancelEdit = () => {
    setEditManager(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-center ">
        Managers
      </h1>

      {message && (
        <div className="mb-4">
          <div>
            <SuccessMessage message={message} />
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <div  onClick={() => setOpen(true)}>
          <button >➕ Add Manager</button>
        </div>
        {open && (
          <div>
             <div>
              <div>Create New Manager</div>
              <div>
                Fill out the form below to create a new manager.
              </div>
            </div>
            <CreateManager
              onManagerCreated={handleCreateManager}
              setLoading={setLoading}
              setMessage={setMessage}
            />
            <div >
              <button  onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-center  mt-10">Loading managers...</p>
      ) : error ? (
        <div>
          <div>
             <ErrorMessage message={error} />
          </div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {editManager && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <EditManager
                  manager={editManager}
                  onManagerUpdated={handleUpdateManager}
                  onCancel={handleCancelEdit}
                  setLoading={setLoading}
                  setMessage={setMessage}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!editManager && (
            <DisplayManagers
              managers={managers}
              onEdit={handleEdit}
              onDelete={handleDeleteManager}
              setLoading={setLoading}
              setMessage={setMessage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ManagersPage;


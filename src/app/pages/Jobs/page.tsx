'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DisplayJobs from '../../components/display/displayjobs';
import CreateJob from '../../components/create/createjobs';
import EditJob from '../../components/edit/editjobs';
import { Manager, Job } from '@/types';
import BackButton from '@/app/components/backbutton';

const JobsPage = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get('/managers');
        setManagers(response.data);
      } catch (error) {
        console.error('Error fetching managers:', error);
        setMessage('Failed to load managers.');
      }
    };
    fetchManagers();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!selectedManagerId) {
        setJobs([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/jobs?managerId=${selectedManagerId}`);
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setMessage('Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [selectedManagerId]);

  const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedManagerId(e.target.value);
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs((prevJobs) => [...prevJobs, newJob]);
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs((prevJobs) => prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
  };

  const handleEdit = (job: Job) => {
    setIsEditing(true);
    setEditedJob(job);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedJob(null);
  };

  const handleJobDeleted = (jobId: string) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
  };

  return (
    <div className="relative p-6 max-w-7xl mx-auto bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <BackButton />
      <h1 className="text-3xl font-extrabold mb-8 text-blue-900 drop-shadow-md">📋 Manage Jobs</h1>
      {message && (
        <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-300 p-3 rounded-md shadow-sm">
          {message}
        </div>
      )}
      <div className="mb-8">
        <label className="block mb-2 text-sm font-semibold text-gray-700">Select Manager</label>
        <select
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          onChange={handleManagerChange}
          value={selectedManagerId || ''}
        >
          <option value="">Select Manager</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.fullName}
            </option>
          ))}
        </select>
      </div>
      {loading && <p className="text-blue-600 font-medium animate-pulse">Loading...</p>}

      {selectedManagerId && (
        <DisplayJobs
          jobs={jobs}
          onEdit={handleEdit}
          onDelete={handleJobDeleted}
          setLoading={setLoading}
          setMessage={setMessage}
          selectedManagerId={selectedManagerId}
        />
      )}

      {selectedManagerId && !isEditing && (
        <CreateJob
          onJobCreated={handleJobCreated}
          setLoading={setLoading}
          setMessage={setMessage}
          selectedManagerId={selectedManagerId}
        />
      )}

      {isEditing && editedJob && selectedManagerId && (
        <EditJob
          job={editedJob}
          onJobUpdated={handleJobUpdated}
          onCancel={handleCancelEdit}
          setLoading={setLoading}
          setMessage={setMessage}
          selectedManagerId={selectedManagerId}
        />
      )}
    </div>
  );
};

export default JobsPage;
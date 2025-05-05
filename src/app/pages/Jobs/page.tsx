'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Manager {
    id: string;
    fullName: string;
}

interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    roles: string[];
    country: string;
    state: string;
    city: string;
    workMode: string;
    whyJoinUs: string;
    status: string;
    applicantCount: number;
    createdAt: string;
}

const JobsPage = () => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedJob, setEditedJob] = useState<Job | null>(null);
    const [newJob, setNewJob] = useState<Partial<Job>>({
        title: '',
        description: '',
        requirements: [],
        roles: [],
        country: '',
        state: '',
        city: '',
        workMode: '',
        whyJoinUs: '',
        status: 'active'
    });
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
            if (!selectedManagerId) return;
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

    const isValidJob = (job: Partial<Job>) => {
        const requiredFields = [
            job.title?.trim(),
            job.description?.trim(),
            job.country?.trim(),
            job.state?.trim(),
            job.city?.trim(),
            job.workMode?.trim()
        ];
        return requiredFields.every(Boolean);
    };

    const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedManagerId(e.target.value);
    };

    const handleCreateJob = async () => {
        if (!selectedManagerId) {
            setMessage('Please select a manager.');
            return;
        }
        if (!isValidJob(newJob)) {
            setMessage('Please fill in all required fields.');
            return;
        }
    
        const payload = {
            ...newJob,
            title: newJob.title?.trim(),
            description: newJob.description?.trim(),
            country: newJob.country?.trim(),
            state: newJob.state?.trim(),
            city: newJob.city?.trim(),
            workMode: newJob.workMode?.trim(),
            requirements: newJob.requirements?.map(r => r.trim()).filter(Boolean) || [],
            roles: newJob.roles?.map(r => r.trim()).filter(Boolean) || [],
            managerId: selectedManagerId
        };
    
        setLoading(true);
        try {
            const response = await api.post('/jobs', payload);
            setJobs([...jobs, response.data]);
            setNewJob({
                title: '',
                description: '',
                requirements: [],
                roles: [],
                country: '',
                state: '',
                city: '',
                workMode: '',
                whyJoinUs: '',
                status: 'active'
            });
            setMessage('Job created successfully.');
        } catch (error) {
            console.error('Error creating job:', error);
            setMessage('Failed to create job.');
        } finally {
            setLoading(false);
        }
    };
    

    const handleEditJob = (job: Job) => {
        setIsEditing(true);
        setEditedJob(job);
        setNewJob({ ...job });
    };

    const handleSaveEdit = async () => {
        if (!editedJob || !isValidJob(newJob)) {
            setMessage('Please fill in all required fields.');
            return;
        }

        const payload = {
            ...newJob,
            title: newJob.title?.trim(),
            description: newJob.description?.trim(),
            country: newJob.country?.trim(),
            state: newJob.state?.trim(),
            city: newJob.city?.trim(),
            workMode: newJob.workMode?.trim(),
            requirements: newJob.requirements?.map(r => r.trim()).filter(Boolean) || [],
            roles: newJob.roles?.map(r => r.trim()).filter(Boolean) || []
        };

        setLoading(true);
        try {
            const response = await api.patch(`/jobs/${editedJob.id}?managerId=${selectedManagerId}`, payload);
            setJobs(jobs.map(j => (j.id === editedJob.id ? response.data : j)));
            setIsEditing(false);
            setEditedJob(null);
            setNewJob({});
            setMessage('Job updated successfully.');
        } catch (error) {
            console.error('Error updating job:', error);
            setMessage('Failed to update job.');
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteJob = async (jobId: string) => {
        if (!selectedManagerId) {
            setMessage('Please select a manager first.');
            return;
        }

        setLoading(true);
        try {
            // Correct URL structure with jobId and managerId in the query params
            const response = await api.delete(`/jobs/${jobId}?managerId=${selectedManagerId}`);
            setJobs(jobs.filter(j => j.id !== jobId));
            setMessage('Job deleted.');
        } catch (error) {
            console.error('Error deleting job:', error);
            setMessage('Failed to delete job.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-6 max-w-7xl mx-auto bg-gradient-to-b from-white to-blue-50 min-h-screen">
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
                    {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                            {manager.fullName}
                        </option>
                    ))}
                </select>
            </div>

            {loading && <p className="text-blue-600 font-medium animate-pulse">Loading...</p>}

            <div className="grid gap-6">
                {jobs.map(job => (
                    <div key={job.id} className="border border-gray-200 p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-all">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-blue-800">{job.title}</h2>
                            <div className="flex gap-3">
                                <button onClick={() => handleEditJob(job)} className="text-blue-600 font-medium hover:underline">
                                    ✏️ Edit
                                </button>
                                <button onClick={() => handleDeleteJob(job.id)} className="text-red-600 font-medium hover:underline">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-700 mt-2">{job.description}</p>
                        <div className="text-sm text-gray-500 mt-3 space-y-1">
                            <p>📍 {job.city}, {job.state}, {job.country}</p>
                            <p>🧭 {job.workMode}</p>
                            <p>📈 {job.applicantCount} Applicants</p>
                            <p>🕒 Job created {Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))} day(s) ago</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-semibold text-blue-900 mb-6">{isEditing ? '✏️ Edit Job' : '➕ Create New Job'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input
                        className="border border-gray-300 p-3 rounded-lg shadow-sm"
                        placeholder="Title"
                        value={newJob.title || ''}
                        onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                    />
                    <select
                        className="border border-gray-300 p-3 rounded-lg shadow-sm"
                        value={newJob.workMode || ''}
                        onChange={e => setNewJob({ ...newJob, workMode: e.target.value })}
                    >
                        <option value="">Select Work Mode</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="remote">Remote</option>
                        <option value="on site">On Site</option>
                    </select>

                    <textarea
                        className="border border-gray-300 p-3 rounded-lg shadow-sm md:col-span-2"
                        placeholder="Description"
                        value={newJob.description || ''}
                        onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg shadow-sm"
                        placeholder="Requirements (comma separated)"
                        value={newJob.requirements?.join(', ') || ''}
                        onChange={e => setNewJob({ ...newJob, requirements: e.target.value.split(',').map(r => r.trim()) })}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg shadow-sm"
                        placeholder="Roles (comma separated)"
                        value={newJob.roles?.join(', ') || ''}
                        onChange={e => setNewJob({ ...newJob, roles: e.target.value.split(',').map(r => r.trim()) })}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg shadow-sm"
                        placeholder="Country"
                        value={newJob.country || ''}
                        onChange={e => setNewJob({ ...newJob, country: e.target.value })}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg shadow-sm"
                        placeholder="State"
                        value={newJob.state || ''}
                        onChange={e => setNewJob({ ...newJob, state: e.target.value })}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg shadow-sm"
                        placeholder="City"
                        value={newJob.city || ''}
                        onChange={e => setNewJob({ ...newJob, city: e.target.value })}
                    />
                    <textarea
                        className="border border-gray-300 p-3 rounded-lg shadow-sm md:col-span-2"
                        placeholder="Why Join Us"
                        value={newJob.whyJoinUs || ''}
                        onChange={e => setNewJob({ ...newJob, whyJoinUs: e.target.value })}
                    />
                </div>

                <div className="mt-6 flex items-center gap-4">
                    {isEditing ? (
                        <>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md"
                                onClick={handleSaveEdit}
                                disabled={loading}
                            >
                                💾 Save Changes
                            </button>
                            <button
                                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg shadow-md"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedJob(null);
                                    setNewJob({});
                                    setMessage(null);
                                }}
                            >
                                ❌ Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md"
                            onClick={handleCreateJob}
                            disabled={loading}
                        >
                            ✅ Create Job
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobsPage;

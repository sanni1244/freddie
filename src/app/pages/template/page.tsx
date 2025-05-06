'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Manager {
    id: string;
    fullName: string;
}

interface Template {
    id: string;
    title: string;
    formType: string;
    groups: string[];
    fields: string[];
}

const JobsPage = () => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTemplate, setEditedTemplate] = useState<Template | null>(null);
    const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
        title: '',
        formType: '',
        groups: [],
        fields: [],
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await api.get('/managers');
                setManagers(response.data);
                console.log(response.data)
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
                setTemplates(response.data);
                console.log(response.data)
                console.log(response.data)

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

    const handleCreateTemplate = async () => {
        if (!selectedManagerId) {
            setMessage('Please select a manager.');
            return;
        }

        const payload = {
            ...newTemplate,
            title: newTemplate.title?.trim(),
            formType: newTemplate.formType?.trim(),
            groups: newTemplate.groups,
            fields: newTemplate.fields,
        };

        setLoading(true);
        try {
            const response = await api.post(`/jobs?managerId=${selectedManagerId}`, payload);
            setTemplates([...templates, response.data]);
            setNewTemplate({
                title: '',
                formType: '',
                groups: [],
                fields: [],
            });
            setMessage('Job created successfully.');
        } catch (error) {
            console.error('Error creating job:', error);
            setMessage('Failed to create job.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditJob = (template: Template) => {
        setIsEditing(true);
        setEditedTemplate(template);
        setNewTemplate({ ...template });
    };

    const handleSaveEdit = async () => {
        if (!editedTemplate) return;

        const payload = {
            ...newTemplate,
            title: newTemplate.title?.trim(),
            formType: newTemplate.formType?.trim(),
            groups: newTemplate.groups,
            fields: newTemplate.fields,
        };

        setLoading(true);
        try {
            const response = await api.patch(`/form-templates/${editedTemplate.id}?managerId=${selectedManagerId}`, payload);
            setTemplates(templates.map(t => (t.id === editedTemplate.id ? response.data : t)));
            setIsEditing(false);
            setEditedTemplate(null);
            setNewTemplate({});
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
            await api.delete(`/jobs/${jobId}?managerId=${selectedManagerId}`);
            setTemplates(templates.filter(j => j.id !== jobId));
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
            <h1 className="text-3xl font-extrabold mb-8 text-blue-900 drop-shadow-md">📋 Manage Templates</h1>

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
                {templates.map(temp => (
                    <div key={temp.id} className="border border-gray-200 p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-all">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-blue-800">{temp.title}</h2>
                            <div className="flex gap-3">
                                <button onClick={() => handleEditJob(temp)} className="text-blue-600 font-medium hover:underline">
                                    ✏️ Edit
                                </button>
                                <button onClick={() => handleDeleteJob(temp.id)} className="text-red-600 font-medium hover:underline">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-700 mt-2">{temp.formType}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-semibold text-blue-900 mb-6">{isEditing ? '✏️ Edit Template' : '➕ Create New Template'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input
                        className="border border-gray-300 p-3 rounded-lg shadow-sm"
                        placeholder="Title"
                        value={newTemplate.title || ''}
                        onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg shadow-sm"
                        placeholder="Form Type"
                        value={newTemplate.formType || ''}
                        onChange={e => setNewTemplate({ ...newTemplate, formType: e.target.value })}
                    />
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md"
                        onClick={isEditing ? handleSaveEdit : handleCreateTemplate}
                        disabled={loading}
                    >
                        {isEditing ? '💾 Save Changes' : '✅ Create Job'}
                    </button>
                    {isEditing && (
                        <button
                            className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg shadow-md"
                            onClick={() => {
                                setIsEditing(false);
                                setEditedTemplate(null);
                                setNewTemplate({});
                                setMessage(null);
                            }}
                        >
                            ❌ Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobsPage;

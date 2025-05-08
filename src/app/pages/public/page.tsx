'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormTemplate } from '@/types';
import api from '@/lib/api';

interface CreateFormProps {
    onResponseCreated: () => void;
    formId: string;
    managerId: string | null;
}

const CreateFormResponse: React.FC<CreateFormProps> = ({ onResponseCreated, formId, managerId }) => {
    const handleCreate = () => {
        console.log('Creating new response for form:', formId, 'and manager:', managerId);
        onResponseCreated();
    };

    return (
        <div>
            <button
                onClick={handleCreate}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Create Response
            </button>
        </div>
    );
};

interface DeleteFormResponseProps {
    applicantId: string;
    onResponseDeleted: () => void;
    formId: string;
}

const DeleteFormResponse: React.FC<DeleteFormResponseProps> = ({ applicantId, onResponseDeleted, formId }) => {
    const handleDelete = async () => {
        try {
            const response = await api.delete(`/forms-responses/${formId}/${applicantId}`);
            if (response.status === 204) {
                onResponseDeleted();
            }
        } catch (error) {
            console.error('Error deleting response:', error);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
        >
            Delete
        </button>
    );
};

interface Manager {
    id: string;
    fullName: string;
}

interface Job {
    id: string;
    title: string;
}

interface Form {
    id: string;
    title: string;
}

interface Response {
    label: string;
    value: any;
    fileUrl: string;
    fieldId: string;
    createdAt: string;
}

interface FormResponse {
    id: string;
    token: string;
    createdAt: string;
    isActive: boolean;
    responses: Response[];
}

interface ApiResponse {
    data: FormResponse[];
    total: number;
    page: number;
    limit: number;
}

const FormResponsesPage = () => {
    const router = useRouter();
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [editedTemplate, setEditedTemplate] = useState<FormTemplate | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [forms, setForms] = useState<Form[]>([]);
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
    const [responsesData, setResponsesData] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchManagers = async () => {
        try {
            const response = await api.get('/managers');
            setManagers(response.data);
        } catch (error: any) {
            setFetchError(error.message || 'Failed to load managers.');
        }
    };

    const fetchJobsByManager = async () => {
        if (!selectedManagerId) {
            setJobs([]);
            return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/jobs?managerId=${selectedManagerId}`);
            setJobs(response.data);
        } catch (error: any) {
            console.error('Error fetching jobs:', error);
            setFetchError(error.message || 'Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFormsByJobAndManager = async () => {
        if (!selectedManagerId || !selectedJobId) {
            setForms([]);
            setSelectedFormId(null);
            setResponsesData(null);
            return;
        }
        try {
            const response = await api.get(`/forms?jobId=${selectedJobId}&managerId=${selectedManagerId}`);
            setForms(response.data);
            console.log(response.data);
           if (response.data.length > 0) {
                setSelectedFormId(response.data[0].id);
            } else {
                setSelectedFormId(null);
                setResponsesData(null);
            }
        } catch (error: any) {
            setFetchError(error.message || 'Failed to load forms.');
            setForms([]);
            setSelectedFormId(null);
            setResponsesData(null);
        }
    };


    const fetchFormResponses = async () => {
        if (!selectedManagerId || !selectedFormId) {
            setResponsesData(null);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/form-links/public?formId=${selectedFormId}&managerId=${selectedManagerId}`);
            if (response && response.data) {
                console.log(response.data)
                setResponsesData(response.data);
            } else {
                setResponsesData(null);
            }
        } catch (error: any) {
            setError(error.message || 'Failed to fetch form responses');
        } finally {
            setLoading(false);
        }
    };


    // /forms-responses/${selectedFormId}?managerId=${selectedManagerId}                                          &limit=20&page=1`);
    // /forms-responses/w32435                                          ?managerId=a1e2d3c4-b5a6-7d8e-9f0a-1b2c3d4e5f6g&limit=20&page=1
    // /forms-responses/w32435?managerId=a1e2d3c4-b5a6-7d8e-9f0a-1b2c3d4e5f6g


    useEffect(() => {
        fetchManagers();
    }, []);

    useEffect(() => {
        fetchJobsByManager();
    }, [selectedManagerId]);

    useEffect(() => {
        fetchFormsByJobAndManager();
    }, [selectedManagerId, selectedJobId]);

    useEffect(() => {
        fetchFormResponses();
    }, [selectedManagerId, selectedFormId]);

    const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedManagerId(e.target.value);
    };

    const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newJobId = e.target.value;
        setSelectedJobId(newJobId);
        setTemplates([]);
        setSelectedTemplate(null);
        setIsEditing(false);
        setEditedTemplate(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFormId = e.target.value;
        setSelectedFormId(newFormId);
        setResponsesData(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Form Responses</h2>

            {fetchError && <p className="text-red-500 mb-4">{fetchError}</p>}

            <div className="mb-4">
                <label htmlFor="managerSelect" className="block text-gray-700 text-sm font-bold mb-2">
                    Select Manager:
                </label>
                <select
                    id="managerSelect"
                    onChange={handleManagerChange}
                    value={selectedManagerId || ''}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value="">Select a Manager</option>
                    {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                            {manager.fullName}
                        </option>
                    ))}
                </select>
            </div>

            {selectedManagerId && (
                <div className="mb-4">
                    <label htmlFor="jobSelect" className="block text-gray-700 text-sm font-bold mb-2">
                        Select Job:
                    </label>
                    <select
                        id="jobSelect"
                        onChange={handleJobChange}
                        value={selectedJobId || ''}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={jobs.length === 0}
                    >
                        <option value="">Select a Job</option>
                        {jobs.map((job) => (
                            <option key={job.id} value={job.id}>
                                {job.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedJobId && (
                <div className="mb-4">
                    <label htmlFor="formSelect" className="block text-gray-700 text-sm font-bold mb-2">
                        Select Form:
                    </label>
                    <select
                        id="formSelect"
                        onChange={handleFormChange}
                        value={selectedFormId || ''}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={forms.length === 0}
                    >
                        <option value="">Select a Form</option>
                        {forms.map((form) => (
                            <option key={form.id} value={form.id}>
                                {form.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <p className="text-blue-500 italic">Loading form responses...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : responsesData && responsesData.data && responsesData.data.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Created At:
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Token:
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Active:
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {responsesData.data.map((response) => (
                                <tr key={response.id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {new Date(response.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="mb-2">
                                            <p className="font-semibold">{response.token}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-500 text-xs">{response.isActive ? "Active User" : "Offline"}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : selectedManagerId && selectedFormId && !loading && !error ? (
                <p className="text-gray-600">No responses found for the selected manager and form.</p>
            ) : selectedManagerId && !fetchError ? (
                <p className="text-gray-600">Please select a form to view responses.</p>
            ) : (
                <p className="text-gray-600">Please select a manager to view forms.</p>
            )}
        </div>
    );
};

export default FormResponsesPage;
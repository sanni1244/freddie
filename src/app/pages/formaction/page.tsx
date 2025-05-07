'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import CreateTemplate from '../../components/create/createaction';
import EditTemplate from '../../components/edit/editaction';
import DisplayFormTemplates from '../../components/display/displayaction'; // Import the new component
import { Manager, FormTemplate, Job } from '@/types'; // Import Job type

const FormTemplatesPage = () => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTemplate, setEditedTemplate] = useState<FormTemplate | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]); // State for jobs

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await api.get('/managers');
                setManagers(response.data);
            } catch (error: any) {
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
            setMessage(null);
            try {
                const response = await api.get(`/jobs?managerId=${selectedManagerId}`);
                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
                }
                const data: Job[] = response.data;
                setJobs(data);
            } catch (error: any) {
                console.error('Error fetching jobs:', error);
                setMessage( 'Failed to load jobs.');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [selectedManagerId]);

    useEffect(() => {
        const fetchTemplates = async () => {
            if (!jobId || !selectedManagerId) {
                return; // Don't fetch if jobId or selectedManagerId is missing
            }
            setLoading(true);
            setMessage(null);
            try {
                const response = await api.get(`/form-templates?jobId=${jobId}&managerId=${selectedManagerId}`);
                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
                }
                const data: FormTemplate[] = response.data;
                setTemplates(data);
            } catch (error: any) {
                console.error('Error fetching form templates:', error);
                setMessage('Failed to load form templates.');
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, [selectedManagerId, jobId]); //  Now depends on both

    const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedManagerId(e.target.value);
        setJobId(null); // Reset jobId when manager changes
    };

    const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setJobId(e.target.value);
    };


    const handleTemplateCreated = (newTemplate: FormTemplate) => {
        setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
    };

    const handleTemplateUpdated = (updatedTemplate: FormTemplate) => {
        setTemplates((prevTemplates) =>
            prevTemplates.map((template) => (template.id === updatedTemplate.id ? updatedTemplate : template))
        );
    };

    const handleEdit = (template: FormTemplate) => {
        setIsEditing(true);
        setEditedTemplate(template);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedTemplate(null);
    };

    // const handleTemplateDeleted = async (templateId: string) => {
    //     setLoading(true);
    //     setMessage(null);
    //     try {
    //         // Use your api.delete method with the correct path
    //         await api.delete(`/form-templates/${templateId}`);
    //         setMessage('Template deleted successfully.');
    //         // Refetch the templates for the currently selected manager
    //         if (selectedManagerId && jobId) {
    //             const response = await api.get(`/form-templates?jobId=${jobId}&managerId=${selectedManagerId}`);
    //             if (response.status !== 200) {
    //                 throw new Error(`HTTP error! status: ${response.status}`);
    //             }
    //             const data: FormTemplate[] = await response.json();
    //             setTemplates(data);
    //         }
    //     } catch (error: any) {
    //         console.error('Error deleting form template:', error);
    //         setMessage(error.message || 'Failed to delete form template.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gradient-to-b from-white to-blue-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-8 text-blue-900 drop-shadow-md">📄 Manage Form Templates</h1>
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

            {selectedManagerId && (
                <div className="mb-8">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Select Job</label>
                    <select
                        className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        onChange={handleJobChange}
                        value={jobId || ''}
                        disabled={!selectedManagerId} // Disable if no manager is selected
                    >
                        <option value="">Select Job</option>
                        {jobs.map((job) => (
                            <option key={job.id} value={job.id}>
                                {job.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {loading && <p className="text-blue-600 font-medium animate-pulse">Loading...</p>}

            {/* {selectedManagerId && jobId && !isEditing && (
                <>
                    <CreateTemplate
                        onTemplateCreated={handleTemplateCreated}
                        setLoading={setLoading}
                        setMessage={setMessage}
                        selectedManagerId={selectedManagerId}
                    />
                    {templates.length > 0 ? (
                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold text-blue-900 mb-4">Existing Templates</h2>
                            <DisplayFormTemplates
                                formTemplates={templates}
                                onEdit={handleEdit}
                                onDelete={handleTemplateDeleted}
                                setLoading={setLoading}
                                setMessage={setMessage}
                                managerId={selectedManagerId}
                            />
                        </div>
                    ) : (
                        <p className="text-gray-500">No form templates to display for the selected manager and job.</p>
                    )}
                </>
            )}

            {isEditing && editedTemplate && selectedManagerId && (
                <EditTemplate
                    template={editedTemplate}
                    onTemplateUpdated={handleTemplateUpdated}
                    onCancel={handleCancelEdit}
                    setLoading={setLoading}
                    setMessage={setMessage}
                    selectedManagerId={selectedManagerId}
                />
            )} */}
        </div>
    );
};

export default FormTemplatesPage;


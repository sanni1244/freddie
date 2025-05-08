'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import CreateTemplate from '@/app/components/create/createtemplate';
import EditTemplate from '@/app/components/edit/edittemplate';
import DisplayFormTemplates from '@/app/components/display/displayaction';
import { Manager, FormTemplate } from '@/types';
import BackButton from '@/app/components/backbutton';

const FormTemplatesPage = () => {
    // Define state variables
    const [managers, setManagers] = useState<Manager[]>([]);
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTemplate, setEditedTemplate] = useState<FormTemplate | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);

    useEffect(() => {
        // Fetch managers from the API
        const fetchManagers = async () => {
            try {
                const response = await api.get('/managers');
                setManagers(response.data);
            } catch (error: any) {
                console.error('Error fetching managers:', error);
                setMessage(error.message || 'Failed to load managers.');
            }
        };
        fetchManagers();
    }, []);

    useEffect(() => {
        // Fetch form templates when selectedManagerId changes
        const urlParams = new URLSearchParams(window.location.search);
        const jobIdFromUrl = urlParams.get('jobId');
        setJobId(jobIdFromUrl);
        const fetchTemplates = async () => {
            if (!jobIdFromUrl || !selectedManagerId) {
                setTemplates([]);
                return;
            }
            setLoading(true);
            setMessage(null);
            try {
                // Fetch form templates for the selected manager
                const response = await api.get(`/form-templates?jobId=${jobIdFromUrl}&managerId=${selectedManagerId}`);
                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
                }
                const data: FormTemplate[] = response.data;
                setTemplates(data);
            } catch (error: any) {
                console.error('Error fetching form templates:', error);
                setMessage(error.message || 'Failed to load form templates.');
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, [selectedManagerId]);

    // Handle manager selection change
    const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedManagerId(e.target.value);
    };

    // Handle template creation, update, and deletion
    const handleTemplateCreated = (newTemplate: FormTemplate) => {
        setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
    };

    // Handle template update
    const handleTemplateUpdated = (updatedTemplate: FormTemplate) => {
        setTemplates((prevTemplates) =>
            prevTemplates.map((template) => (template.id === updatedTemplate.id ? updatedTemplate : template))
        );
    };

    // Handle template edit
    const handleEdit = (template: FormTemplate) => {
        setIsEditing(true);
        setEditedTemplate(template);
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedTemplate(null);
    };

    // Handle template deletion
    const handleTemplateDeleted = async (templateId: string) => {
        setLoading(true);
        setMessage(null);
        try {
            // Delete the template using the API
            const response = await api.delete(`/form-templates/${templateId}`);
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setMessage('Template deleted successfully.');
            // Refetch the templates for the currently selected manager
            if (selectedManagerId) {
                const fetchResponse = await fetch(`https://api-freddie.ai-wk.com/form-templates?managerId=${selectedManagerId}`);
                if (!fetchResponse.ok) {
                    throw new Error(`HTTP error! status: ${fetchResponse.status}`);
                }
                const data: FormTemplate[] = await fetchResponse.json();
                setTemplates(data);
            }
        } catch (error: any) {
            console.error('Error deleting form template:', error);
            setMessage(error.message || 'Failed to delete form template.');
        } finally {
            setLoading(false);
        }
    };

    // Render only when jobId is available
    if (!jobId) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold mb-8 text-blue-900 drop-shadow-md">📄 Manage Form Templates</h1>
                <p className="text-red-500">
                    Job ID is required to display form templates.  Please provide a Job ID.
                </p>
            </div>
        );
    }

    return (
        <div className="relative p-6 max-w-7xl mx-auto bg-gradient-to-b from-white to-blue-50 min-h-screen">
            <BackButton />
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
            {loading && <p className="text-blue-600 font-medium animate-pulse">Loading...</p>}

            {/* // Display form templates only if a manager is selected */}
            {selectedManagerId && !isEditing && (
                <>
                    <CreateTemplate
                        onTemplateCreated={handleTemplateCreated}
                        setLoading={setLoading}
                        setMessage={setMessage}
                        selectedManagerId={selectedManagerId}
                    />

                    {/* // Display existing templates for the selected manager */}
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
                        <p className="text-gray-500">No form templates to display for the selected manager.</p>
                    )}
                </>
            )}
{/* // Display the edit template form if isEditing is true and editedTemplate is not null */}
            {isEditing && editedTemplate && selectedManagerId && (
                <EditTemplate
                    template={editedTemplate}
                    onTemplateUpdated={handleTemplateUpdated}
                    onCancel={handleCancelEdit}
                    setLoading={setLoading}
                    setMessage={setMessage}
                    selectedManagerId={selectedManagerId}
                />
            )}
        </div>
    );
};

export default FormTemplatesPage;


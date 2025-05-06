'use client';
import React, { useEffect, useState } from 'react';
import { FormTemplate } from '@/types';
import api from '@/lib/api';

interface DisplayFormTemplatesProps {
    onEdit: (formTemplate: FormTemplate) => void;
    onDelete: (formTemplateId: string) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    jobId: string;
    managerId: string; 
}

const DisplayFormTemplates: React.FC<DisplayFormTemplatesProps> = ({ onEdit, onDelete, setLoading, jobId, managerId }) => {
    const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);

    useEffect(() => {
        if (!jobId || !managerId) {
            // setMessage('Job ID or Manager ID is missing.');
            return; 
        }

        const fetchFormTemplates = async () => {
            // setLoading(true);
            try {
                const response = await api.get(`/forms?jobId=${jobId}&managerId=${managerId}`);
                setFormTemplates(response.data);
                console.log('Fetched form templates:', response.data);
            } catch (error: any) {
                console.error('Error fetching form templates:', error);
                // setMessage(error.message || 'Failed to fetch form templates.');
            } finally {
                setLoading(false);
            }
        };

        fetchFormTemplates();
    }, [jobId, managerId, setLoading]);

    const handleDelete = async (formTemplateId: string) => {
        setLoading(true);
        try {
            const response = await api.delete(`/form-templates/${formTemplateId}`);
            if (response.status !== 200) {
                const errorData = response.data;
                throw new Error(errorData.message || 'Failed to delete form template.');
            }
            onDelete(formTemplateId);
            // setMessage('Form template deleted successfully.');
        } catch (error: any) {
            console.error('Error deleting form template:', error);
            // setMessage(error.response?.data?.message || 'Failed to delete form template.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6">
            {formTemplates.map((formTemplate) => (
                <div key={formTemplate.id} className="border border-gray-200 p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-all">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-blue-800">{formTemplate.title}</h2>
                        <div className="flex gap-3">
                            <button onClick={() => onEdit(formTemplate)} className="text-blue-600 font-medium hover:underline">
                                ✏️ Edit
                            </button>
                            <button onClick={() => handleDelete(formTemplate.id)} className="text-red-600 font-medium hover:underline">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-700 mt-2">
                        <strong>Form Type:</strong> {formTemplate.formType}
                    </p>
                    {/* Display Groups and their Fields */}
                    {formTemplate.groups && formTemplate.groups.length > 0 && (
                        <div className='mt-4'>
                            <h3 className='text-md font-semibold'>Groups: </h3>
                            {formTemplate.groups.map((group, groupIndex) => (
                                <div key={groupIndex} className='mb-4 border-l-4 border-gray-300 pl-4'>
                                    <p className='text-sm text-gray-600'>Title: {group.title}</p>
                                    <p className='text-sm text-gray-600'>Sort Order: {group.sortOrder}</p>
                                    {group.fields && group.fields.length > 0 && (
                                        <>
                                            <h4 className='text-sm font-medium'>Fields: </h4>
                                            {group.fields.map((field, fieldIndex) => (
                                                <div key={fieldIndex} className='text-xs ml-4'>
                                                    <p>
                                                        Label: {field.label},
                                                        Type: {field.type},
                                                        Required: {field.required ? 'Yes' : 'No'},
                                                        Sort Order: {field.sortOrder}
                                                    </p>
                                                    {/* Handle options as a string */}
                                                    <p className="text-xs text-gray-500">
                                                        Options: {Array.isArray(field.options) ? field.options.join(', ') : field.options || 'None'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Mapping: {field.applicantFieldMapping}</p>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Display standalone Fields (if any) */}
                    {formTemplate.fields && formTemplate.fields.length > 0 && (
                        <div className='mt-4'>
                            <h3 className='text-md font-semibold'>Fields: </h3>
                            {formTemplate.fields.map((field, fieldIndex) => (
                                <div key={fieldIndex} className='text-sm border-l-4 border-gray-300 pl-4'>
                                    <p>
                                        Label: {field.label},
                                        Type: {field.type},
                                        Required: {field.required ? 'Yes' : 'No'},
                                        Sort Order: {field.sortOrder}
                                    </p>
                                    {/* Handle options as a string */}
                                    <p className="text-xs text-gray-500">
                                        Options: {Array.isArray(field.options) ? field.options.join(', ') : field.options || 'None'}
                                    </p>
                                    <p className="text-xs text-gray-500">Mapping: {field.applicantFieldMapping}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default DisplayFormTemplates;

'use client';
import React, { useState, useCallback } from 'react';
import api from '@/lib/api';
import { Form, Field, FormGroup } from '@/types';

interface CreateFormProps {
    managerId: string;
    onFormCreated: (newForm: Form) => void;
    setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const CreateForm: React.FC<CreateFormProps> = ({
    managerId,
    onFormCreated,
    setSuccessMessage,
    setErrorMessage,
}) => {
    const [newForm, setNewForm] = useState<Omit<Form, 'id' | 'createdAt'>>({
        title: '',
        formType: 'application',
        groups: [],
        fields: [],
    });

    const handleCreate = useCallback(async () => {
        if (!managerId || !newForm.title) {
            setErrorMessage('Title is required.');
            return;
        }

        const payload: Omit<Form, 'id' | 'createdAt'> = {
            title: newForm.title,
            formType: newForm.formType,
            groups: newForm.groups || [],
            fields: newForm.fields || [],
        };

        try {
            const response = await api.post(`/managers/${managerId}/forms`, payload);
            onFormCreated(response.data);
            setSuccessMessage('Form created successfully.');
            setNewForm({
                title: '',
                formType: 'application',
                groups: [],
                fields: [],
            });
        } catch (error) {
            console.error('Error creating form:', error);
        }
    }, [managerId, newForm, onFormCreated, setErrorMessage, setSuccessMessage]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setNewForm(prev => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleGroupChange = useCallback(
        (groupIndex: number, fieldName: keyof FormGroup, value: null) => {
            setNewForm(prevTemplate => {
                const newGroups = [...(prevTemplate.groups || [])];
                const updatedGroup = { ...newGroups[groupIndex], [fieldName]: value };
                newGroups[groupIndex] = updatedGroup;
                return { ...prevTemplate, groups: newGroups };
            });
        },
        []
    );

    const handleFieldChange = useCallback(
        (groupIndex: number | null, fieldIndex: number, fieldName: keyof Field, value: null) => {
            setNewForm(prevTemplate => {
                if (groupIndex === null) {
                    const newFields = [...(prevTemplate.fields || [])];
                    const updatedField = { ...newFields[fieldIndex], [fieldName]: value };
                    newFields[fieldIndex] = updatedField;
                    return { ...prevTemplate, fields: newFields };
                } else {
                    const newGroups = [...(prevTemplate.groups || [])];
                    const group = { ...newGroups[groupIndex] };
                    const fields = [...(group.fields || [])];
                    const updatedField = { ...fields[fieldIndex], [fieldName]: value };
                    fields[fieldIndex] = updatedField;
                    group.fields = fields;
                    newGroups[groupIndex] = group;
                    return { ...prevTemplate, groups: newGroups };
                }
            });
        },
        []
    );

    const addGroup = useCallback(() => {
        setNewForm(prev => ({
            ...prev,
            groups: [...(prev.groups || []), { title: '', sortOrder: 0, fields: [] }]
        }));
    }, []);

    const removeGroup = useCallback((index: number) => {
        setNewForm(prev => {
            const newGroups = prev.groups ? prev.groups.filter((_, i) => i !== index) : [];
            return { ...prev, groups: newGroups };
        });
    }, []);

    const addFieldToGroup = useCallback((groupIndex: number | null) => {
        setNewForm(prev => {
            const newField: Field = {
                label: '',
                type: 'text',
                options: '',
                required: false,
                applicantFieldMapping: '',
                sortOrder: 0
            };

            if (groupIndex === null) {
                return {
                    ...prev,
                    fields: [...(prev.fields || []), newField]
                };
            } else {
                const newGroups = [...(prev.groups || [])];
                const group = { ...newGroups[groupIndex] };
                group.fields = [...(group.fields || []), newField];
                newGroups[groupIndex] = group;
                return { ...prev, groups: newGroups };
            }
        });
    }, []);

    const removeFieldFromGroup = useCallback((groupIndex: number | null, fieldIndex: number) => {
        setNewForm(prev => {
            if (groupIndex === null) {
                return {
                    ...prev,
                    fields: prev.fields?.filter((_, i) => i !== fieldIndex) || []
                };
            } else {
                const newGroups = [...(prev.groups || [])];
                const group = { ...newGroups[groupIndex] };
                group.fields = group.fields?.filter((_, i) => i !== fieldIndex) || [];
                newGroups[groupIndex] = group;
                return { ...prev, groups: newGroups };
            }
        });
    }, []);

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create a New Form</h2>
            <input
                type="text"
                className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
                placeholder="Form Title"
                name="title"
                value={newForm.title}
                onChange={handleInputChange}
            />

            {/* Groups */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Groups</label>
                {newForm.groups?.map((group, groupIndex) => (
                    <div key={groupIndex} className="border border-gray-300 p-4 rounded-lg shadow-sm my-4">
                        <div className="flex justify-between items-start mb-2">
                            <input
                                className="border border-gray-300 p-2 rounded-lg shadow-sm w-3/4"
                                placeholder={`Group ${groupIndex + 1} Title`}
                                value={group.title || ''}
                                name="title"
                            />
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-md shadow-sm"
                                onClick={() => removeGroup(groupIndex)}
                            >
                                Remove Group
                            </button>
                        </div>
                        <input
                            className="border border-gray-300 p-2 rounded-lg shadow-sm w-full mb-2"
                            placeholder={`Group ${groupIndex + 1} Sort Order`}
                            type="number"
                            name="sortOrder"
                            value={group.sortOrder || 0}
                        />

                        {/* Group Fields */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
                            {group.fields?.map((field, fieldIndex) => (
                                <div key={fieldIndex} className="border border-gray-200 p-2 rounded-lg shadow-sm my-2">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        <input
                                            className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                            placeholder={`Field ${fieldIndex + 1} Label`}
                                            value={field.label || ''}
                                        />
                                        <input
                                            className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                            placeholder="Type"
                                            value={field.type || ''}
                                        />
                                        <input
                                            className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                            placeholder="Options"
                                            value={field.options || ''}
                                        />
                                        <input
                                            className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                            placeholder="Applicant Field Mapping"
                                            value={field.applicantFieldMapping || ''}
                                        />
                                        <input
                                            className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                            type="number"
                                            placeholder="Sort Order"
                                            value={field.sortOrder || 0}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="text-red-500 text-sm mt-2"
                                        onClick={() => removeFieldFromGroup(groupIndex, fieldIndex)}
                                    >
                                        Remove Field
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md mt-2"
                                onClick={() => addFieldToGroup(groupIndex)}
                            >
                                Add Field
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-4"
                    onClick={addGroup}
                >
                    Add Group
                </button>
            </div>

            {/* Submit */}
            <button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md mt-6"
                onClick={handleCreate}
            >
                Create Form
            </button>
        </div>
    );
};

export default CreateForm;

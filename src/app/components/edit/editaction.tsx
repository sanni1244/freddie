'use client';
import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Form, Field, FormGroup, FormField, FormTemplate } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import ErrorMessage from '@/app/components/error';
import SuccessMessage from '@/app/components/success';


interface EditFormProps {
    managerId: string | null;
    initialTemplate: string | null;
    form: Form;
    onFormUpdated: (updatedForm: Form) => void;
    onTemplateUpdated: (updatedTemplate: FormTemplate) => void;
    onCancel: () => void;
}

 
const EditForm: React.FC<EditFormProps> = ({
    managerId,
    form,
    onFormUpdated,
    onCancel,
}) => {
    const [editedForm, setEditedForm] = useState<Omit<Form, 'createdAt'>>(form);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        setEditedForm(form);
    }, [form]);

    const handleSave = useCallback(async () => {
        try {
            const response = await api.patch(
                `/managers/${managerId}/forms/${editedForm.id}`,
                editedForm
            );
            onFormUpdated(response.data);
            setSuccessMessage('Form updated successfully.');
            setTimeout(() => {
                setSuccessMessage(null);
                onCancel();
            }, 2000);
        } catch (error: any) {
            console.error('Error saving form:', error);
            setErrorMessage(error.message || 'Failed to update form.');
            setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
        }
    }, [editedForm, managerId, onFormUpdated, onCancel]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setEditedForm(prev => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleGroupChange = useCallback(
        (groupIndex: number, fieldName: keyof FormGroup, value: string | number) => {
            setEditedForm(prev => {
                const groups = [...(prev.groups || [])];
                if (!groups[groupIndex]) return prev;
                groups[groupIndex] = { ...groups[groupIndex], [fieldName]: value };
                return { ...prev, groups };
            });
        },
        []
    );

    const handleFieldChange = useCallback(
        (
            groupIndex: number | null,
            fieldIndex: number,
            fieldName: keyof Field,
            value: string | boolean | number
        ) => {
            setEditedForm(prev => {
                if (groupIndex === null) {
                    const fields = [...(prev.fields || [])];
                    if (!fields[fieldIndex]) return prev;
                    fields[fieldIndex] = { ...fields[fieldIndex], [fieldName]: value };
                    return { ...prev, fields };
                } else {
                    const groups = [...(prev.groups || [])];
                    if (!groups[groupIndex]) return prev;
                    const group = { ...groups[groupIndex] };
                    const fields = [...(group.fields || [])];
                    if (!fields[fieldIndex]) return prev;
                    fields[fieldIndex] = { ...fields[fieldIndex], [fieldName]: value };
                    group.fields = fields;
                    groups[groupIndex] = group;
                    return { ...prev, groups };
                }
            });
        },
        []
    );

    const handleBooleanFieldChange = useCallback(
        (
            groupIndex: number | null,
            fieldIndex: number,
            fieldName: keyof Field,
            checked: boolean
        ) => {
            setEditedForm(prev => {
                if (groupIndex === null) {
                    const fields = [...(prev.fields || [])];
                    if (!fields[fieldIndex]) return prev;
                    fields[fieldIndex] = { ...fields[fieldIndex], [fieldName]: checked };
                    return { ...prev, fields };
                } else {
                    const groups = [...(prev.groups || [])];
                    if (!groups[groupIndex]) return prev;
                    const group = { ...groups[groupIndex] };
                    const fields = [...(group.fields || [])];
                    if (!fields[fieldIndex]) return prev;
                    fields[fieldIndex] = { ...fields[fieldIndex], [fieldName]: checked };
                    group.fields = fields;
                    groups[groupIndex] = group;
                    return { ...prev, groups };
                }
            });
        },
        []
    );

    const addGroup = useCallback(() => {
        setEditedForm(prev => ({
            ...prev,
            groups: [...(prev.groups || []), { id: uuidv4(), title: '', sortOrder: 0, fields: [] }]
        }));
    }, []);

    const removeGroup = useCallback((index: number) => {
        setEditedForm(prev => ({
            ...prev,
            groups: prev.groups?.filter((_, i) => i !== index) || []
        }));
    }, []);

    const addFieldToGroup = useCallback((groupIndex: number | null) => {
        const newField: FormField = {
            id: uuidv4(),
            label: '',
            type: 'text',
            required: false,
            applicantFieldMapping: '',
            sortOrder: 0,
            placeholder: '',
            helpText: '',
            defaultValue: '',
            validationPattern: '',
        };

        setEditedForm(prev => {
            if (groupIndex === null) {
                return {
                    ...prev,
                    fields: [...(prev.fields || []), newField]
                };
            } else {
                const groups = [...(prev.groups || [])];
                if (!groups[groupIndex]) return prev;
                const group = { ...groups[groupIndex] };
                group.fields = [...(group.fields || []), newField];
                groups[groupIndex] = group;
                return { ...prev, groups };
            }
        });
    }, []);


    const removeFieldFromGroup = useCallback((groupIndex: number | null, fieldIndex: number) => {
        setEditedForm(prev => {
            if (groupIndex === null) {
                return {
                    ...prev,
                    fields: prev.fields?.filter((_, i) => i !== fieldIndex) || []
                };
            } else {
                const groups = [...(prev.groups || [])];
                if (!groups[groupIndex]) return prev;
                const group = { ...groups[groupIndex] };
                group.fields = group.fields?.filter((_, i) => i !== fieldIndex) || [];
                groups[groupIndex] = group;
                return { ...prev, groups };
            }
        });
    }, []);

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Form</h2>
            {errorMessage && <ErrorMessage message={errorMessage} />}
            {successMessage && <SuccessMessage message={successMessage} />}
            <input
                type="text"
                className="border border-gray-300 p-3 rounded-lg mb-4 w-full bg-white"
                value={editedForm.title}
                name="title"
                onChange={handleInputChange}
                placeholder="Form Title"
            />

            {editedForm.groups?.map((group, groupIndex) => (
                <div key={groupIndex} className="border p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex gap-4 mb-2">
                        <input
                            type="text"
                            value={group.title}
                            placeholder="Group Title"
                            className="flex-1 border p-2 rounded-lg"
                            onChange={(e) => handleGroupChange(groupIndex, 'title', e.target.value)}
                        />
                        <input
                            type="number"
                            value={group.sortOrder}
                            placeholder="Sort Order"
                            className="w-32 border p-2 rounded-lg"
                            onChange={(e) => handleGroupChange(groupIndex, 'sortOrder', Number(e.target.value))}
                        />
                        <button
                            type="button"
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => removeGroup(groupIndex)}
                        >
                            Remove Group
                        </button>
                    </div>

                    {group.fields?.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="border p-3 rounded mb-2 bg-gray-50">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    value={field.label}
                                    placeholder="Label"
                                    className="border p-2 rounded"
                                    onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'label', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={field.type}
                                    placeholder="Type"
                                    className="border p-2 rounded"
                                    onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'type', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={field.options}
                                    placeholder="Options"
                                    className="border p-2 rounded"
                                    onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'options', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={field.applicantFieldMapping}
                                    placeholder="Applicant Field Mapping"
                                    className="border p-2 rounded"
                                    onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'applicantFieldMapping', e.target.value)}
                                />
                                <input
                                    type="number"
                                    value={field.sortOrder}
                                    placeholder="Sort Order"
                                    className="border p-2 rounded"
                                    onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'sortOrder', Number(e.target.value))}
                                />
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={field.required}
                                        className="mr-2"
                                        onChange={(e) => handleBooleanFieldChange(groupIndex, fieldIndex, 'required', e.target.checked)}
                                    />
                                    Required
                                </label>
                            </div>
                            <button
                                type="button"
                                className="mt-2 bg-red-400 text-white px-2 py-1 rounded"
                                onClick={() => removeFieldFromGroup(groupIndex, fieldIndex)}
                            >
                                Remove Field
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
                        onClick={() => addFieldToGroup(groupIndex)}
                    >
                        + Add Field to Group
                    </button>
                </div>
            ))}

            <button
                type="button"
                className="bg-green-600 text-white px-4 py-2 rounded mt-2"
                onClick={addGroup}
            >
                + Add Group
            </button>

            <div className="mt-6 flex gap-4">
                <button
                    type="button"
                    className="bg-blue-700 text-white px-6 py-2 rounded"
                    onClick={handleSave}
                >
                    Save Changes
                </button>
                <button
                    type="button"
                    className="bg-gray-400 text-white px-6 py-2 rounded"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditForm;
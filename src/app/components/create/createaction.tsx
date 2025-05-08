import React, { useState } from 'react';
import api from '@/lib/api';
import { FormTemplate } from '@/types';

interface CreateTemplateProps {
    onTemplateCreated: (newTemplate: FormTemplate) => void;
    managerId: string | null;
    jobId: string | null;
}

const CreateTemplate: React.FC<CreateTemplateProps> = ({
    onTemplateCreated,
    managerId,
    jobId,
}) => {
    const [newForm, setNewForm] = useState<Partial<FormTemplate>>({
        title: '',
        formType: 'application',
        groups: [{ id: crypto.randomUUID(), title: '', sortOrder: 1, fields: [] }],
        fields: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
        setNewForm({ ...newForm, [name]: value });
    };

    const handleGroupInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        groupIndex: number
    ) => {
        const { name, value } = event.target;
        const updatedGroups = [...newForm.groups!];
        updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], [name]: value };
        setNewForm({ ...newForm, groups: updatedGroups });
    };

    const handleAddFieldToGroup = (groupIndex: number) => {
        const updatedGroups = [...newForm.groups!];
        updatedGroups[groupIndex].fields.push({
            label: '',
            type: 'text',
            required: false,
            sortOrder: updatedGroups[groupIndex].fields.length + 1,
        });
        setNewForm({ ...newForm, groups: updatedGroups });
    };

    const handleFieldInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        groupIndex: number,
        fieldIndex: number
    ) => {
        const { name, value, type } = event.target;
        const updatedGroups = [...newForm.groups!];
        const updatedField = { ...updatedGroups[groupIndex].fields[fieldIndex] };

        if (type === 'checkbox') {
            const { checked } = event.target as HTMLInputElement;
            (updatedField as any)[name] = checked;
        } else {
            (updatedField as any)[name] = value;
        }

        updatedGroups[groupIndex].fields[fieldIndex] = updatedField;
        setNewForm({ ...newForm, groups: updatedGroups });
    };


    const handleAddGroup = () => {
        const updatedGroups = [...newForm.groups!];
        updatedGroups.push({ id: crypto.randomUUID(), title: '', sortOrder: updatedGroups.length + 1, fields: [] });
        setNewForm({ ...newForm, groups: updatedGroups });
    };

    const handleDeleteGroup = (groupIndex: number) => {
        const updatedGroups = [...newForm.groups!];
        updatedGroups.splice(groupIndex, 1);
        // Re-sort the remaining groups
        const reSortedGroups = updatedGroups.map((group, index) => ({ ...group, sortOrder: index + 1 }));
        setNewForm({ ...newForm, groups: reSortedGroups });
    };

    const handleDeleteField = (groupIndex: number, fieldIndex: number) => {
        const updatedGroups = [...newForm.groups!];
        updatedGroups[groupIndex].fields.splice(fieldIndex, 1);
        // Re-sort the remaining fields in the group
        const reSortedFields = updatedGroups[groupIndex].fields.map((field, index) => ({ ...field, sortOrder: index + 1 }));
        updatedGroups[groupIndex].fields = reSortedFields;
        setNewForm({ ...newForm, groups: updatedGroups });
    };

    const handleSubmitNewForm = async () => {
        if (!managerId || !jobId) {
            setError('Please select a manager and job before creating a form template.');
            return;
        }

        if (!newForm.title) {
            setError('Please enter a title for the form template.');
            return;
        }

        if (!newForm.groups || newForm.groups.length === 0) {
            setError('Please add at least one group to the form template.');
            return;
        }

        for (const group of newForm.groups) {
            if (!group.title) {
                setError('Please enter a title for each group.');
                return;
            }
            if (!group.fields || group.fields.length === 0) {
                setError(`Please add at least one field to the group "${group.title}".`);
                return;
            }
            for (const field of group.fields) {
                if (!field.label) {
                    setError(`Please enter a label for each field in the group "${group.title}".`);
                    return;
                }
            }
        }

        setLoading(true);
        setError(null);
        try {
            console.log('Submitting form data:', { ...newForm, managerId }); // Log the data being sent
            const response = await api.post(
                `/forms?jobId=${jobId}`,
                { ...newForm, managerId } // Include managerId in the request body
            );
            console.log('API Response:', response); // Log the API response

            if (response.status !== 201) {
                throw new Error(`Failed to create form template: ${response.status} ${response.statusText}`);
            }
            onTemplateCreated(response.data);
            setNewForm({
                title: '',
                formType: 'application',
                groups: [{ id: crypto.randomUUID(), title: '', sortOrder: 1, fields: [] }],
                fields: [],
            });
        } catch (err: any) {
            console.error('Error creating form template:', err);
            setError(err.message || 'Failed to create form template.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setNewForm({
            title: '',
            formType: 'application',
            groups: [{ id: crypto.randomUUID(), title: '', sortOrder: 1, fields: [] }],
            fields: [],
        });
    };

    return (
        <div className="container mx-auto p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Create New Application Form Template</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={newForm.title || ''}
                    onChange={handleInputChange}
                    placeholder="Enter form title"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            {newForm.groups?.map((group, groupIndex) => (
                <div key={`group-${groupIndex}`} className="mb-6 border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold">Group {groupIndex + 1}</h3>
                        <button
                            type="button"
                            onClick={() => handleDeleteGroup(groupIndex)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Delete Group
                        </button>
                    </div>

                    <div className="mb-4">
                        <label htmlFor={`group-title-${groupIndex}`} className="block text-gray-700 text-sm font-bold mb-2">Group Title</label>
                        <input
                            type="text"
                            id={`group-title-${groupIndex}`}
                            name="title"
                            value={group.title || ''}
                            onChange={(event) => handleGroupInputChange(event, groupIndex)}
                            placeholder="Enter group title"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <h4 className="text-lg font-semibold mb-2">Fields in this Group</h4>
                    {group.fields?.map((field, fieldIndex) => (
                        <div key={`field-${groupIndex}-${fieldIndex}`} className="mb-4 border rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor={`field-label-${groupIndex}-${fieldIndex}`} className="block text-gray-700 text-sm font-bold">Field Label</label>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteField(groupIndex, fieldIndex)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-xs"
                                >
                                    Delete Field
                                </button>
                            </div>
                            <input
                                type="text"
                                id={`field-label-${groupIndex}-${fieldIndex}`}
                                name="label"
                                value={field.label || ''}
                                onChange={(event) => handleFieldInputChange(event, groupIndex, fieldIndex)}
                                placeholder="Enter field label"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                            />

                            <label htmlFor={`field-type-${groupIndex}-${fieldIndex}`} className="block text-gray-700 text-sm font-bold mb-2">Field Type</label>
                            <select
                                id={`field-type-${groupIndex}-${fieldIndex}`}
                                name="type"
                                value={field.type || 'text'}
                                onChange={(event) => handleFieldInputChange(event, groupIndex, fieldIndex)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                            >
                                <option value="text">Text</option>
                                <option value="textarea">Text Area</option>
                                <option value="url">URL</option>
                                <option value="phone">Phone</option>
                                <option value="city">City</option>
                                <option value="date">Date</option>
                                <option value="country">Country</option>
                                <option value="state">State</option>
                                <option value="zipcode">Zip Code</option>
                                <option value="select">Select</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="number">Number</option>
                                <option value="rating">Rating</option>
                                <option value="radio">Radio</option>
                                <option value="email">Email</option>
                                <option value="document">Document</option>
                            </select>
                            <label className="inline-flex items-center text-gray-700 text-sm">
                                <input
                                    type="checkbox"
                                    name="required"
                                    checked={field.required || false}
                                    onChange={(event) => handleFieldInputChange(event, groupIndex, fieldIndex)}
                                    className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="ml-2">Required</span>
                            </label>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleAddFieldToGroup(groupIndex)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Add Field
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={handleAddGroup}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
            >
                Add Group
            </button>

            <div className="flex items-center justify-end">
                <button
                    onClick={handleSubmitNewForm}
                    disabled={loading}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                    onClick={handleCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CreateTemplate;
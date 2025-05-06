'use client';
import React, { useState } from 'react';
import api from '@/lib/api';
import { Form } from '@/types';

interface DisplayFormsProps {
    managerId: string;
    forms: Form[];
    onFormDeleted: (id: string) => void;
    onEdit: (form: Form) => void;
    setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const DisplayForms: React.FC<DisplayFormsProps> = ({
    managerId,
    forms,
    onFormDeleted,
    onEdit,
    setSuccessMessage,
    setErrorMessage,
}) => {
    const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

    const handleDelete = async (formId: string) => {
        if (!showConfirmDelete) return; // Important: Check if confirmation is active
        try {
            await api.delete(`/managers/${managerId}/forms/${formId}`);
            onFormDeleted(formId);
            setSuccessMessage('Form deleted successfully.');
            setShowConfirmDelete(null); // Clear confirmation state on success
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Error deleting form.');
            console.error('Error deleting form:', error);
        }
    };

    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Manager&apos;s Forms:</h2>
            {forms.length > 0 ? (
                forms.map((form) => (
                    <div key={form.id} className="mt-4 p-6 border rounded-xl shadow-sm bg-white">
                        <p className="text-lg font-semibold text-gray-700">Title: {form.title}</p>
                        <p className="text-md text-gray-600">Form Type: {form.formType}</p>
                        <div className="mt-4 flex items-center space-x-4">
                            <button
                                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                                onClick={() => onEdit(form)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                                onClick={() => setShowConfirmDelete(form.id)}
                            >
                                Delete
                            </button>
                        </div>
                        {showConfirmDelete === form.id && (
                            <div className="mt-4 flex items-center space-x-4">
                                <button
                                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
                                    onClick={() => handleDelete(form.id)}
                                >
                                    Confirm Delete
                                </button>
                                <button
                                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
                                    onClick={() => setShowConfirmDelete(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No forms available for this manager.</p>
            )}
        </div>
    );
};

export default DisplayForms;

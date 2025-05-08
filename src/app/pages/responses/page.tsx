'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

// Placeholder for the Create Form Response component (will be in a separate file)
const CreateFormResponse = () => {
  return (
    <div>
      <button>Create Response</button>
    </div>
  );
};

// Placeholder for the Delete Form Response component (will be in a separate file)
const DeleteFormResponse = ({ applicantId }: { applicantId: string }) => {
  const handleDelete = () => {
    // Implement your delete logic here using the applicantId and the api function
    console.log(`Deleting response for applicant: ${applicantId}`);
    // Example of how you might use the api function for deletion (you'll need to define the endpoint)
    // api.delete(`/forms-responses/${formId}/${applicantId}`)
    //   .then(() => {
    //     // Handle successful deletion (e.g., refresh the list)
    //   })
    //   .catch((error) => {
    //     console.error('Error deleting response:', error);
    //     // Handle error display
    //   });
  };

  return (
    <button onClick={handleDelete}>
      Delete
    </button>
  );
};

interface Response {
  label: string;
  value: any;
  fileUrl: string;
  fieldId: string;
  createdAt: string;
}

interface FormResponse {
  applicantId: string;
  createdAt: string;
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
  const { formId } = useParams();
  const searchParams = useSearchParams();

  const [responsesData, setResponsesData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '20', 10));
  const managerId = searchParams.get('managerId');

  useEffect(() => {
    const fetchFormResponses = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = `/forms-responses/${formId}`;
        const params: Record<string, string> = {
          limit: String(limit),
          page: String(page),
        };
        if (managerId) {
          params.managerId = managerId;
        }

        const data: ApiResponse = await api.get(apiUrl, { params });
        setResponsesData(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch form responses');
        console.error('Error fetching form responses:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchFormResponses();
  }, [formId, managerId, limit, page]);

  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', String(newPage));
    router.push(`/forms-responses/${formId}?${newSearchParams.toString()}`);
    setPage(newPage);
  };

  return (
    <div>
      <h2>Form Responses for Form ID: {formId}</h2>

      <CreateFormResponse />

      {loading ? (
        <p>Loading form responses...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : responsesData && responsesData.data.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Applicant ID</th>
                <th>Created At</th>
                <th>Responses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {responsesData.data.map((response) => (
                <tr key={response.applicantId}>
                  <td>{response.applicantId}</td>
                  <td>{new Date(response.createdAt).toLocaleString()}</td>
                  <td>
                    {response.responses.map((res, index) => (
                      <div key={index} style={{ marginBottom: '1em' }}>
                        <p>
                          <strong>{res.label}:</strong>
                        </p>
                        <p>{JSON.stringify(res.value)}</p>
                        {res.fileUrl && (
                          <p style={{ fontSize: '0.8em' }}>
                            File URL: {res.fileUrl}
                          </p>
                        )}
                      </div>
                    ))}
                  </td>
                  <td>
                    <DeleteFormResponse applicantId={response.applicantId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {responsesData.total > 0 && (
            <div style={{ marginTop: '1em', display: 'flex', justifyContent: 'center' }}>
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {Math.ceil(responsesData.total / responsesData.limit)}
              </span>
              <button
                disabled={page === Math.ceil(responsesData.total / responsesData.limit)}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p>No responses found for this form.</p>
      )}
    </div>
  );
};

export default FormResponsesPage;
'use client';
import { Job } from '@/types';

interface DisplayJobsProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  selectedManagerId: string | null;
}

const DisplayJobs: React.FC<DisplayJobsProps> = ({
  jobs,
  onEdit,
  onDelete,
  setLoading,
  setMessage,
  selectedManagerId,
}) => {
  const handleDelete = async (jobId: string) => {
    if (!selectedManagerId) {
      setMessage('Please select a manager first.');
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/jobs/${jobId}?managerId=${selectedManagerId}`, { method: 'DELETE' });
      onDelete(jobId);
      setMessage('Job deleted.');
    } catch (error) {
      console.error('Error deleting job:', error);
      setMessage('Failed to delete job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {jobs.map((job) => (
        <div key={job.id} className="border border-gray-200 p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-all">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-800">{job.title}</h2>
            <div className="flex gap-3">
              <button onClick={() => onEdit(job)} className="text-blue-600 font-medium hover:underline">
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(job.id)} className="text-red-600 font-medium hover:underline">
                🗑️ Delete
              </button>
            </div>
          </div>
          <p className="text-gray-700 mt-2">{job.description}</p>
          <div className="text-sm text-gray-500 mt-3 space-y-1">
            <p>
              📍 {job.city}, {job.state}, {job.country}
            </p>
            <p>🧭 {job.workMode}</p>
             {job.whyJoinUs && <p>🏆 Why Join Us: {job.whyJoinUs}</p>}
            <p>📈 {job.applicantCount} Applicants</p>
            <p>🕒 Job created {Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))} day(s) ago</p>
             {job.requirements && job.requirements.length > 0 && (
                <p>
                  ✅ Requirements: {job.requirements.join(', ')}
                </p>
              )}
              {job.roles && job.roles.length > 0 && (
                <p>
                  🎯 Roles: {job.roles}
                </p>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayJobs;
'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditIdentityPage() {
  const router = useRouter();
  const params = useParams();
  const managerId = params.managerId as string;
  const identityId = params.identityId as string;

  const [name, setName] = useState('');

  useEffect(() => {
    fetchIdentity();
  }, []);

  const fetchIdentity = async () => {
    const res = await axios.get(
      `https://api-freddie.ai-wk.com/managers/${managerId}/identities/${identityId}`
    );
    setName(res.data.name);
  };

  const updateIdentity = async () => {
    await axios.patch(
      `https://api-freddie.ai-wk.com/managers/${managerId}/identities/${identityId}`,
      { name }
    );
    router.push('/identities');
  };

  return (
    <div>
      <h2>Edit Identity</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={updateIdentity}>Update</button>
    </div>
  );
}

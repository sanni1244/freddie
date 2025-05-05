"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { FaUserEdit, FaTrashAlt } from "react-icons/fa";
import { MdVerifiedUser, MdBadge, MdCalendarToday } from "react-icons/md";
import { useSearchParams } from "next/navigation";

type Identity = {
  id: string;
  identity?: string;
  identityType?: string;
  verificationStatus?: string;
  createdAt?: string;
};

const getDaysAgo = (date?: string) => {
  if (!date) return "N/A";
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 3600 * 24));
  return isNaN(days) ? "N/A" : `${days} days ago`;
};

export default function IdentitiesPage() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const managerId = searchParams.get("managerId");

  useEffect(() => {
    const fetchIdentities = async () => {
      if (managerId) {
        try {
          const res = await api.get(`/managers/${managerId}/identities?managerId=${managerId}`);
          setIdentities(res.data.identities);
          console.log(res.data.identities);
        } catch (err) {
          setError("Failed to load identities.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("Manager ID not provided.");
        setLoading(false);
      }
    };

    fetchIdentities();
  }, [managerId]);

  if (loading) return <p className="text-center text-gray-400 mt-10">Loading identities...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen px-6 py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white"
    >
      <h1 className="text-5xl font-extrabold text-center text-indigo-300 mb-16 drop-shadow-lg">
        Manager Identities
      </h1>

      <div className="space-y-10 max-w-4xl mx-auto">
        {identities.map((identity) => (
          <motion.div
            key={identity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="flex justify-between items-center p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="space-y-2">
              <p className="text-lg font-semibold flex items-center gap-2 text-indigo-400">
                <MdBadge className="text-xl" />
                {identity.identityType || "Unknown Type"}
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <MdVerifiedUser />
                {identity.identity || "No email"}
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <MdVerifiedUser />
                {identity.verificationStatus || "not initiated"}
              </p>
              <p className="text-sm text-gray-400 flex items-center gap-2 mt-2">
                <MdCalendarToday />
                Created {getDaysAgo(identity.createdAt)}
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700"
              >
                <FaUserEdit className="text-lg" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700"
              >
                <FaTrashAlt className="text-lg" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

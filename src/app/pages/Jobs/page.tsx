"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { FaBuilding, FaCalendarAlt } from "react-icons/fa";

type Manager = {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  companyDescription: string;
  createdAt: string;
};

const getDaysAgo = (date: string) => {
  const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
  return isNaN(days) ? "N/A" : `${days} days ago`;
};

const capitalize = (str: string) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

export default function HomePage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get("/managers");
        setManagers(res.data);
      } catch {
        setError("Failed to load managers.");
      } finally {
        setLoading(false);
      }
    };
    fetchManagers();
  }, []);

  const grouped = managers.reduce((acc, m) => {
    const nameKey = capitalize(m.fullName);
    if (!acc[nameKey]) acc[nameKey] = [];
    acc[nameKey].push({ ...m, fullName: nameKey, companyName: capitalize(m.companyName) });
    return acc;
  }, {} as Record<string, Manager[]>);

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading managers...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white">
      <h1 className="text-4xl font-bold text-center mb-12">Managers</h1>

      <div className="space-y-12 max-w-5xl mx-auto">
        {Object.entries(grouped).map(([name, group]) => (
          <div key={name}>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-300">{name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.map((manager) => (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="rounded-xl p-5 backdrop-blur bg-white/10 border border-white/20 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-transform"
                >
                  <p className="text-md flex items-center gap-2">
                    <FaBuilding className="text-indigo-300" />
                    <span>{manager.companyName === "None" ? "No Company" : manager.companyName}</span>
                  </p>
                  <p className="text-sm text-gray-200 mt-2"><strong>Description:</strong>  {manager.companyDescription || "No description."}</p>
                  <p className="text-sm text-gray-300 mt-2 flex items-center gap-2">
                    <FaCalendarAlt />
                    Joined {getDaysAgo(manager.createdAt)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

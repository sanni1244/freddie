"use client";

import Link from "next/link";
import { Briefcase, Users, FileText, ClipboardList, Send, Globe, Activity } from "lucide-react";

const pages = [
  { name: "Managers", path: "./pages/managers", icon: Users },
  { name: "Identities", path: "./pages/identities", icon: FileText },
  { name: "Jobs", path: "./pages/jobs", icon: Briefcase },
  { name: "Form Templates", path: "./pages/template", icon: ClipboardList },
  { name: "Form Actions", path: "./pages/formaction", icon: Send },
  { name: "Form Responses", path: "/form-responses", icon: Activity },
  { name: "Public Form Links", path: "/public-links", icon: Globe },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Freddie Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pages.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className="bg-white rounded-2xl shadow-md p-6 flex items-center space-x-4 hover:scale-[1.03] transition-all hover:shadow-lg group"
            >
              <div className="p-3 rounded-full bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                <Icon size={24} />
              </div>
              <span className="text-lg font-medium text-gray-700 group-hover:text-blue-700 transition">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

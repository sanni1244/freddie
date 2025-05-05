"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      title="Go Back"
      className="absolute top-4 left-4 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-110"
    >
      <FaArrowLeft className="text-xl" />
    </button>
  );
};

export default BackButton;

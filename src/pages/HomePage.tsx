// src/pages/HomePage.tsx

import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="bg-[#1F1F1F] min-h-screen text-white flex flex-col items-center justify-center">
      {/* Title at the top */}
      <h1 className="text-4xl mb-12">Frisbee Footage Tracker</h1>

      {/* Container for the 3 boxes */}
      <div className="flex flex-row space-x-6">
        {/* Games Box */}
        <Link
          to="/game"
          className="border border-gray-500 rounded-md w-32 h-32 flex items-center justify-center hover:bg-[#2B2B2B] transition"
        >
          <span className="text-gray-300 text-xl">Games</span>
        </Link>

        {/* Point Search Box */}
        <Link
          to="/point-search"
          className="border border-gray-500 rounded-md w-32 h-32 flex items-center justify-center hover:bg-[#2B2B2B] transition"
        >
          <span className="text-gray-300 text-xl">Point Search</span>
        </Link>

        {/* Stats Box */}
        <Link
          to="/stats"
          className="border border-gray-500 rounded-md w-32 h-32 flex items-center justify-center hover:bg-[#2B2B2B] transition"
        >
          <span className="text-gray-300 text-xl">Stats</span>
        </Link>
      </div>
    </div>
  );
}

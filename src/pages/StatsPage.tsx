// src/pages/StatsPage.tsx

import { Link } from "react-router-dom";

export default function StatsPage() {
    return (
      <div className="p-6">
        <div>
        <Link
          to="/"
          className="px-4 py-2 hover:bg-[#303030] text-white transition rounded-md"
        >
          &larr; Back to Homepage
        </Link>
      </div>
        <h1 className="text-3xl font-bold mb-4">Stats</h1>
        <p>This page is a placeholder for future statistics.</p>
      </div>
    );
  }
  
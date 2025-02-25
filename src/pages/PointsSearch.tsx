// src/pages/PointSearch.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase"; // your Supabase client

export default function PointSearch() {
  // States for each filter
  const [offenseOrDefense, setOffenseOrDefense] = useState("");
  const [offenseInit, setOffenseInit] = useState("");
  const [defenseInit, setDefenseInit] = useState("");
  const [offenseSuccess, setOffenseSuccess] = useState<null | boolean>(null);
  const [defenseSuccess, setDefenseSuccess] = useState<null | boolean>(null);
  const [turns, setTurns] = useState<number | null>(null);
  const [wonPoint, setWonPoint] = useState<null | boolean>(null);

  // A query key that includes all filters
  const queryKey = [
    "pointSearch",
    { offenseOrDefense, offenseInit, defenseInit, offenseSuccess, defenseSuccess, turns, wonPoint },
  ];

  // Use React Query to fetch filtered data
  const { data: points, refetch, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      // Start with base query
      let query = supabase.from("points").select("*");

      // Apply filters if they aren't blank/null
      if (offenseOrDefense) query = query.eq("offense_or_defense", offenseOrDefense);
      if (offenseInit) query = query.eq("offense_initiation", offenseInit);
      if (defenseInit) query = query.eq("defense_initiation", defenseInit);
      if (offenseSuccess !== null) query = query.eq("offense_initiation_successful", offenseSuccess);
      if (defenseSuccess !== null) query = query.eq("defense_initiation_successful", defenseSuccess);
      if (turns !== null) query = query.eq("turns", turns);
      if (wonPoint !== null) query = query.eq("won_point", wonPoint);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: false, // disable auto-fetch; we'll manually call `refetch()`
  });

  // Handler for "Search" button
  function handleSearch() {
    refetch();
  }

  return (
    <div className="bg-[#1F1F1F] min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Point Search</h1>

      <div className="space-y-4 mb-6">
        {/* Offense/Defense */}
        <div>
          <label className="block font-semibold mb-1">Offense or Defense</label>
          <select
            value={offenseOrDefense}
            onChange={(e) => setOffenseOrDefense(e.target.value)}
            className="bg-gray-700 rounded p-2"
          >
            <option value="">-- Any --</option>
            <option value="Offense">Offense</option>
            <option value="Defense">Defense</option>
          </select>
        </div>

        {/* Offense Initiation */}
        <div>
          <label className="block font-semibold mb-1">Offense Initiation</label>
          <input
            type="text"
            value={offenseInit}
            onChange={(e) => setOffenseInit(e.target.value)}
            className="bg-gray-700 rounded p-2 w-full"
            placeholder="e.g. Ho Stack"
          />
        </div>

        {/* Defense Initiation */}
        <div>
          <label className="block font-semibold mb-1">Defense Initiation</label>
          <input
            type="text"
            value={defenseInit}
            onChange={(e) => setDefenseInit(e.target.value)}
            className="bg-gray-700 rounded p-2 w-full"
            placeholder="e.g. Match D"
          />
        </div>

        {/* Offense Success (checkbox or select) */}
        <div>
          <label className="block font-semibold mb-1">Offense Initiation Successful</label>
          <select
            value={offenseSuccess === null ? "" : offenseSuccess ? "true" : "false"}
            onChange={(e) => {
              if (e.target.value === "") setOffenseSuccess(null);
              else setOffenseSuccess(e.target.value === "true");
            }}
            className="bg-gray-700 rounded p-2"
          >
            <option value="">-- Any --</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Defense Success */}
        <div>
          <label className="block font-semibold mb-1">Defense Initiation Successful</label>
          <select
            value={defenseSuccess === null ? "" : defenseSuccess ? "true" : "false"}
            onChange={(e) => {
              if (e.target.value === "") setDefenseSuccess(null);
              else setDefenseSuccess(e.target.value === "true");
            }}
            className="bg-gray-700 rounded p-2"
          >
            <option value="">-- Any --</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Turns */}
        <div>
          <label className="block font-semibold mb-1">Turns</label>
          <input
            type="number"
            value={turns === null ? "" : turns}
            onChange={(e) => setTurns(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-gray-700 rounded p-2 w-full"
          />
        </div>

        {/* Won Point */}
        <div>
          <label className="block font-semibold mb-1">Won Point?</label>
          <select
            value={wonPoint === null ? "" : wonPoint ? "true" : "false"}
            onChange={(e) => {
              if (e.target.value === "") setWonPoint(null);
              else setWonPoint(e.target.value === "true");
            }}
            className="bg-gray-700 rounded p-2"
          >
            <option value="">-- Any --</option>
            <option value="true">Won</option>
            <option value="false">Lost</option>
          </select>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <p>Loading...</p>
      ) : points && points.length > 0 ? (
        <ul className="space-y-2">
          {points.map((p: any) => (
            <li key={p.id} className="bg-gray-800 p-3 rounded">
              Point #{p.point_number} - {p.offense_or_defense}
            </li>
          ))}
        </ul>
      ) : (
        <p>No points found.</p>
      )}
    </div>
  );
}

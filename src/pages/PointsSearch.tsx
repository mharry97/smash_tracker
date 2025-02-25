// src/pages/PointSearch.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function PointSearch() {
  const [offenseOrDefense, setOffenseOrDefense] = useState("");
  const [offenseInit, setOffenseInit] = useState("");
  const [defenseInit, setDefenseInit] = useState("");
  const [offenseSuccess, setOffenseSuccess] = useState("");
  const [defenseSuccess, setDefenseSuccess] = useState("");
  const [turns, setTurns] = useState("");
  const [wonPoint, setWonPoint] = useState("");

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch() {
    setIsLoading(true);
    let query = supabase.from("points").select("*");

    if (offenseOrDefense) query = query.eq("offense_or_defense", offenseOrDefense);
    if (offenseInit) query = query.eq("offense_initiation", offenseInit);
    if (defenseInit) query = query.eq("defense_initiation", defenseInit);
    if (offenseSuccess) query = query.eq("offense_initiation_successful", offenseSuccess === "true");
    if (defenseSuccess) query = query.eq("defense_initiation_successful", defenseSuccess === "true");
    if (turns) query = query.eq("turns", parseInt(turns));
    if (wonPoint) query = query.eq("won_point", wonPoint === "true");

    const { data, error } = await query;
    if (!error) {
      setResults(data);
    }
    setIsLoading(false);
  }

  return (
    <div className="bg-[#1F1F1F] min-h-screen text-white w-full">
      <header className="w-full p-6">
        <h1 className="text-3xl font-bold text-center">Point Search</h1>
      </header>
      <main className="p-6">
        <div className="flex flex-wrap gap-4">
          <select value={offenseOrDefense} onChange={(e) => setOffenseOrDefense(e.target.value)} className="bg-gray-700 p-2 rounded w-full sm:w-1/3">
            <option value="">Offense/Defense (Any)</option>
            <option value="Offense">Offense</option>
            <option value="Defense">Defense</option>
          </select>
          <input type="text" value={offenseInit} onChange={(e) => setOffenseInit(e.target.value)} placeholder="Offensive Initiation" className="bg-gray-700 p-2 rounded w-full sm:w-1/3" />
          <input type="text" value={defenseInit} onChange={(e) => setDefenseInit(e.target.value)} placeholder="Defensive Initiation" className="bg-gray-700 p-2 rounded w-full sm:w-1/3" />
          <select value={offenseSuccess} onChange={(e) => setOffenseSuccess(e.target.value)} className="bg-gray-700 p-2 rounded w-full sm:w-1/3">
            <option value="">Offensive Initiation Successful (Any)</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <select value={defenseSuccess} onChange={(e) => setDefenseSuccess(e.target.value)} className="bg-gray-700 p-2 rounded w-full sm:w-1/3">
            <option value="">Defensive Initiation Successful (Any)</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <input type="number" value={turns} onChange={(e) => setTurns(e.target.value)} placeholder="Turns" className="bg-gray-700 p-2 rounded w-full sm:w-1/3" />
          <select value={wonPoint} onChange={(e) => setWonPoint(e.target.value)} className="bg-gray-700 p-2 rounded w-full sm:w-1/3">
            <option value="">Point Outcome (Any)</option>
            <option value="true">Won</option>
            <option value="false">Lost</option>
          </select>
        </div>
        <div className="mt-4">
          <button onClick={handleSearch} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
            Search
          </button>
        </div>
      </main>
      <section className="p-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((p: any) => (
              <li key={p.id} className="bg-gray-800 p-3 rounded">
                Point #{p.point_number} - {p.offense_or_defense}
              </li>
            ))}
          </ul>
        ) : (
          <p>No points found.</p>
        )}
      </section>
    </div>
  );
}

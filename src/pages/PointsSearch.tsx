// src/pages/PointSearch.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { buildClipUrl } from "../utils/VideoHelpers";

type Game = {
  id: string;
  opponent: string;
  footage_url?: string;
};

type Point = {
  id: string;
  game_id: string;
  point_number: number;
  offense_or_defense: "Offense" | "Defense";
  offense_initiation?: string;
  defense_initiation?: string;
  offense_main_strategy?: string;
  defense_main_strategy?: string;
  offense_initiation_successful?: boolean;
  defense_initiation_successful?: boolean;
  turns?: number;
  won_point: boolean;
  point_video_url?: string;
  point_timestamp?: string;
};

export default function PointSearch() {
  // Filter states for points
  const [offenseOrDefense, setOffenseOrDefense] = useState("");
  const [offenseInit, setOffenseInit] = useState("");
  const [defenseInit, setDefenseInit] = useState("");
  const [offenseMain, setOffenseMain] = useState("");
  const [defenseMain, setDefenseMain] = useState("");
  const [offenseSuccess, setOffenseSuccess] = useState("");
  const [defenseSuccess, setDefenseSuccess] = useState("");
  const [turns, setTurns] = useState("");
  const [wonPoint, setWonPoint] = useState("");
  const [opponentFilter, setOpponentFilter] = useState("");

  // Results & loading state
  const [results, setResults] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Distinct options for tactic filters (for dropdowns)
  const [offenseInitiations, setOffenseInitiations] = useState<string[]>([]);
  const [defenseInitiations, setDefenseInitiations] = useState<string[]>([]);
  const [offenseStrategies, setOffenseStrategies] = useState<string[]>([]);
  const [defenseStrategies, setDefenseStrategies] = useState<string[]>([]);

  // Fetch distinct tactic values from points
  useEffect(() => {
    supabase
      .from("points")
      .select("offense_initiation, defense_initiation, offense_main_strategy, defense_main_strategy")
      .then(({ data, error }) => {
        if (!error && data) {
          const offInitSet = new Set<string>();
          const defInitSet = new Set<string>();
          const offMainSet = new Set<string>();
          const defMainSet = new Set<string>();
          data.forEach((row) => {
            if (row.offense_initiation?.trim()) offInitSet.add(row.offense_initiation.trim());
            if (row.defense_initiation?.trim()) defInitSet.add(row.defense_initiation.trim());
            if (row.offense_main_strategy?.trim()) offMainSet.add(row.offense_main_strategy.trim());
            if (row.defense_main_strategy?.trim()) defMainSet.add(row.defense_main_strategy.trim());
          });
          setOffenseInitiations(Array.from(offInitSet));
          setDefenseInitiations(Array.from(defInitSet));
          setOffenseStrategies(Array.from(offMainSet));
          setDefenseStrategies(Array.from(defMainSet));
        }
      });
  }, []);

  // Fetch ALL games for opponent lookup
  const [gamesData, setGamesData] = useState<Game[]>([]);
  useEffect(() => {
    supabase
      .from("games")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data) {
          setGamesData(data as Game[]);
        }
      });
  }, []);

  // Build a distinct list of opponents from gamesData for the filter
  const opponentOptions = Array.from(new Set(gamesData.map((g) => g.opponent)));

  // Build a lookup map for game by id
  const gameMap = gamesData.reduce((acc, game) => {
    acc[game.id] = game;
    return acc;
  }, {} as Record<string, Game>);

  // Search query: fetch points using filters on points table, then filter by opponent
  async function handleSearch() {
    setIsLoading(true);
    let query = supabase.from("points").select("*").order("point_number");

    if (offenseOrDefense) query = query.eq("offense_or_defense", offenseOrDefense);
    if (offenseInit) query = query.eq("offense_initiation", offenseInit);
    if (defenseInit) query = query.eq("defense_initiation", defenseInit);
    if (offenseMain) query = query.eq("offense_main_strategy", offenseMain);
    if (defenseMain) query = query.eq("defense_main_strategy", defenseMain);
    if (offenseSuccess) query = query.eq("offense_initiation_successful", offenseSuccess === "true");
    if (defenseSuccess) query = query.eq("defense_initiation_successful", defenseSuccess === "true");
    if (turns) query = query.eq("turns", parseInt(turns));
    if (wonPoint) query = query.eq("won_point", wonPoint === "true");

    const { data, error } = await query;
    if (!error && data) {
      let filtered = data as Point[];
      // Client-side filtering by opponent using gameMap
      if (opponentFilter) {
        filtered = filtered.filter((p) => {
          const game = gameMap[p.game_id];
          return game && game.opponent === opponentFilter;
        });
      }
      setResults(filtered);
    }
    setIsLoading(false);
  }

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
      <header className="w-full p-6">
        <h1 className="text-3xl font-bold text-center">Point Search</h1>
      </header>
      <main className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={offenseOrDefense}
            onChange={(e) => setOffenseOrDefense(e.target.value)}
            className="dropdown bg-gray-700 p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Offense/Defense (Any)</option>
            <option value="Offense">Offense</option>
            <option value="Defense">Defense</option>
          </select>
          <select
            value={offenseInit}
            onChange={(e) => setOffenseInit(e.target.value)}
            className="dropdown bg-gray-700 p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Offensive Initiation (Any)</option>
            {offenseInitiations.map((tactic) => (
              <option key={tactic} value={tactic}>
                {tactic}
              </option>
            ))}
          </select>
          <select
            value={defenseInit}
            onChange={(e) => setDefenseInit(e.target.value)}
            className="dropdown bg-gray-700 p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Defensive Initiation (Any)</option>
            {defenseInitiations.map((tactic) => (
              <option key={tactic} value={tactic}>
                {tactic}
              </option>
            ))}
          </select>
          <select
            value={offenseMain}
            onChange={(e) => setOffenseMain(e.target.value)}
            className="dropdown bg-gray-700 p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Offensive Main Strategy (Any)</option>
            {offenseStrategies.map((tactic) => (
              <option key={tactic} value={tactic}>
                {tactic}
              </option>
            ))}
          </select>
          <select
            value={defenseMain}
            onChange={(e) => setDefenseMain(e.target.value)}
            className="dropdown bg-gray-700 p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Defensive Main Strategy (Any)</option>
            {defenseStrategies.map((tactic) => (
              <option key={tactic} value={tactic}>
                {tactic}
              </option>
            ))}
          </select>
          <select
            value={offenseSuccess}
            onChange={(e) => setOffenseSuccess(e.target.value)}
            className="dropdown bg-gray-700 p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Offensive Initiation Successful (Any)</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <select
            value={defenseSuccess}
            onChange={(e) => setDefenseSuccess(e.target.value)}
            className="dropdown bg-gray-700 p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Defensive Initiation Successful (Any)</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <input
            type="number"
            value={turns}
            onChange={(e) => setTurns(e.target.value)}
            placeholder="Turns"
            className="bg-gray-700 p-2 rounded w-full sm:w-1/3"
          />
          <select
            value={wonPoint}
            onChange={(e) => setWonPoint(e.target.value)}
            className="dropdown bg-gray-700 p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Point Outcome (Any)</option>
            <option value="true">Won</option>
            <option value="false">Lost</option>
          </select>
          <select
            value={opponentFilter}
            onChange={(e) => setOpponentFilter(e.target.value)}
            className="dropdown bg-gray-700 p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Opponent (Any)</option>
            {opponentOptions.map((opp) => (
              <option key={opp} value={opp}>
                {opp}
              </option>
            ))}
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
          <div className="row_container">
            {results.map((p) => {
              // Get opponent from gameMap
              const game = gameMap[p.game_id];
              const opponent = game ? game.opponent : "Unknown Opponent";
              // Build final clip URL
              let finalClipUrl = "";
              if (p.point_video_url && p.point_video_url.trim() !== "") {
                finalClipUrl = p.point_video_url.trim();
              } else {
                const baseUrl = game?.footage_url || "";
                const timestamp = p.point_timestamp?.trim() || "";
                finalClipUrl = buildClipUrl(baseUrl, timestamp);
              }
              // Use same row format as in GamePage, with opponent in column 1
              const odLabel = p.offense_or_defense === "Offense" ? "O" : "D";
              const odColour = p.won_point ? "text-green-500" : "text-red-500";

              return (
                <Link
                  key={p.id}
                  to={`/point/${p.id}`}
                  className="row_item"
                >
                  {/* Column 1: Opponent */}
                  <div className="point_item text-white">{opponent}</div>
                  {/* Column 2: O/D */}
                  <div className={`point_item ${odColour} font-bold text-center`}>{odLabel}</div>
                  {/* Column 3: Initiation Play */}
                  <div className="point_item text-white">{p.offense_or_defense === "Offense" ? p.offense_initiation : p.defense_initiation || ""}</div>
                  {/* Column 4: Main Play */}
                  <div className="point_item text-white">{p.offense_or_defense === "Offense" ? p.offense_main_strategy : p.defense_main_strategy || ""}</div>
                  {/* Column 5: Watch Clip */}
                  <div className="point_item">
                    {finalClipUrl ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(finalClipUrl, "_blank");
                        }}
                        className="watch_button"
                      >
                        Watch Clip
                      </button>
                    ) : (
                      <span className="text-gray-500 italic">No URL</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p>No points found.</p>
        )}
      </section>
    </div>
  );
}

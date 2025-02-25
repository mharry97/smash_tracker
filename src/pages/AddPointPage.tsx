// src/pages/AddPointPage.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type SquadPlayer = {
  id: string;
  player_name: string;
};

export default function AddPointPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  // (1) Per-point Video URL
  const [pointVideoUrl, setPointVideoUrl] = useState("");

  // (2) Timestamp
  const [pointTimestamp, setPointTimestamp] = useState("");

  // (3) Offense/Defense
  const [offenseOrDefense, setOffenseOrDefense] = useState<"Offense" | "Defense">("Offense");

  // (4) 7-player dropdowns
  const [playerSlots, setPlayerSlots] = useState<string[]>(() => Array(7).fill(""));

  // (5) Offensive Initiation
  const [offenseInitiation, setOffenseInitiation] = useState("");

  // (6) Offensive Initiation Successful?
  const [offenseInitiationSuccess, setOffenseInitiationSuccess] = useState(false);

  // (7) Defensive Initiation
  const [defenseInitiation, setDefenseInitiation] = useState("");

  // (8) Defensive Initiation Successful?
  const [defenseInitiationSuccess, setDefenseInitiationSuccess] = useState(false);

  // (9) Offensive Main Strategy
  const [offenseMainStrategy, setOffenseMainStrategy] = useState("");

  // (10) Defensive Main Strategy
  const [defenseMainStrategy, setDefenseMainStrategy] = useState("");

  // (11) Turns
  const [turns, setTurns] = useState<number>(0);

  // (12) Did We Win Point?
  const [wonPoint, setWonPoint] = useState(false);

  // (13) Notes
  const [notes, setNotes] = useState("");

  // Auto point_number
  const [pointNumber, setPointNumber] = useState<number>(1);

  const [error, setError] = useState<string | null>(null);

  // Squad data
  const [allPlayers, setAllPlayers] = useState<SquadPlayer[]>([]);

  // Distinct sets for the 4 strategy fields (for datalist)
  const [distinctOffenseInit, setDistinctOffenseInit] = useState<string[]>([]);
  const [distinctDefenseInit, setDistinctDefenseInit] = useState<string[]>([]);
  const [distinctOffenseMain, setDistinctOffenseMain] = useState<string[]>([]);
  const [distinctDefenseMain, setDistinctDefenseMain] = useState<string[]>([]);

  useEffect(() => {
    if (!gameId) return;

    // 1) Fetch squad
    supabase
      .from("squad")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data) {
          setAllPlayers(data as SquadPlayer[]);
        }
      });

    // 2) Auto-increment point_number (find max point_number for this game)
    supabase
      .from("points")
      .select("point_number")
      .eq("game_id", gameId)
      .then(({ data, error }) => {
        if (!error && data) {
          const maxPoint = data.reduce((acc, curr) => {
            return Math.max(acc, curr.point_number);
          }, 0);
          setPointNumber(maxPoint + 1);
        }
      });

    // 3) Fetch columns for datalist
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
            if (row.offense_initiation && row.offense_initiation.trim().length > 0) {
              offInitSet.add(row.offense_initiation.trim());
            }
            if (row.defense_initiation && row.defense_initiation.trim().length > 0) {
              defInitSet.add(row.defense_initiation.trim());
            }
            if (row.offense_main_strategy && row.offense_main_strategy.trim().length > 0) {
              offMainSet.add(row.offense_main_strategy.trim());
            }
            if (row.defense_main_strategy && row.defense_main_strategy.trim().length > 0) {
              defMainSet.add(row.defense_main_strategy.trim());
            }
          });

          setDistinctOffenseInit(Array.from(offInitSet));
          setDistinctDefenseInit(Array.from(defInitSet));
          setDistinctOffenseMain(Array.from(offMainSet));
          setDistinctDefenseMain(Array.from(defMainSet));
        }
      });
  }, [gameId]);

  // 7-slot dropdown change
  function handlePlayerChange(index: number, playerId: string) {
    setPlayerSlots((prev) => {
      const newSlots = [...prev];
      newSlots[index] = playerId;
      return newSlots;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) {
      setError("No game ID found in the URL.");
      return;
    }
    setError(null);

    // Insert new point
    const { data: insertedPoints, error: insertError } = await supabase
      .from("points")
      .insert([
        {
          game_id: gameId,
          point_number: pointNumber,
          point_video_url: pointVideoUrl || null,
          point_timestamp: pointTimestamp || null,
          offense_or_defense: offenseOrDefense,
          offense_initiation: offenseInitiation || null,
          offense_initiation_successful: offenseInitiationSuccess,
          defense_initiation: defenseInitiation || null,
          defense_initiation_successful: defenseInitiationSuccess,
          offense_main_strategy: offenseMainStrategy || null,
          defense_main_strategy: defenseMainStrategy || null,
          turns,
          won_point: wonPoint,
          notes: notes || null,
        },
      ])
      .select("*");

    if (insertError) {
      setError(insertError.message);
      return;
    }
    const newPoint = insertedPoints?.[0];
    if (!newPoint) {
      setError("Insertion failed.");
      return;
    }

    // Insert players for 7 slots (skip blank slots)
    for (const pId of playerSlots) {
      if (pId) {
        await supabase.from("point_players").insert([
          { point_id: newPoint.id, player_id: pId },
        ]);
      }
    }

    navigate(`/game/${gameId}`);
  };

  return (
    <div className="bg-[#1F1F1F] min-h-screen text-white p-6 w-full">
      <h1 className="text-3xl font-bold mb-6">Add New Point</h1>

      {error && (
        <div className="bg-red-500 p-2 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#2B2B2B] p-6 rounded-md space-y-4 w-full">
        {/* 1) Point Video URL */}
        <div>
          <label className="block font-semibold mb-1">Clip URL (optional)</label>
          <input
            type="text"
            value={pointVideoUrl}
            onChange={(e) => setPointVideoUrl(e.target.value)}
            placeholder="If each point is a separate video"
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
        </div>

        {/* 2) Timestamp */}
        <div>
          <label className="block font-semibold mb-1">Timestamp</label>
          <input
            type="text"
            value={pointTimestamp}
            onChange={(e) => setPointTimestamp(e.target.value)}
            placeholder='e.g. "00:01:23" or "93:40"'
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
        </div>

        {/* 3) Offense/Defense */}
        <div>
          <p className="font-semibold mb-1">Offense or Defense?</p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="Offense"
                checked={offenseOrDefense === "Offense"}
                onChange={() => setOffenseOrDefense("Offense")}
              />
              Offense
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="Defense"
                checked={offenseOrDefense === "Defense"}
                onChange={() => setOffenseOrDefense("Defense")}
              />
              Defense
            </label>
          </div>
        </div>

        {/* 4) 7 Player Slots */}
        <div>
          <label className="block font-semibold mb-1">Players (7 Slots)</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[...Array(7)].map((_, i) => (
              <select
                key={i}
                value={playerSlots[i]}
                onChange={(e) => handlePlayerChange(i, e.target.value)}
                className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
              >
                <option value="">-- Select Player --</option>
                {allPlayers.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.player_name}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* 5) Offensive Initiation (Datalist) */}
        <div>
          <label className="block font-semibold mb-1">Offensive Initiation</label>
          <input
            list="offenseInitList"
            value={offenseInitiation}
            onChange={(e) => setOffenseInitiation(e.target.value)}
            placeholder="e.g. Windmill"
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
          <datalist id="offenseInitList">
            {distinctOffenseInit.map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>
        </div>

        {/* 6) Offensive Initiation Successful? */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={offenseInitiationSuccess}
            onChange={(e) => setOffenseInitiationSuccess(e.target.checked)}
          />
          <label className="font-semibold">Offensive Initiation Successful?</label>
        </div>

        {/* 7) Defensive Initiation (Datalist) */}
        <div>
          <label className="block font-semibold mb-1">Defensive Initiation</label>
          <input
            list="defenseInitList"
            value={defenseInitiation}
            onChange={(e) => setDefenseInitiation(e.target.value)}
            placeholder="e.g. Wall"
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
          <datalist id="defenseInitList">
            {distinctDefenseInit.map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>
        </div>

        {/* 8) Defensive Initiation Successful? */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={defenseInitiationSuccess}
            onChange={(e) => setDefenseInitiationSuccess(e.target.checked)}
          />
          <label className="font-semibold">Defensive Initiation Successful?</label>
        </div>

        {/* 9) Offensive Main Strategy (Datalist) */}
        <div>
          <label className="block font-semibold mb-1">Offensive Main Strategy</label>
          <input
            list="offenseMainList"
            value={offenseMainStrategy}
            onChange={(e) => setOffenseMainStrategy(e.target.value)}
            placeholder="e.g. Vertical Stack"
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
          <datalist id="offenseMainList">
            {distinctOffenseMain.map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>
        </div>

        {/* 10) Defensive Main Strategy (Datalist) */}
        <div>
          <label className="block font-semibold mb-1">Defensive Main Strategy</label>
          <input
            list="defenseMainList"
            value={defenseMainStrategy}
            onChange={(e) => setDefenseMainStrategy(e.target.value)}
            placeholder="e.g. Match Flick"
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
          <datalist id="defenseMainList">
            {distinctDefenseMain.map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>
        </div>

        {/* 11) Turns */}
        <div>
          <label className="block font-semibold mb-1">Turns</label>
          <input
            type="number"
            value={turns}
            onChange={(e) => setTurns(parseInt(e.target.value))}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
        </div>

        {/* 12) Did We Win Point? */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={wonPoint}
            onChange={(e) => setWonPoint(e.target.checked)}
          />
          <label className="font-semibold">Did we win this point?</label>
        </div>

        {/* 13) Notes */}
        <div>
          <label className="block font-semibold mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra info..."
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
            rows={3}
          />
        </div>

        {/* Submit & Cancel */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-md"
          >
            Add Point
          </button>
          <button
            type="button"
            onClick={() => navigate(`/game/${gameId}`)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 transition text-white rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

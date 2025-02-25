// src/pages/PointPage.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type SquadPlayer = {
  id: string;
  player_name: string;
};

type PointRecord = {
  id: string;
  game_id: string;
  point_number: number;

  point_video_url?: string;
  point_timestamp?: string;
  offense_or_defense?: "Offense" | "Defense";
  offense_initiation?: string;
  offense_initiation_successful?: boolean;
  defense_initiation?: string;
  defense_initiation_successful?: boolean;
  offense_main_strategy?: string;
  defense_main_strategy?: string;
  turns?: number;
  won_point?: boolean;
  notes?: string;
};

export default function PointPage() {
  const { pointId } = useParams<{ pointId: string }>();
  const navigate = useNavigate();

  // (1) Point Video URL
  const [pointVideoUrl, setPointVideoUrl] = useState("");
  // (2) Timestamp
  const [pointTimestamp, setPointTimestamp] = useState("");
  // (3) Offense/Defense
  const [offenseOrDefense, setOffenseOrDefense] = useState<"Offense" | "Defense">("Offense");

  // 7 dropdown slots
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

  const [gameId, setGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Squad data
  const [allPlayers, setAllPlayers] = useState<SquadPlayer[]>([]);

  // Distinct sets for datalist
  const [distinctOffenseInit, setDistinctOffenseInit] = useState<string[]>([]);
  const [distinctDefenseInit, setDistinctDefenseInit] = useState<string[]>([]);
  const [distinctOffenseMain, setDistinctOffenseMain] = useState<string[]>([]);
  const [distinctDefenseMain, setDistinctDefenseMain] = useState<string[]>([]);

  useEffect(() => {
    if (!pointId) return;

    (async () => {
      setLoading(true);
      setError(null);

      // 1) Fetch the point
      const { data: pointData, error: pointError } = await supabase
        .from("points")
        .select("*")
        .eq("id", pointId)
        .single();

      if (pointError) {
        setError(pointError.message);
        setLoading(false);
        return;
      }
      if (!pointData) {
        setError("Point not found.");
        setLoading(false);
        return;
      }

      const p = pointData as PointRecord;
      setPointVideoUrl(p.point_video_url || "");
      setPointTimestamp(p.point_timestamp || "");
      setOffenseOrDefense(p.offense_or_defense === "Defense" ? "Defense" : "Offense");
      setOffenseInitiation(p.offense_initiation || "");
      setOffenseInitiationSuccess(!!p.offense_initiation_successful);
      setDefenseInitiation(p.defense_initiation || "");
      setDefenseInitiationSuccess(!!p.defense_initiation_successful);
      setOffenseMainStrategy(p.offense_main_strategy || "");
      setDefenseMainStrategy(p.defense_main_strategy || "");
      setTurns(p.turns || 0);
      setWonPoint(!!p.won_point);
      setNotes(p.notes || "");
      setGameId(p.game_id);

      // 2) Fetch existing players in point_players
      const { data: ppData, error: ppError } = await supabase
        .from("point_players")
        .select("player_id")
        .eq("point_id", pointId);

      if (!ppError && ppData) {
        // up to 7 players
        const newSlots = Array(7).fill("");
        ppData.forEach((row: { player_id: string }, idx: number) => {
          if (idx < 7) {
            newSlots[idx] = row.player_id;
          }
        });
        setPlayerSlots(newSlots);
      }

      setLoading(false);
    })();
  }, [pointId]);

  // 3) Fetch squad + distinct sets
  useEffect(() => {
    // squad
    supabase
      .from("squad")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data) {
          setAllPlayers(data as SquadPlayer[]);
        }
      });

    // strategy columns
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
  }, []);

  // 7-slot dropdown
  function handlePlayerChange(index: number, playerId: string) {
    setPlayerSlots((prev) => {
      const newSlots = [...prev];
      newSlots[index] = playerId;
      return newSlots;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointId) {
      setError("No point ID in URL.");
      return;
    }

    // 1) Update the points table
    const { error: updateError } = await supabase
      .from("points")
      .update({
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
      })
      .eq("id", pointId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // 2) Delete old players, insert new
    await supabase.from("point_players").delete().eq("point_id", pointId);

    for (const pId of playerSlots) {
      if (pId) {
        await supabase
          .from("point_players")
          .insert([{ point_id: pointId, player_id: pId }]);
      }
    }

    // 3) Navigate back
    navigate(`/game/${gameId}`);
  };

  if (loading) {
    return (
      <div className="bg-[#1F1F1F] min-h-screen text-white p-6 w-full">
        <h1 className="text-3xl font-bold mb-6">Edit Point</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1F1F1F] min-h-screen text-white p-6 w-full">
        <h1 className="text-3xl font-bold mb-6">Edit Point</h1>
        <div className="bg-red-500 p-2 mb-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1F1F1F] min-h-screen text-white p-6 w-full">
      <h1 className="text-3xl font-bold mb-6">Edit Point</h1>

      <form onSubmit={handleSubmit} className="bg-[#2B2B2B] p-6 rounded-md shadow-md space-y-4 w-full">
        {/* (1) Point Video URL */}
        <div>
          <label className="block font-semibold mb-1">Clip URL (optional)</label>
          <input
            type="text"
            value={pointVideoUrl}
            onChange={(e) => setPointVideoUrl(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
        </div>

        {/* (2) Timestamp */}
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

        {/* (3) Offense/Defense */}
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

        {/* (4) 7 Dropdowns for players */}
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

        {/* (5) Offensive Initiation (Datalist) */}
        <div>
          <label className="block font-semibold mb-1">Offensive Initiation</label>
          <input
            list="offenseInitList"
            value={offenseInitiation}
            onChange={(e) => setOffenseInitiation(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
          <datalist id="offenseInitList">
            {distinctOffenseInit.map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>
        </div>

        {/* (6) Offensive Initiation Success */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={offenseInitiationSuccess}
            onChange={(e) => setOffenseInitiationSuccess(e.target.checked)}
          />
          <label className="font-semibold">Offensive Initiation Successful?</label>
        </div>

        {/* (7) Defensive Initiation (Datalist) */}
        <div>
          <label className="block font-semibold mb-1">Defensive Initiation</label>
          <input
            list="defenseInitList"
            value={defenseInitiation}
            onChange={(e) => setDefenseInitiation(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
          <datalist id="defenseInitList">
            {distinctDefenseInit.map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>
        </div>

        {/* (8) Defensive Initiation Success */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={defenseInitiationSuccess}
            onChange={(e) => setDefenseInitiationSuccess(e.target.checked)}
          />
          <label className="font-semibold">Defensive Initiation Successful?</label>
        </div>

        {/* (9) Offensive Main Strategy (Datalist) */}
        <div>
          <label className="block font-semibold mb-1">Offensive Main Strategy</label>
          <input
            list="offenseMainList"
            value={offenseMainStrategy}
            onChange={(e) => setOffenseMainStrategy(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
          <datalist id="offenseMainList">
            {distinctOffenseMain.map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>
        </div>

        {/* (10) Defensive Main Strategy (Datalist) */}
        <div>
          <label className="block font-semibold mb-1">Defensive Main Strategy</label>
          <input
            list="defenseMainList"
            value={defenseMainStrategy}
            onChange={(e) => setDefenseMainStrategy(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
          <datalist id="defenseMainList">
            {distinctDefenseMain.map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>
        </div>

        {/* (11) Turns */}
        <div>
          <label className="block font-semibold mb-1">Turns</label>
          <input
            type="number"
            value={turns}
            onChange={(e) => setTurns(parseInt(e.target.value))}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
        </div>

        {/* (12) Won Point */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={wonPoint}
            onChange={(e) => setWonPoint(e.target.checked)}
          />
          <label className="font-semibold">Did we win this point?</label>
        </div>

        {/* (13) Notes */}
        <div>
          <label className="block font-semibold mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
            rows={3}
          />
        </div>

        {/* Save & Cancel */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-md"
          >
            Save Changes
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

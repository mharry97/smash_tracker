// src/pages/GamePage.tsx

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { buildClipUrl } from "../utils/VideoHelpers.ts";

type Game = {
  id: string;
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
  won_point: boolean;
  point_video_url?: string;
  point_timestamp?: string;
  partialTeamScore?: number;
  partialOppScore?: number;
};

// Score color logic
function getScoreColor(teamScore: number, oppScore: number) {
  if (teamScore < oppScore) return "text-red-500";
  if (teamScore === oppScore) return "text-yellow-500";
  return "text-green-500";
}

// Win/Loss color logic
function getResultColor(won: boolean) {
  return won ? "text-green-500" : "text-red-500";
}

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();

  // Fetch the GAME
  const { data: gameData, isLoading: gameLoading } = useQuery({
    queryKey: ["game", gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();
      if (error) throw new Error(error.message);
      return data as Game;
    },
    enabled: !!gameId,
  });

  // Fetch POINTS
  const { data: pointsData, isLoading: pointsLoading } = useQuery({
    queryKey: ["points", gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("points")
        .select("*")
        .eq("game_id", gameId);
      if (error) throw new Error(error.message);
      return data as Point[];
    },
    enabled: !!gameId,
  });

  // Sort & compute partial scores
  const pointsWithScore = (() => {
    if (!pointsData) return [];
    const sorted = [...pointsData].sort((a, b) => a.point_number - b.point_number);

    let teamScoreSoFar = 0;
    let oppScoreSoFar = 0;

    return sorted.map((p) => {
      if (p.won_point) {
        teamScoreSoFar++;
      } else {
        oppScoreSoFar++;
      }
      return {
        ...p,
        partialTeamScore: teamScoreSoFar,
        partialOppScore: oppScoreSoFar,
      };
    });
  })();

  if (gameLoading || pointsLoading) {
    return (
      <div className="p-4 bg-[#1F1F1F] min-h-screen text-white w-full">
        <h1 className="text-3xl font-bold mb-4">Points</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#1F1F1F] min-h-screen text-white w-full">
      {/* Back to Games (Gray Button with White Text) */}
      <div className="mb-4">
        <Link
          to="/"
          className="px-4 py-2 hover:bg-gray-700 text-white transition rounded-md"
        >
          &larr; Back to Games
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Points</h1>

      <div className="flex flex-col gap-2 w-full">
        {pointsWithScore.map((p) => {
          const scoreColor = getScoreColor(p.partialTeamScore || 0, p.partialOppScore || 0);
          const resultColor = getResultColor(p.won_point);

          // Decide which initiation & main play to display
          const initiationPlay =
            p.offense_or_defense === "Offense" ? p.offense_initiation : p.defense_initiation;
          const mainPlay =
            p.offense_or_defense === "Offense"
              ? p.offense_main_strategy
              : p.defense_main_strategy;

          // Build watch link
          let finalClipUrl = "";
          if (p.point_video_url && p.point_video_url.trim() !== "") {
            finalClipUrl = p.point_video_url.trim();
          } else {
            const baseUrl = gameData?.footage_url ?? "";
            const timestamp = p.point_timestamp?.trim() ?? "";
            finalClipUrl = buildClipUrl(baseUrl, timestamp);
          }

          return (
            <Link
              key={p.id}
              to={`/point/${p.id}`}
              className="grid grid-cols-6 items-center bg-[#2B2B2B] border border-gray-700 
                         rounded-md p-2 hover:bg-[#3B3B3B] transition relative"
            >
              {/* SCORE (red/yellow/green) */}
              <div className={`${scoreColor} font-bold`}>
                {p.partialTeamScore} - {p.partialOppScore}
              </div>

              {/* Offense/Defense → white */}
              <div className="text-white">{p.offense_or_defense}</div>

              {/* Initiation Play → white */}
              <div className="text-white">{initiationPlay || "N/A"}</div>

              {/* Main Play → white */}
              <div className="text-white">{mainPlay || "N/A"}</div>

              {/* Win/Loss (red/green) */}
              <div className={`${resultColor} font-bold`}>
                {p.won_point ? "W" : "L"}
              </div>

              {/* Watch Clip → green button with white text */}
              <div>
                {finalClipUrl ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(finalClipUrl, "_blank");
                    }}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
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

        {/* Add Point (Gray Button with White Text) */}
        <div className="border border-gray-700 rounded-md p-2 text-center hover:bg-[#3B3B3B] cursor-pointer">
          <Link
            to={`/game/${gameId}/add-point`}
            className="px-4 py-2 hover:bg-gray-700 text-white transition rounded-md"
          >
            + Add Point
          </Link>
        </div>
      </div>
    </div>
  );
}

// src/pages/GamesList.tsx

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

type Game = {
  id: string;
  event: string;
  game_date: string;
  opponent: string;
};

type Point = {
  game_id: string;
  won_point: boolean;
};

function getScoreColor(teamScore: number, oppScore: number) {
  if (teamScore < oppScore) return "text-red-500";
  if (teamScore === oppScore) return "text-yellow-500";
  return "text-green-500";
}

export default function GamesList() {
  // Fetch all games
  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*");
      if (error) throw new Error(error.message);
      return data as Game[];
    },
  });

  // Fetch all points
  const { data: points, isLoading: pointsLoading } = useQuery({
    queryKey: ["pointsAll"],
    queryFn: async () => {
      const { data, error } = await supabase.from("points").select("game_id, won_point");
      if (error) throw new Error(error.message);
      return data as Point[];
    },
  });

  // Group points by game_id -> compute final scores
  const scoreMap: Record<string, { teamScore: number; opponentScore: number }> = {};

  if (points) {
    for (const p of points) {
      if (!scoreMap[p.game_id]) {
        scoreMap[p.game_id] = { teamScore: 0, opponentScore: 0 };
      }
      if (p.won_point) {
        scoreMap[p.game_id].teamScore += 1;
      } else {
        scoreMap[p.game_id].opponentScore += 1;
      }
    }
  }

  return (
    <div className="bg-[#1F1F1F] min-h-screen text-white p-6 w-full">
      <h1 className="text-3xl font-bold mb-6">Games</h1>

      {gamesLoading || pointsLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {/* Add Game Button */}
          <Link
            to="/add-game"
            className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-6 
                       flex flex-col items-center justify-center hover:bg-[#3B3B3B]"
          >
            <span className="text-6xl text-gray-400">+</span>
            <p className="mt-2 text-gray-300">Add Game</p>
          </Link>

          {/* Games */}
          {games?.map((game) => {
            const scores = scoreMap[game.id] || { teamScore: 0, opponentScore: 0 };
            const { teamScore, opponentScore } = scores;
            const colorClass = getScoreColor(teamScore, opponentScore);

            return (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-6 
                           hover:bg-[#3B3B3B] transition flex flex-col"
              >
                {/* Opponent name → white text */}
                <h2 className="text-xl font-semibold text-white">
                  {game.opponent}
                </h2>

                {/* Score color-coded */}
                <p className={`${colorClass} text-lg font-bold`}>
                  {teamScore} - {opponentScore}
                </p>

                <p className="text-gray-400">{game.event}</p>
                <p className="text-gray-500">{game.game_date}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

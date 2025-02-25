// src/pages/GamesList.tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

type Game = {
  id: string;
  event: string;
  game_date: string;
  opponent: string;
  footage_url?: string;
};

type Point = {
  game_id: string;
  won_point: boolean;
};

function getScoreColour(teamScore: number, oppScore: number) {
  if (teamScore < oppScore) return "#e72727"; // red
  if (teamScore === oppScore) return "#dc9934"; // Amber
  return "#28c61d"; // Green
}

export default function GamesList() {
  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*");
      if (error) throw new Error(error.message);
      return data as Game[];
    },
  });

  const { data: points, isLoading: pointsLoading } = useQuery({
    queryKey: ["pointsAll"],
    queryFn: async () => {
      const { data, error } = await supabase.from("points").select("game_id, won_point");
      if (error) throw new Error(error.message);
      return data as Point[];
    },
  });

  const scoreMap: Record<string, { teamScore: number; opponentScore: number }> = {};
  if (points) {
    points.forEach(p => {
      if (!scoreMap[p.game_id]) {
        scoreMap[p.game_id] = { teamScore: 0, opponentScore: 0 };
      }
      if (p.won_point) scoreMap[p.game_id].teamScore++;
      else scoreMap[p.game_id].opponentScore++;
    });
  }

  if (gamesLoading || pointsLoading) {
    return (
      <div className="bg-[#1F1F1F] min-h-screen text-white p-6 w-full">
        <h1 className="text-3xl font-bold text-center mb-4">Games List</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <header>
        <h1>Games List</h1>
      </header>
      <main className="tile_container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Add Game Tile */}
          <Link
            to="/add-game"
            className="tile_item"
          >
            <span className="tile_title">+ Add Game</span>
          </Link>
          {games?.map(game => {
            const score = scoreMap[game.id] || { teamScore: 0, opponentScore: 0 };
            const colourDyn = getScoreColour(score.teamScore, score.opponentScore);
            return (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className="tile_item"
              >
                <h2 className="tile_opponent">{game.opponent}</h2>
                <p className="tile_score" style={{ color: colourDyn }}>{score.teamScore} - {score.opponentScore}</p>
                <p className="tile_event">{game.event}</p>
                <p className="tile_date">{game.game_date}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// src/pages/AddGamePage.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AddGamePage() {
  const navigate = useNavigate();

  const [event, setEvent] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [footageUrl, setFootageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.from("games").insert([
      {
        event,
        game_date: gameDate,
        opponent,
        footage_url: footageUrl,
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      // Go back to home (games list)
      navigate("/");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Game</h1>

      {error && (
        <div className="bg-red-500 p-2 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-[#2B2B2B] p-6 rounded-md shadow-md space-y-4 w-full"
      >
        <div>
          <label htmlFor="event" className="block font-semibold mb-1">
            Event:
          </label>
          <input
            id="event"
            type="text"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="gameDate" className="block font-semibold mb-1">
            Date:
          </label>
          <input
            id="gameDate"
            type="date"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="opponent" className="block font-semibold mb-1">
            Opponent:
          </label>
          <input
            id="opponent"
            type="text"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="footageUrl" className="block font-semibold mb-1">
            Footage URL:
          </label>
          <input
            id="footageUrl"
            type="text"
            value={footageUrl}
            onChange={(e) => setFootageUrl(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3B3B3B] border border-gray-600 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-md"
          >
            Add Game
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 transition text-white rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

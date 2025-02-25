// src/pages/HomePage.tsx
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="wrapper">
      <header>
        <h1>Frisbee Footage Tracker</h1>
      </header>
      <main className="tile_container">
        <Link
          to="/game"
          className="tile_item"
        >
          <span className="tile_title">Games</span>
        </Link>
        <Link
          to="/point-search"
          className="tile_item"
        >
          <span className="tile_title">Point Search</span>
        </Link>
        <Link
          to="/stats"
          className="tile_item"
        >
          <span className="tile_title">Stats</span>
        </Link>
      </main>
    </div>
  );
}

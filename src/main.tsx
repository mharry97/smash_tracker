import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import HomePage from "./pages/HomePage.tsx";
import GamesList from "./pages/GamesList.tsx";
import GamePage from "./pages/GamePage";
import PointPage from "./pages/PointPage";
import AddPointPage from "./pages/AddPointPage";
import AddGamePage from "./pages/AddGamePage.tsx";
import StatsPage from "./pages/StatsPage.tsx";
import PointsSearch from "./pages/PointsSearch.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamesList />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/point/:pointId" element={<PointPage />} />
        <Route path="/game/:gameId/add-point" element={<AddPointPage />} />
        <Route path="/add-game" element={<AddGamePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/point-search" element={<PointsSearch />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);


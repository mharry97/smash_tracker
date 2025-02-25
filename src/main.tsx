import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import PointPage from "./pages/PointPage";
import AddPointPage from "./pages/AddPointPage";
import AddGamePage from "./pages/AddGamePage.tsx"; // <-- Import here

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/point/:pointId" element={<PointPage />} />
        <Route path="/game/:gameId/add-point" element={<AddPointPage />} />
        <Route path="/add-game" element={<AddGamePage />} /> {/* <-- New route */}
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);


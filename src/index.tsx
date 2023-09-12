import "@vetixy/circular-std";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TopBar from "./components/TopBar";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { routes } from "./routes";
import { Dashboard } from "./pages/Dashboard";
import { FromPlaylist } from "./pages/FromPlaylist";
import { FromSong } from "./pages/FromSong";
import { FromGenre } from "./pages/FromGenre";
import SpotifyLogin from "./pages/SpotifyLogin";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import strings from "./data/strings.json";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

i18next.use(initReactI18next).init({
  resources: {
    en: {
      translation: strings,
    },
  },
  lng: "en",
});

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route path={routes.dashboard} element={<Dashboard />} />
        <Route path={routes.fromPlaylist} element={<FromPlaylist />} />
        <Route path={routes.fromSong} element={<FromSong />} />
        <Route path={routes.fromGenre} element={<FromGenre />} />
        <Route path={routes.login} element={<SpotifyLogin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

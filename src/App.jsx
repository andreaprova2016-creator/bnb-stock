import { useEffect, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { useAuth } from "./lib/auth.jsx";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import StayConfirm from "./pages/StayConfirm.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  const { session } = useAuth();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("listings")
      .select("name, logo_url")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setListing(data));
  }, [session]);

  if (session === undefined) {
    return <p className="muted" style={{ padding: 20 }}>Carico…</p>;
  }

  if (!session) {
    return <Login />;
  }

  const watermarkStyle = listing?.logo_url
    ? { "--watermark-url": `url(${listing.logo_url})` }
    : undefined;

  return (
    <div className="app-shell" style={watermarkStyle}>
      <header className="topbar">
        <span className="topbar-mark">BnB Stock</span>
        <span className="topbar-property">{listing?.name ?? "…"}</span>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stay/:stayId" element={<StayConfirm />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <nav className="tabbar">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "tab active" : "tab")}>
          Magazzino
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "tab active" : "tab")}>
          Impostazioni
        </NavLink>
      </nav>
    </div>
  );
}

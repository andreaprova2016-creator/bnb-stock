import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import StayConfirm from "./pages/StayConfirm.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="topbar-mark">BnB Stock</span>
        <span className="topbar-property">Casa Angelina</span>
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

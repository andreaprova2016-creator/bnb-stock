import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [listingName, setListingName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { listing_name: listingName || "La mia struttura" } },
      });
      setLoading(false);
      if (error) {
        setStatus(error.message);
      } else {
        setStatus(
          "Account creato. Se richiesto, controlla la mail per confermare l'indirizzo, poi accedi."
        );
        setMode("login");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setStatus(error.message);
  }

  return (
    <div className="login-page">
      <h1>BnB Stock</h1>
      <p className="muted">
        {mode === "login"
          ? "Accedi per gestire il magazzino della tua struttura."
          : "Crea un account: avrai il tuo magazzino personale, separato dagli altri."}
      </p>

      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <label className="field">
            <span>Nome della struttura</span>
            <input
              type="text"
              placeholder="es. Casa Angelina"
              value={listingName}
              onChange={(e) => setListingName(e.target.value)}
            />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Un attimo…" : mode === "login" ? "Accedi" : "Crea account"}
        </button>
      </form>

      {status && <p className="muted">{status}</p>}

      <button
        className="link-button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setStatus("");
        }}
      >
        {mode === "login" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
      </button>
    </div>
  );
}

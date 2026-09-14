import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [pendingStays, setPendingStays] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: prods }, { data: stays }] = await Promise.all([
      supabase.from("products").select("*").order("sort_order"),
      supabase
        .from("stays")
        .select("id, check_in, check_out")
        .eq("status", "pending_guest_count")
        .order("check_in"),
    ]);
    setProducts(prods ?? []);
    setPendingStays(stays ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function adjustStock(product, delta) {
    const newStock = Math.max(0, product.current_stock + delta);
    await supabase.from("products").update({ current_stock: newStock }).eq("id", product.id);
    await supabase.from("stock_movements").insert({
      product_id: product.id,
      change: delta,
      reason: "correzione",
    });
    load();
  }

  if (loading) return <p className="muted">Carico il magazzino…</p>;

  return (
    <div>
      {pendingStays.length > 0 && (
        <section className="pending-block">
          <h2>Da confermare</h2>
          {pendingStays.map((s) => (
            <Link key={s.id} to={`/stay/${s.id}`} className="pending-row">
              <span>
                {new Date(s.check_in).toLocaleDateString("it-IT")} →{" "}
                {new Date(s.check_out).toLocaleDateString("it-IT")}
              </span>
              <span className="chevron">Quanti ospiti? ›</span>
            </Link>
          ))}
        </section>
      )}

      <section className="shelf">
        <h2>Scorte</h2>
        {products.map((p) => {
          const low = p.current_stock <= p.low_stock_threshold;
          const pct = Math.min(100, Math.round((p.current_stock / (p.low_stock_threshold * 4)) * 100));
          return (
            <div className={`shelf-row ${low ? "low" : ""}`} key={p.id}>
              <div className="shelf-row-top">
                <span className="product-name">{p.name}</span>
                <span className="product-count">
                  {p.current_stock} <small>{p.unit_label}</small>
                </span>
              </div>
              <div className="stock-bar">
                <div className="stock-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="shelf-row-controls">
                <button onClick={() => adjustStock(p, -1)} aria-label="Togli 1">
                  −
                </button>
                <button onClick={() => adjustStock(p, 1)} aria-label="Aggiungi 1">
                  +
                </button>
                {low && <span className="low-tag">sotto soglia ({p.low_stock_threshold})</span>}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

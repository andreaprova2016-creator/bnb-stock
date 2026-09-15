import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { enablePushNotifications } from "../lib/push";

export default function Settings() {
  const [listing, setListing] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedPlatform, setNewFeedPlatform] = useState("airbnb");
  const [pushStatus, setPushStatus] = useState("");
  const [products, setProducts] = useState([]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductUnit, setNewProductUnit] = useState("pz");
  const [newProductStock, setNewProductStock] = useState(50);
  const [newProductThreshold, setNewProductThreshold] = useState(10);
  const [newProductMode, setNewProductMode] = useState("per_guest");

  async function load() {
    const { data: listings } = await supabase.from("listings").select("*").limit(1);
    const l = listings?.[0];
    setListing(l);
    if (l) {
      const { data: f } = await supabase.from("calendar_feeds").select("*").eq("listing_id", l.id);
      setFeeds(f ?? []);
      const { data: p } = await supabase
        .from("products")
        .select("id, name, sort_order")
        .eq("listing_id", l.id)
        .order("sort_order");
      setProducts(p ?? []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addFeed() {
    if (!newFeedUrl.trim()) return;
    await supabase.from("calendar_feeds").insert({
      listing_id: listing.id,
      platform: newFeedPlatform,
      ical_url: newFeedUrl.trim(),
    });
    setNewFeedUrl("");
    load();
  }

  async function removeFeed(id) {
    await supabase.from("calendar_feeds").delete().eq("id", id);
    load();
  }

  async function addProduct() {
    if (!newProductName.trim()) return;
    const nextOrder = products.length
      ? Math.max(...products.map((p) => p.sort_order)) + 1
      : 1;
    await supabase.from("products").insert({
      listing_id: listing.id,
      name: newProductName.trim(),
      unit_label: newProductUnit,
      current_stock: Number(newProductStock) || 0,
      low_stock_threshold: Number(newProductThreshold) || 10,
      deduction_mode: newProductMode,
      sort_order: nextOrder,
    });
    setNewProductName("");
    setNewProductStock(50);
    setNewProductThreshold(10);
    load();
  }

  async function handleEnablePush() {
    setPushStatus("Attivo…");
    try {
      await enablePushNotifications(listing.id);
      setPushStatus("Notifiche attive su questo iPhone ✓");
    } catch (e) {
      setPushStatus(e.message);
    }
  }

  if (!listing) return <p className="muted">Carico…</p>;

  return (
    <div className="settings-page">
      <section>
        <h2>Notifiche</h2>
        <p className="muted">
          Attiva le notifiche su questo iPhone per essere avvisato di nuove prenotazioni e
          scorte basse. Su iPhone funziona solo dopo aver aggiunto BnB Stock alla schermata Home
          (condividi → "Aggiungi a Home").
        </p>
        <button className="primary" onClick={handleEnablePush}>
          Attiva notifiche
        </button>
        {pushStatus && <p className="muted">{pushStatus}</p>}
      </section>

      <section>
        <h2>Aggiungi prodotto</h2>
        <p className="muted">
          Aggiungi un nuovo articolo al magazzino, oltre ai 5 già previsti.
        </p>
        <label className="field">
          <span>Nome prodotto</span>
          <input
            type="text"
            placeholder="es. Acqua in bottiglia"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Unità di misura</span>
          <select value={newProductUnit} onChange={(e) => setNewProductUnit(e.target.value)}>
            <option value="pz">pz (pezzi)</option>
            <option value="rotoli">rotoli</option>
            <option value="kit">kit</option>
            <option value="bustine">bustine</option>
          </select>
        </label>
        <label className="field">
          <span>Scorta iniziale</span>
          <input
            type="number"
            min={0}
            value={newProductStock}
            onChange={(e) => setNewProductStock(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Avviso sotto</span>
          <input
            type="number"
            min={0}
            value={newProductThreshold}
            onChange={(e) => setNewProductThreshold(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Come si scarica</span>
          <select value={newProductMode} onChange={(e) => setNewProductMode(e.target.value)}>
            <option value="per_guest">1 a ospite (come cialde, tè, kit cortesia)</option>
            <option value="per_stay">1 a soggiorno (come carta igienica)</option>
          </select>
        </label>
        <button className="primary" onClick={addProduct}>
          Aggiungi al magazzino
        </button>
      </section>

      <section>
        <h2>Calendari collegati</h2>
        {feeds.map((f) => (
          <div className="feed-row" key={f.id}>
            <span>{f.platform}</span>
            <span className="feed-url">{f.ical_url}</span>
            <button onClick={() => removeFeed(f.id)}>Rimuovi</button>
          </div>
        ))}

        <div className="feed-add">
          <select value={newFeedPlatform} onChange={(e) => setNewFeedPlatform(e.target.value)}>
            <option value="airbnb">Airbnb</option>
            <option value="booking">Booking.com</option>
            <option value="vrbo">Vrbo</option>
            <option value="altro">Altro</option>
          </select>
          <input
            type="url"
            placeholder="Incolla qui il link .ics"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
          />
          <button className="primary" onClick={addFeed}>
            Aggiungi
          </button>
        </div>
      </section>
    </div>
  );
}

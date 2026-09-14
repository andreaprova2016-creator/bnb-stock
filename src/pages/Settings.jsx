import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { enablePushNotifications } from "../lib/push";

export default function Settings() {
  const [listing, setListing] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedPlatform, setNewFeedPlatform] = useState("airbnb");
  const [pushStatus, setPushStatus] = useState("");

  async function load() {
    const { data: listings } = await supabase.from("listings").select("*").limit(1);
    const l = listings?.[0];
    setListing(l);
    if (l) {
      const { data: f } = await supabase.from("calendar_feeds").select("*").eq("listing_id", l.id);
      setFeeds(f ?? []);
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

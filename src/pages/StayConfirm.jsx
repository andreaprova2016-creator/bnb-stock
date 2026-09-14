import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function StayConfirm() {
  const { stayId } = useParams();
  const navigate = useNavigate();
  const [stay, setStay] = useState(null);
  const [guestCount, setGuestCount] = useState(2);
  const [toiletPaperQty, setToiletPaperQty] = useState(1);
  const [toiletPaperProductId, setToiletPaperProductId] = useState(null);
  const [maxGuests, setMaxGuests] = useState(4);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase
        .from("stays")
        .select("*, listings(max_guests)")
        .eq("id", stayId)
        .single();
      setStay(s);
      setMaxGuests(s?.listings?.max_guests ?? 4);
      setGuestCount(s?.listings?.max_guests ?? 2);

      const { data: tp } = await supabase
        .from("products")
        .select("id")
        .eq("listing_id", s.listing_id)
        .eq("deduction_mode", "per_stay")
        .maybeSingle();
      setToiletPaperProductId(tp?.id ?? null);
    })();
  }, [stayId]);

  async function confirm() {
    setSaving(true);
    const overrides = toiletPaperProductId ? { [toiletPaperProductId]: toiletPaperQty } : {};
    const { error } = await supabase.functions.invoke("confirm-guests", {
      body: { stay_id: stayId, guest_count: guestCount, per_stay_overrides: overrides },
    });
    setSaving(false);
    if (!error) navigate("/");
  }

  if (!stay) return <p className="muted">Carico…</p>;

  return (
    <div className="confirm-page">
      <h2>Nuova prenotazione</h2>
      <p className="muted">
        {new Date(stay.check_in).toLocaleDateString("it-IT")} →{" "}
        {new Date(stay.check_out).toLocaleDateString("it-IT")} · {stay.nights} notti
      </p>

      <label className="field">
        <span>Numero ospiti</span>
        <input
          type="number"
          min={1}
          max={maxGuests}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
        />
      </label>

      <label className="field">
        <span>Carta igienica (rotoli per questo soggiorno)</span>
        <input
          type="number"
          min={0}
          value={toiletPaperQty}
          onChange={(e) => setToiletPaperQty(Number(e.target.value))}
        />
      </label>

      <button className="primary" onClick={confirm} disabled={saving}>
        {saving ? "Aggiorno il magazzino…" : "Conferma e scala il magazzino"}
      </button>
    </div>
  );
}

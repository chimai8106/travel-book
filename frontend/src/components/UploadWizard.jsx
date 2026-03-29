import { useState, useRef } from "react";

const MOODS = ["🤩 Adventurous", "💕 Romantic", "😂 Hilarious", "🌿 Peaceful", "🔥 Wild", "🎭 Cultural", "👻 Spooky", "✨ Magical", "🍹 Relaxed", "💪 Epic"];
const MAX_PHOTOS_PER_PLACE = 5;
const MAX_CHARS = 2000;
const MIN_CHARS = 10;

function Pill({ children, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.45rem 1.1rem", borderRadius: "100px", border: "2.5px solid currentColor",
      background: active ? color : "transparent", color: active ? "#fff" : color,
      fontWeight: 700, fontSize: "0.82rem", transition: "all 0.15s",
      boxShadow: active ? "2px 2px 0 #1A1209" : "none",
      transform: active ? "translate(-1px,-1px)" : "none",
    }}>{children}</button>
  );
}

function StepDot({ index, current, label, color }) {
  const done = index < current;
  const active = index === current;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <div style={{
        width: active ? 36 : 28, height: 28, borderRadius: active ? "14px" : "50%",
        background: done ? color : active ? color : "transparent",
        border: `2.5px solid ${done || active ? color : "#ccc"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.75rem", fontWeight: 800, color: done || active ? "#fff" : "#ccc",
        transition: "all 0.3s",
      }}>{done ? "✓" : index + 1}</div>
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: active ? color : "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

// A single place card in step 1
function PlaceCard({ place, index, p, onChange, onRemove, canRemove }) {
  const photoRef = useRef();

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, MAX_PHOTOS_PER_PLACE);
    onChange({ ...place, photos: files });
  };

  const toggleMood = (m) => {
    const moods = place.moods.includes(m)
      ? place.moods.filter((x) => x !== m)
      : [...place.moods, m];
    onChange({ ...place, moods });
  };

  return (
    <div style={{
      background: p.card,
      border: `3px solid ${p.hero}44`,
      borderRadius: "20px",
      padding: "1.5rem",
      marginBottom: "1rem",
      position: "relative",
    }}>
      {/* Place number badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{
          background: p.hero, color: "#fff",
          fontSize: "0.72rem", fontWeight: 800,
          padding: "0.3rem 0.9rem", borderRadius: "100px",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          📍 Place {index + 1}
        </div>
        {canRemove && (
          <button onClick={onRemove} style={{
            background: "transparent", border: "none",
            color: "#E05A00", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer",
          }}>✕ Remove</button>
        )}
      </div>

      {/* Name */}
      <div style={{ marginBottom: "0.875rem" }}>
        <label style={{ display: "block", fontWeight: 800, fontSize: "0.82rem", color: p.text, marginBottom: "0.3rem" }}>Place name 📍</label>
        <input
          value={place.name}
          onChange={(e) => onChange({ ...place, name: e.target.value })}
          placeholder="e.g. South Beach"
          style={{ width: "100%", background: p.card, border: `2.5px solid ${place.name ? p.hero : "#ddd"}`, borderRadius: "10px", padding: "0.7rem 0.875rem", fontSize: "0.95rem", color: p.text, outline: "none", fontWeight: 600, boxSizing: "border-box" }}
        />
      </div>

      {/* Date */}
      <div style={{ marginBottom: "0.875rem" }}>
        <label style={{ display: "block", fontWeight: 800, fontSize: "0.82rem", color: p.text, marginBottom: "0.3rem" }}>Date 📅</label>
        <input
          value={place.date}
          onChange={(e) => onChange({ ...place, date: e.target.value })}
          placeholder="e.g. March 10, 2025"
          style={{ width: "100%", background: p.card, border: `2.5px solid ${place.date ? p.secondary : "#ddd"}`, borderRadius: "10px", padding: "0.7rem 0.875rem", fontSize: "0.95rem", color: p.text, outline: "none", fontWeight: 600, boxSizing: "border-box" }}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: "0.875rem" }}>
        <label style={{ display: "block", fontWeight: 800, fontSize: "0.82rem", color: p.text, marginBottom: "0.3rem" }}>What happened here? ✍️</label>
        <textarea
          value={place.description}
          onChange={(e) => onChange({ ...place, description: e.target.value })}
          rows={3}
          placeholder="e.g. We spent the morning walking along the shore..."
          style={{ width: "100%", background: p.card, border: `2.5px solid ${place.description ? p.tertiary : "#ddd"}`, borderRadius: "10px", padding: "0.7rem 0.875rem", fontSize: "0.88rem", color: p.text, outline: "none", fontWeight: 600, resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
        />
      </div>

      {/* Mood */}
      <div style={{ marginBottom: "0.875rem" }}>
        <label style={{ display: "block", fontWeight: 800, fontSize: "0.82rem", color: p.text, marginBottom: "0.4rem" }}>Vibe 🎭</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {MOODS.map((m) => (
            <Pill key={m} active={place.moods.includes(m)} color={p.hero} onClick={() => toggleMood(m)}>{m}</Pill>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label style={{ display: "block", fontWeight: 800, fontSize: "0.82rem", color: p.text, marginBottom: "0.4rem" }}>
          Photos 📷 <span style={{ color: p.muted, fontWeight: 600 }}>(up to {MAX_PHOTOS_PER_PLACE})</span>
        </label>
        <div
          onClick={() => photoRef.current.click()}
          style={{
            border: `2.5px dashed ${place.photos.length ? p.hero : "#ccc"}`,
            borderRadius: "12px", padding: "1rem",
            textAlign: "center", cursor: "pointer",
            background: place.photos.length ? `${p.hero}0D` : p.card,
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: "1.4rem" }}>📷</span>
          <span style={{ fontWeight: 700, color: p.text, marginLeft: "0.5rem", fontSize: "0.9rem" }}>
            {place.photos.length ? `${place.photos.length} photo${place.photos.length > 1 ? "s" : ""} added ✓` : "Click to add photos"}
          </span>
          <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotos} />
        </div>

        {place.photos.length > 0 && (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
            {place.photos.map((f, i) => (
              <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", border: `2px solid ${p.text}` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function newPlace() {
  return { name: "", date: "", moods: [], description: "", photos: [] };
}

export default function UploadWizard({ p, onNext, onBack }) {
  const [step, setStep] = useState(0);
  const [tripName, setTripName] = useState("");
  const [places, setPlaces] = useState([newPlace()]);
  const [memories, setMemories] = useState("");

  const isOverLimit = memories.length > MAX_CHARS;
  const charPct = (memories.length / MAX_CHARS) * 100;

  const canNext = [
    tripName.trim().length > 0,
    places.every((pl) => pl.name.trim()) && places.some((pl) => pl.photos.length > 0),
    memories.length >= MIN_CHARS && !isOverLimit,
  ][step];

  const updatePlace = (i, updated) => {
    setPlaces((prev) => prev.map((p, idx) => (idx === i ? updated : p)));
  };

  const removePlace = (i) => setPlaces((prev) => prev.filter((_, idx) => idx !== i));

  const addPlace = () => setPlaces((prev) => [...prev, newPlace()]);

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
    else onNext({ tripName, places, memories });
  };

  const STEPS = ["Trip Name", "Places", "Memories"];
  const COLORS = [p.hero, p.secondary, p.tertiary];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "1.25rem 2.5rem", borderBottom: `3px solid ${p.text}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: p.card }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: p.text }}>
          Postcard<span style={{ color: p.hero }}>I Never Send</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {STEPS.map((s, i) => <StepDot key={s} index={i} current={step} label={s} color={COLORS[i]} />)}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "620px" }}>

          {/* STEP 0 — Trip name */}
          {step === 0 && (
            <div style={{ animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: p.hero, marginBottom: "0.5rem" }}>Step 1 of 3</div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "0.3rem", letterSpacing: "-0.02em", color: p.text }}>Name your trip ✈️</h2>
              <p style={{ color: p.muted, marginBottom: "1.5rem", fontWeight: 600 }}>This becomes the title of your storybook</p>

              <input
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g. Chaotic Miami Weekend"
                style={{
                  width: "100%", background: p.card,
                  border: `2.5px solid ${tripName ? p.hero : "#ddd"}`,
                  borderRadius: "14px", padding: "1rem 1.25rem",
                  fontSize: "1.1rem", color: p.text, outline: "none",
                  fontWeight: 600, transition: "border 0.2s",
                  boxShadow: tripName ? `3px 3px 0 ${p.hero}33` : "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: "0.72rem", color: p.muted, fontWeight: 600, marginTop: "0.5rem" }}>
                💡 Keep it fun - "Lost in Lisbon" beats "Portugal Trip 2025"
              </div>
            </div>
          )}

          {/* STEP 1 — Places */}
          {step === 1 && (
            <div style={{ animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: p.secondary, marginBottom: "0.5rem" }}>Step 2 of 3</div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "0.3rem", letterSpacing: "-0.02em", color: p.text }}>Where did you go? 🗺</h2>
              <p style={{ color: p.muted, marginBottom: "1.25rem", fontWeight: 600 }}>
                Add each place you visited — each gets its own chapter
              </p>

              <div style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: "4px" }}>
                {places.map((place, i) => (
                  <PlaceCard
                    key={i}
                    index={i}
                    place={place}
                    p={p}
                    onChange={(updated) => updatePlace(i, updated)}
                    onRemove={() => removePlace(i)}
                    canRemove={places.length > 1}
                  />
                ))}
              </div>

              {places.length < 10 && (
                <button
                  onClick={addPlace}
                  style={{
                    width: "100%", background: "transparent",
                    border: `2.5px dashed ${p.hero}66`,
                    borderRadius: "16px", padding: "0.875rem",
                    color: p.hero, fontWeight: 800, fontSize: "0.95rem",
                    marginTop: "0.5rem", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${p.hero}0D`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  + Add another place
                </button>
              )}
            </div>
          )}

          {/* STEP 2 — Memories */}
          {step === 2 && (
            <div style={{ animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: p.tertiary, marginBottom: "0.5rem" }}>Step 3 of 3</div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "0.3rem", letterSpacing: "-0.02em", color: p.text }}>The good stuff 💫</h2>
              <p style={{ color: p.muted, marginBottom: "1rem", fontWeight: 600 }}>Any overall memories or moments from the whole trip?</p>

              <textarea
                value={memories}
                onChange={(e) => { if (e.target.value.length <= MAX_CHARS + 50) setMemories(e.target.value); }}
                rows={8}
                placeholder="e.g. The highlight was definitely getting lost and finding that tiny jazz bar on the last night..."
                style={{
                  width: "100%", background: p.card,
                  border: `2.5px solid ${isOverLimit ? "#E05A00" : memories.length > MIN_CHARS ? p.tertiary : "#ddd"}`,
                  borderRadius: "16px", padding: "1.25rem",
                  fontSize: "0.95rem", color: p.text, outline: "none",
                  lineHeight: 1.7, resize: "vertical", fontWeight: 600,
                  boxSizing: "border-box",
                }}
              />

              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: p.muted }}>
                    {memories.length < MIN_CHARS ? `Write at least ${MIN_CHARS - memories.length} more chars` : isOverLimit ? `⚠️ ${memories.length - MAX_CHARS} chars over limit` : "🪄 More detail = better story"}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isOverLimit ? "#E05A00" : charPct > 80 ? "#F5A623" : p.tertiary }}>
                    {memories.length} / {MAX_CHARS}
                  </span>
                </div>
                <div style={{ height: 6, background: "#eee", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(charPct, 100)}%`, background: isOverLimit ? "#E05A00" : charPct > 80 ? "#F5A623" : p.tertiary, borderRadius: "100px", transition: "width 0.2s" }} />
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem" }}>
            <button
              onClick={step === 0 ? onBack : () => setStep((s) => s - 1)}
              style={{ background: "transparent", border: `2.5px solid ${p.text}`, color: p.text, padding: "0.75rem 1.5rem", borderRadius: "100px", fontWeight: 800, fontSize: "0.9rem", boxShadow: `2px 2px 0 ${p.text}` }}
            >← Back</button>
            <button
              onClick={handleNext}
              disabled={!canNext}
              style={{
                background: canNext ? COLORS[step] : "#eee",
                color: canNext ? "#fff" : "#bbb",
                border: `2.5px solid ${canNext ? p.text : "transparent"}`,
                padding: "0.85rem 2.5rem", borderRadius: "100px",
                fontWeight: 800, fontSize: "1rem",
                boxShadow: canNext ? `4px 4px 0 ${p.text}` : "none",
                transition: "all 0.15s",
              }}
            >
              {step === 2 ? "Pick my format →" : "Next step →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useRef } from "react";

const MOODS = ["🤩 Adventurous", "💕 Romantic", "😂 Hilarious", "🌿 Peaceful", "🔥 Wild", "🎭 Cultural", "👻 Spooky", "✨ Magical", "🍹 Relaxed", "💪 Epic"];
const MAX_PHOTOS = 50;
const MAX_VIDEOS = 50;
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
        transition: "all 0.3s", fontFamily: "'Syne', sans-serif",
      }}>{done ? "✓" : index + 1}</div>
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: active ? color : "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

function InfoBadge({ icon, text, color }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: `${color}18`, border: `1.5px solid ${color}44`, borderRadius: "8px", padding: "0.3rem 0.65rem", fontSize: "0.72rem", fontWeight: 700, color }}>
      <span>{icon}</span><span>{text}</span>
    </div>
  );
}

function LimitBar({ used, max, color, label }) {
  const pct = Math.min((used / max) * 100, 100);
  const isNear = pct >= 80;
  const isFull = used >= max;
  return (
    <div style={{ marginTop: "0.6rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: isFull ? "#E05A00" : color }}>{label}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: isFull ? "#E05A00" : isNear ? "#E05A00" : color }}>
          {used} / {max} {isFull ? "🚫 Full!" : isNear ? "⚠️ Almost full" : ""}
        </span>
      </div>
      <div style={{ height: 6, background: "#eee", borderRadius: "100px", overflow: "hidden", border: "1px solid #ddd" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: isFull ? "#E05A00" : isNear ? "#F5A623" : color, borderRadius: "100px", transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

export default function UploadWizard({ p, onNext, onBack }) {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ tripName: "", destination: "", dates: "" });
  const [moods, setMoods] = useState([]);
  const [memories, setMemories] = useState("");
  const photoRef = useRef();
  const videoRef = useRef();

  const totalMedia = photos.length + videos.length;
  const charPct = (memories.length / MAX_CHARS) * 100;
  const isOverLimit = memories.length > MAX_CHARS;

  const canNext = [
    photos.length > 0 && totalMedia <= MAX_PHOTOS + MAX_VIDEOS,
    form.tripName && form.destination,
    memories.length > MIN_CHARS && !isOverLimit,
  ][step];

  const toggleMood = m => setMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const handlePhotoChange = e => setPhotos(Array.from(e.target.files).slice(0, MAX_PHOTOS));

  const handleVideoChange = e => setVideos(Array.from(e.target.files).slice(0, MAX_VIDEOS));

  const handleNext = () => {
    if (step < 2) setStep(s => s + 1);
    else onNext({ photos, videos, ...form, moods, memories });
  };

  const STEPS = ["Media", "Details", "Memories"];
  const COLORS = [p.hero, p.secondary, p.tertiary];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "1.25rem 2.5rem", borderBottom: `3px solid ${p.text}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: p.card }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: p.text }}>
          Postcards<span style={{ color: p.hero }}>I Never Send</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {STEPS.map((s, i) => <StepDot key={s} index={i} current={step} label={s} color={COLORS[i]} />)}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "600px" }}>

          {/* STEP 0 — Media */}
          {step === 0 && (
            <div style={{ animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: p.hero, marginBottom: "0.5rem" }}>Step 1 of 3</div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "0.3rem", letterSpacing: "-0.02em", color: p.text }}>Drop your memories in</h2>
              <p style={{ color: p.muted, marginBottom: "0.75rem", fontWeight: 600 }}>Photos first — the more the merrier! 🎉</p>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                <InfoBadge icon="📷" text="Max 50 photos" color={p.hero} />
                <InfoBadge icon="🎥" text="Max 50 videos" color={p.tertiary} />
                <InfoBadge icon="⏱" text="≤ 30s per video" color={p.secondary} />
                <InfoBadge icon="📦" text="50MB per file" color={p.muted} />
              </div>

              <div onClick={() => photoRef.current.click()} style={{
                border: `3px dashed ${photos.length ? p.hero : "#ccc"}`, borderRadius: "20px", padding: "2rem",
                textAlign: "center", cursor: "pointer", background: photos.length ? `${p.hero}0D` : p.card,
                transition: "all 0.2s", marginBottom: "0.75rem",
                boxShadow: photos.length ? `4px 4px 0 ${p.hero}44` : "none",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📷</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: p.text, marginBottom: "0.2rem" }}>
                  {photos.length ? `${photos.length} photo${photos.length > 1 ? "s" : ""} loaded! 🙌` : "Click to add photos"}
                </div>
                <div style={{ color: p.muted, fontSize: "0.78rem", fontWeight: 600 }}>JPG, PNG, HEIC · max 50 photos · 50MB each</div>
                <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotoChange} />
              </div>

              {photos.length > 0 && (
                <>
                  <LimitBar used={photos.length} max={MAX_PHOTOS} color={p.hero} label="Photos used" />
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.75rem 0" }}>
                    {photos.slice(0, 8).map((f, i) => (
                      <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", border: `2px solid ${p.text}` }} />
                    ))}
                    {photos.length > 8 && <div style={{ width: 60, height: 60, borderRadius: 10, background: p.hero, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.85rem", border: `2px solid ${p.text}` }}>+{photos.length - 8}</div>}
                  </div>
                </>
              )}

              <div onClick={() => videoRef.current.click()} style={{
                border: `2px dashed ${videos.length ? p.tertiary : "#ccc"}`, borderRadius: "14px", padding: "1.1rem",
                textAlign: "center", cursor: "pointer", background: videos.length ? `${p.tertiary}0D` : p.card, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: "1.4rem" }}>🎥</span>
                <span style={{ fontWeight: 700, color: p.text, marginLeft: "0.75rem", fontSize: "0.95rem" }}>
                  {videos.length ? `${videos.length} video${videos.length > 1 ? "s" : ""} added ✓` : "Add videos (optional)"}
                </span>
                <div style={{ color: p.muted, fontSize: "0.72rem", fontWeight: 600, marginTop: "0.2rem" }}>Max 50 videos · each must be 30 seconds or under</div>
                <input ref={videoRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={handleVideoChange} />
              </div>

              {videos.length > 0 && <LimitBar used={videos.length} max={MAX_VIDEOS} color={p.tertiary} label="Videos used" />}

              {totalMedia > 0 && (
                <div style={{ marginTop: "0.75rem", padding: "0.6rem 1rem", background: totalMedia >= 90 ? "#FFF3D6" : `${p.hero}0D`, border: `1.5px solid ${totalMedia >= 90 ? "#E05A00" : p.hero}44`, borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: p.text }}>Total media</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: totalMedia >= 90 ? "#E05A00" : p.hero }}>{totalMedia} / 100 files</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — Details */}
          {step === 1 && (
            <div style={{ animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: p.secondary, marginBottom: "0.5rem" }}>Step 2 of 3</div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "0.4rem", letterSpacing: "-0.02em", color: p.text }}>Where did you go? 🗺</h2>
              <p style={{ color: p.muted, marginBottom: "1.5rem", fontWeight: 600 }}>Tell us the basics</p>

              {[
                { key: "tripName",    label: "Give this trip a name ✏️", placeholder: "e.g. Chaotic Lisbon Weekend", color: p.hero,      hint: "This becomes the title of your storybook" },
                { key: "destination", label: "Where was it? 📍",         placeholder: "e.g. Lisbon, Portugal",      color: p.secondary, hint: "City, country or region works great" },
                { key: "dates",       label: "When? 📅",                  placeholder: "e.g. March 2025",            color: p.tertiary,  hint: "Approximate is fine!" },
              ].map(({ key, label, placeholder, color, hint }) => (
                <div key={key} style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontWeight: 800, fontSize: "0.85rem", color: p.text, marginBottom: "0.4rem" }}>{label}</label>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                    style={{ width: "100%", background: p.card, border: `2.5px solid ${form[key] ? color : "#ddd"}`, borderRadius: "12px", padding: "0.85rem 1rem", fontSize: "1rem", color: p.text, outline: "none", fontWeight: 600, transition: "border 0.2s", boxShadow: form[key] ? `3px 3px 0 ${color}33` : "none", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = color}
                    onBlur={e => e.target.style.borderColor = form[key] ? color : "#ddd"}
                  />
                  <div style={{ fontSize: "0.72rem", color: p.muted, fontWeight: 600, marginTop: "0.3rem" }}>💡 {hint}</div>
                </div>
              ))}

              <div>
                <label style={{ display: "block", fontWeight: 800, fontSize: "0.85rem", color: p.text, marginBottom: "0.3rem" }}>What was the vibe? 🎭</label>
                <div style={{ fontSize: "0.72rem", color: p.muted, fontWeight: 600, marginBottom: "0.75rem" }}>Pick as many as you like — this shapes the tone of your story</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {MOODS.map(m => <Pill key={m} active={moods.includes(m)} color={p.hero} onClick={() => toggleMood(m)}>{m}</Pill>)}
                </div>
                {moods.length > 0 && <div style={{ marginTop: "0.6rem", fontSize: "0.72rem", color: p.hero, fontWeight: 700 }}>✓ {moods.length} vibe{moods.length > 1 ? "s" : ""} selected</div>}
              </div>
            </div>
          )}

          {/* STEP 2 — Memories */}
          {step === 2 && (
            <div style={{ animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: p.tertiary, marginBottom: "0.5rem" }}>Step 3 of 3</div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "0.3rem", letterSpacing: "-0.02em", color: p.text }}>The good stuff 💫</h2>
              <p style={{ color: p.muted, marginBottom: "0.6rem", fontWeight: 600 }}>What moments made this trip unforgettable?</p>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <InfoBadge icon="✍️" text={`Min ${MIN_CHARS} chars`} color={p.tertiary} />
                <InfoBadge icon="📏" text={`Max ${MAX_CHARS} chars`} color={p.secondary} />
                <InfoBadge icon="🪄" text="More detail for a richer story" color={p.hero} />
              </div>

              <textarea value={memories} onChange={e => { if (e.target.value.length <= MAX_CHARS + 50) setMemories(e.target.value); }} rows={7}
                placeholder={"e.g. We got completely lost in the Alfama district at sunset and stumbled on a tiny Fado bar. The singer's voice bounced off the tiles and we stayed for THREE hours…\n\nAlso the time we ate pasteis de nata from 6 different bakeries to find the best one 🥐"}
                style={{ width: "100%", background: p.card, border: `2.5px solid ${isOverLimit ? "#E05A00" : memories.length > MIN_CHARS ? p.tertiary : "#ddd"}`, borderRadius: "16px", padding: "1.25rem", fontSize: "0.95rem", color: p.text, outline: "none", lineHeight: 1.7, resize: "vertical", fontWeight: 600, transition: "border 0.2s", boxShadow: memories.length > MIN_CHARS ? `3px 3px 0 ${isOverLimit ? "#E05A0033" : p.tertiary + "33"}` : "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = isOverLimit ? "#E05A00" : p.tertiary}
                onBlur={e => e.target.style.borderColor = isOverLimit ? "#E05A00" : memories.length > MIN_CHARS ? p.tertiary : "#ddd"}
              />

              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: p.muted }}>
                    {memories.length < MIN_CHARS ? `Write at least ${MIN_CHARS - memories.length} more characters` : isOverLimit ? `⚠️ ${memories.length - MAX_CHARS} chars over limit — please shorten` : "🪄 More detail for a better story"}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isOverLimit ? "#E05A00" : charPct > 80 ? "#F5A623" : p.tertiary }}>
                    {memories.length} / {MAX_CHARS}
                  </span>
                </div>
                <div style={{ height: 6, background: "#eee", borderRadius: "100px", overflow: "hidden", border: "1px solid #ddd" }}>
                  <div style={{ height: "100%", width: `${Math.min(charPct, 100)}%`, background: isOverLimit ? "#E05A00" : charPct > 80 ? "#F5A623" : p.tertiary, borderRadius: "100px", transition: "width 0.2s" }} />
                </div>
              </div>

              {memories.length > 100 && !isOverLimit && (
                <div style={{ marginTop: "0.75rem", background: `${p.tertiary}18`, border: `1.5px solid ${p.tertiary}44`, borderRadius: "10px", padding: "0.6rem 0.9rem", fontSize: "0.75rem", fontWeight: 700, color: p.tertiary }}>
                  {memories.length < 300 ? "💬 Good start! Add a few more details for a richer story." : memories.length < 700 ? "✨ Nice! Your story is shaping up well." : "🔥 Amazing detail — your storybook is going to be incredible!"}
                </div>
              )}
            </div>
          )}

          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem" }}>
            <button onClick={step === 0 ? onBack : () => setStep(s => s - 1)}
              style={{ background: "transparent", border: `2.5px solid ${p.text}`, color: p.text, padding: "0.75rem 1.5rem", borderRadius: "100px", fontWeight: 800, fontSize: "0.9rem", boxShadow: `2px 2px 0 ${p.text}`, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = `3px 3px 0 ${p.text}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `2px 2px 0 ${p.text}`; }}
            >← Back</button>
            <button onClick={handleNext} disabled={!canNext} style={{
              background: canNext ? COLORS[step] : "#eee", color: canNext ? "#fff" : "#bbb",
              border: `2.5px solid ${canNext ? p.text : "transparent"}`, padding: "0.85rem 2.5rem",
              borderRadius: "100px", fontWeight: 800, fontSize: "1rem", fontFamily: "'Syne', sans-serif",
              boxShadow: canNext ? `4px 4px 0 ${p.text}` : "none", transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (canNext) { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = `6px 6px 0 ${p.text}`; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = canNext ? `4px 4px 0 ${p.text}` : "none"; }}
            >{step === 2 ? "Pick my format →" : "Next step →"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";

const FORMATS = [
  { id: "video",     emoji: "🎬", name: "Cinematic video",      desc: "MP4 with AI voiceover, music & photo transitions",    badge: "ElevenLabs", color: "#FF6B35" },
  { id: "website",   emoji: "🌐", name: "Interactive website",  desc: "Live URL with scroll effects, maps & galleries",       badge: "Puppeteer",  color: "#00B4D8" },
  { id: "scrapbook", emoji: "📖", name: "PDF scrapbook",        desc: "Print-ready pages with captions & layouts",            badge: "Puppeteer",  color: "#BF00FF" },
  { id: "slideshow", emoji: "🎞", name: "Slideshow deck",       desc: "One beautiful memory per slide, shareable link",       badge: "Gemini",     color: "#F4A500" },
];

export default function FormatPicker({ p, onNext, onBack }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* TOP BAR */}
      <div style={{ background: p.secondary, padding: "1rem 2.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.25)", border: "none", color: "#fff", borderRadius: "100px", padding: "0.4rem 1rem", fontWeight: 700, fontSize: "0.85rem" }}>← Back</button>
        <div style={{ fontFamily: "'Abril Fatface', serif", color: "#fff", fontSize: "1.3rem", flex: 1, textAlign: "center" }}>Pick your format</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 1.5rem" }}>
        <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "2.4rem", color: p.text, marginBottom: "0.4rem", textAlign: "center" }}>
          How should it look? 👀
        </h2>
        <p style={{ color: p.muted, fontWeight: 600, marginBottom: "2.5rem", textAlign: "center" }}>
          Pick one — you can always come back and make another
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", width: "100%", maxWidth: "620px", marginBottom: "2.5rem" }}>
          {FORMATS.map(f => {
            const isSelected = selected === f.id;
            const isHovered = hovered === f.id;
            return (
              <div
                key={f.id}
                onClick={() => setSelected(f.id)}
                onMouseEnter={() => setHovered(f.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: p.card,
                  border: `3px solid ${isSelected ? f.color : isHovered ? f.color + "88" : p.surface}`,
                  borderRadius: "20px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  transform: isSelected ? "scale(1.04) translateY(-3px)" : isHovered ? "scale(1.02) translateY(-1px)" : "scale(1)",
                  boxShadow: isSelected ? `5px 5px 0 ${f.color}55` : isHovered ? `3px 3px 0 ${f.color}33` : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Color accent strip */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: isSelected ? f.color : "transparent", transition: "background 0.2s" }} />

                {/* Badge */}
                <div style={{ position: "absolute", top: "0.875rem", right: "0.875rem", fontSize: "0.6rem", fontWeight: 800, background: `${f.color}22`, color: f.color, padding: "0.2rem 0.6rem", borderRadius: "100px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {f.badge}
                </div>

                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{f.emoji}</div>
                <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.05rem", color: p.text, marginBottom: "0.4rem" }}>{f.name}</div>
                <div style={{ fontSize: "0.8rem", color: p.muted, lineHeight: 1.55, fontWeight: 600 }}>{f.desc}</div>

                {isSelected && (
                  <div className="pop-in" style={{ position: "absolute", bottom: "0.75rem", right: "0.75rem", width: "24px", height: "24px", borderRadius: "50%", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#fff", fontWeight: 800 }}>✓</div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          style={{
            background: selected ? p.hero : p.surface,
            color: selected ? "#fff" : p.muted,
            border: "none", padding: "1.1rem 3.5rem",
            borderRadius: "100px", fontWeight: 800, fontSize: "1.1rem",
            boxShadow: selected ? `5px 5px 0 ${p.text}33` : "none",
            transition: "all 0.2s",
            transform: selected ? "scale(1)" : "scale(0.97)",
          }}
          onMouseEnter={e => { if (selected) { e.currentTarget.style.transform = "scale(1.03) translateY(-2px)"; e.currentTarget.style.boxShadow = `6px 6px 0 ${p.text}44`; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = selected ? `5px 5px 0 ${p.text}33` : "none"; }}
        >
          {selected ? `Generate my ${FORMATS.find(f => f.id === selected)?.name.toLowerCase()} 🚀` : "Select a format first"}
        </button>
      </div>
    </div>
  );
}

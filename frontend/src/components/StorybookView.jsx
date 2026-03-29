import { useState } from "react";
import ExportModal from "./ExportModal";

function ChapterCard({ chapter, photo, p }) {
  const photoUrl = photo ? URL.createObjectURL(photo) : null;
  return (
    <div style={{ background: p.card, border: `3px solid ${p.surface}`, borderRadius: "24px", overflow: "hidden", boxShadow: `6px 6px 0 ${p.hero}18`, marginBottom: "1.5rem" }}>
      {photoUrl && (
        <div style={{ width: "100%", height: "260px", overflow: "hidden", position: "relative" }}>
          <img src={photoUrl} alt={chapter.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "1.5rem 1.25rem 0.75rem" }}>
            <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.75rem", fontWeight: 700, fontStyle: "italic" }}>📍 {chapter.location}</div>
          </div>
        </div>
      )}
      <div style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <span style={{ background: p.hero, color: "#fff", fontSize: "0.68rem", fontWeight: 800, padding: "0.2rem 0.6rem", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>Ch. {chapter.num}</span>
          <h3 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.35rem", color: p.text, lineHeight: 1.15 }}>{chapter.title}</h3>
        </div>
        <p style={{ color: p.text, fontSize: "0.93rem", lineHeight: 1.75, fontWeight: 600, marginBottom: "1rem" }}>{chapter.prose}</p>
        <div style={{ borderLeft: `3px solid ${p.hero}`, paddingLeft: "0.875rem", color: p.muted, fontSize: "0.8rem", fontWeight: 700, fontStyle: "italic" }}>{chapter.caption}</div>
      </div>
    </div>
  );
}

function HighlightCard({ item, p }) {
  return (
    <div style={{ background: p.surface, borderRadius: "16px", padding: "1rem 1.1rem", border: `2px solid ${p.hero}22`, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <div style={{ fontSize: "1.8rem" }}>{item.icon}</div>
      <div style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: p.muted }}>{item.label}</div>
      <div style={{ fontSize: "0.88rem", fontWeight: 800, color: p.text, lineHeight: 1.3 }}>{item.value}</div>
    </div>
  );
}

function TimelineRow({ item, p, isLast }) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: p.hero, border: `2px solid ${p.card}`, boxShadow: `0 0 0 2px ${p.hero}` }} />
        {!isLast && <div style={{ width: "2px", flex: 1, background: `${p.hero}33`, marginTop: "4px" }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : "1.25rem" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: p.hero, marginBottom: "0.2rem" }}>{item.label}</div>
        <div style={{ fontSize: "0.92rem", fontWeight: 800, color: p.text, marginBottom: "0.15rem" }}>{item.title}</div>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: p.muted, lineHeight: 1.5 }}>{item.desc}</div>
      </div>
    </div>
  );
}

const FORMAT_BUTTONS = [
  { id: "video",     emoji: "🎬", label: "Export Video" },
  { id: "scrapbook", emoji: "📖", label: "Export PDF" },
  { id: "website",   emoji: "🌐", label: "Share Website" },
  { id: "slideshow", emoji: "🎞", label: "Export Slides" },
];

export default function StorybookView({ storybook, photos, p, onRestart, onRegenerate, isRegenerating }) {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://wandertale.tech/story/abc123").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!storybook) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {exportFormat && <ExportModal format={exportFormat} p={p} onClose={() => setExportFormat(null)} />}

      {/* COVER */}
      <div style={{ background: `linear-gradient(145deg, ${p.hero}, ${p.secondary})`, padding: "4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.2)", top: "-80px", right: "-80px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.15)", bottom: "-60px", left: "-60px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "1rem" }}>✈️ Travel Storybook</div>
          <h1 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "clamp(2.4rem, 7vw, 4.5rem)", color: "#fff", lineHeight: 1.05, marginBottom: "0.75rem", textShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>{storybook.coverTitle}</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", fontWeight: 700, fontStyle: "italic", maxWidth: "480px", margin: "0 auto 2rem" }}>{storybook.coverSubtitle}</p>
          {photos && photos.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
              {photos.slice(0, 5).map((photo, i) => (
                <img key={i} src={URL.createObjectURL(photo)} alt="" style={{ width: "80px", height: "80px", borderRadius: "14px", objectFit: "cover", border: "3px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, maxWidth: "720px", width: "100%", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <div style={{ background: p.card, border: `3px solid ${p.surface}`, borderRadius: "20px", padding: "1.75rem", marginBottom: "2rem", boxShadow: `5px 5px 0 ${p.secondary}22` }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: p.hero, marginBottom: "0.75rem" }}>Introduction</div>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, color: p.text, fontWeight: 600 }}>{storybook.introduction}</p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.6rem", color: p.text, marginBottom: "1.25rem" }}>Your Story 📖</h2>
          {(storybook.chapters || []).map((chapter, i) => (
            <ChapterCard key={i} chapter={chapter} photo={photos && photos[chapter.photoIndex] ? photos[chapter.photoIndex] : null} p={p} />
          ))}
        </div>

        {storybook.highlights && storybook.highlights.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.6rem", color: p.text, marginBottom: "1rem" }}>Trip Highlights ✨</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {storybook.highlights.map((item, i) => <HighlightCard key={i} item={item} p={p} />)}
            </div>
          </div>
        )}

        {storybook.timeline && storybook.timeline.length > 0 && (
          <div style={{ background: p.card, border: `3px solid ${p.surface}`, borderRadius: "20px", padding: "1.75rem", marginBottom: "2rem", boxShadow: `5px 5px 0 ${p.tertiary}22` }}>
            <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.4rem", color: p.text, marginBottom: "1.25rem" }}>Timeline 🗓</h2>
            {storybook.timeline.map((item, i) => <TimelineRow key={i} item={item} p={p} isLast={i === storybook.timeline.length - 1} />)}
          </div>
        )}

        {storybook.reflection && (
          <div style={{ background: `linear-gradient(135deg, ${p.hero}12, ${p.secondary}12)`, border: `3px solid ${p.hero}33`, borderRadius: "20px", padding: "2rem", marginBottom: "2.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🌅</div>
            <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.4rem", color: p.text, marginBottom: "0.75rem" }}>Reflection</h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: p.text, fontWeight: 600, fontStyle: "italic", maxWidth: "560px", margin: "0 auto" }}>"{storybook.reflection}"</p>
          </div>
        )}

        {/* EXPORT SECTION */}
        <div style={{ background: p.card, border: `3px solid ${p.surface}`, borderRadius: "20px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: p.muted, marginBottom: "1rem" }}>Export your storybook</div>
          <div style={{ background: p.surface, borderRadius: "10px", padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: p.muted, fontWeight: 600, marginBottom: "1rem" }}>
            <span>🔗</span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>wandertale.tech/story/abc123</span>
            <button onClick={handleCopy} style={{ background: copied ? p.hero : "transparent", color: copied ? "#fff" : p.hero, border: `2px solid ${p.hero}`, borderRadius: "8px", padding: "0.25rem 0.6rem", fontSize: "0.72rem", fontWeight: 800, transition: "all 0.2s" }}>{copied ? "Copied!" : "Copy"}</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.75rem" }}>
            {FORMAT_BUTTONS.map((f) => (
              <button key={f.id} onClick={() => setExportFormat(f.id)}
                style={{ background: p.surface, color: p.text, border: `2px solid ${p.surface}`, padding: "0.75rem 1rem", borderRadius: "14px", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = p.hero; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = p.hero; }}
                onMouseLeave={e => { e.currentTarget.style.background = p.surface; e.currentTarget.style.color = p.text; e.currentTarget.style.borderColor = p.surface; }}
              >
                <span>{f.emoji}</span> {f.label}
              </button>
            ))}
          </div>
          <button onClick={onRegenerate} disabled={isRegenerating}
            style={{ background: "transparent", color: p.muted, border: `2px solid ${p.surface}`, padding: "0.75rem 1.5rem", borderRadius: "100px", fontWeight: 700, fontSize: "0.85rem", width: "100%", opacity: isRegenerating ? 0.6 : 1 }}
          >
            {isRegenerating ? "✨ Rewriting your story..." : "🔄 Regenerate story"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
          {["Twitter/X", "Instagram", "WhatsApp", "Email"].map(s => (
            <button key={s} style={{ background: p.surface, border: "none", color: p.muted, padding: "0.5rem 1rem", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 700 }}>{s}</button>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={onRestart} style={{ background: "transparent", border: "none", color: p.muted, fontSize: "0.85rem", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}>
            ✈️ Start a new trip
          </button>
        </div>
      </div>
    </div>
  );
}
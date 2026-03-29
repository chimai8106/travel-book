import { useState } from "react";
import ExportModal from "./ExportModal";
import NarrationPlayer from "./NarrationPlayer";

function getPlaceStickers(placeName) {
  const name = (placeName || "").toLowerCase();
  if (name.includes("duomo") || name.includes("cathedral") || name.includes("church") || name.includes("basilica"))
    return ["⛪", "🕯️", "🎨", "🏛️", "✨"];
  if (name.includes("galleria") || name.includes("mall") || name.includes("market") || name.includes("shop"))
    return ["🛍️", "☕", "🍷", "💎", "🎭"];
  if (name.includes("milan") || name.includes("milano"))
    return ["🇮🇹", "🍕", "👗", "☕", "⚽"];
  if (name.includes("beach") || name.includes("coast") || name.includes("sea"))
    return ["🌊", "🐚", "🏄", "🌴", "🦀"];
  if (name.includes("park") || name.includes("garden") || name.includes("forest"))
    return ["🌿", "🦋", "🌸", "🍃", "🌻"];
  if (name.includes("museum") || name.includes("gallery") || name.includes("art"))
    return ["🖼️", "🏛️", "🎨", "📜", "🗿"];
  if (name.includes("mountain") || name.includes("hill") || name.includes("peak"))
    return ["⛰️", "🥾", "🌄", "🦅", "❄️"];
  if (name.includes("paris") || name.includes("france"))
    return ["🗼", "🥐", "🎨", "🍷", "🌹"];
  if (name.includes("tokyo") || name.includes("japan"))
    return ["⛩️", "🌸", "🍜", "🚅", "🎌"];
  if (name.includes("new york") || name.includes("nyc"))
    return ["🗽", "🍕", "🚕", "🌆", "🎷"];
  if (name.includes("rome") || name.includes("roma"))
    return ["🏛️", "🍝", "🛵", "🪙", "🌿"];
  if (name.includes("barcelona") || name.includes("spain"))
    return ["💃", "🥘", "⚽", "🌞", "🍹"];
  return ["📸", "✈️", "🗺️", "⭐", "🎒"];
}

function getLayoutConfig(count) {
  switch (count) {
    case 1: return { cardWidth: 380, gap: 0 };
    case 2: return { cardWidth: 300, gap: 28 };
    case 3: return { cardWidth: 230, gap: 22 };
    case 4: return { cardWidth: 190, gap: 18 };
    case 5: return { cardWidth: 160, gap: 14 };
    default: return { cardWidth: 160, gap: 12 };
  }
}

/* ── Polaroid strip — always centered, stickers flanking the group ── */
function PolaroidStrip({ chapter, photos, p }) {
  const indices = chapter.photoIndices ?? (chapter.photoIndex != null ? [chapter.photoIndex] : []);
  const captions = chapter.captions ?? (chapter.caption ? [chapter.caption] : []);
  const stickers = getPlaceStickers(chapter.title);
  const count = indices.length;

  if (count === 0) return null;

  const { cardWidth, gap } = getLayoutConfig(count);
  const imgHeight = Math.round(cardWidth * 0.85);
  const bottomPad = Math.max(44, Math.round(cardWidth * 0.2));
  const captionSize = count <= 2 ? "0.82rem" : count === 3 ? "0.73rem" : "0.65rem";
  const tilts = [-3, 2.5, -1.5, 3, -2, 1.5];

  // Sticker font scales with card size
  const stickerSize = cardWidth >= 280 ? "1.8rem" : cardWidth >= 200 ? "1.5rem" : "1.3rem";

  return (
    // Outer: full width, centers everything
    <div style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: "20px", paddingBottom: "16px" }}>
      {/* Middle: relative container so stickers anchor to the card group */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "flex-end", gap: `${gap}px` }}>

        {/* LEFT stickers — sit just outside the leftmost card */}
        <div style={{ position: "absolute", right: "100%", top: 0, bottom: 0, width: "56px", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "12px",   right: "6px", fontSize: stickerSize, transform: "rotate(-13deg)", filter: "drop-shadow(1px 2px 4px rgba(0,0,0,0.12))", userSelect: "none", lineHeight: 1 }}>{stickers[0]}</div>
          <div style={{ position: "absolute", bottom: "24px", right: "2px", fontSize: `calc(${stickerSize} * 0.82)`, transform: "rotate(8deg)",  filter: "drop-shadow(1px 2px 4px rgba(0,0,0,0.12))", userSelect: "none", lineHeight: 1 }}>{stickers[1]}</div>
        </div>

        {/* RIGHT stickers — sit just outside the rightmost card */}
        <div style={{ position: "absolute", left: "100%", top: 0, bottom: 0, width: "56px", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "8px",    left: "6px",  fontSize: stickerSize, transform: "rotate(11deg)",  filter: "drop-shadow(1px 2px 4px rgba(0,0,0,0.12))", userSelect: "none", lineHeight: 1 }}>{stickers[2]}</div>
          <div style={{ position: "absolute", bottom: "20px", left: "4px",  fontSize: `calc(${stickerSize} * 0.82)`, transform: "rotate(-7deg)", filter: "drop-shadow(1px 2px 4px rgba(0,0,0,0.12))", userSelect: "none", lineHeight: 1 }}>{stickers[3]}</div>
        </div>

        {/* Polaroid cards */}
        {indices.map((globalIdx, i) => {
          const photoFile = photos[globalIdx] ?? null;
          const photoUrl = photoFile ? URL.createObjectURL(photoFile) : null;
          const tilt = tilts[i % tilts.length];

          return (
            <div
              key={i}
              style={{ flexShrink: 0, transform: `rotate(${tilt}deg)`, transition: "transform 0.25s ease", zIndex: 2 }}
              onMouseEnter={e => e.currentTarget.style.transform = `rotate(0deg) scale(1.04) translateY(-10px)`}
              onMouseLeave={e => e.currentTarget.style.transform = `rotate(${tilt}deg)`}
            >
              <div style={{
                background: "#FEFEFE",
                padding: `9px 9px ${bottomPad}px`,
                boxShadow: "3px 4px 18px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.06)",
                width: `${cardWidth}px`,
                border: "1px solid #E8E4DC",
              }}>
                <div style={{ width: `${cardWidth - 18}px`, height: `${imgHeight}px`, background: `${p.hero}0E`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {photoUrl
                    ? <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <span style={{ fontSize: "3rem", opacity: 0.2 }}>📷</span>
                  }
                </div>
                <div style={{ marginTop: "8px", fontFamily: "'Georgia', serif", fontSize: captionSize, color: "#999", textAlign: "center", fontStyle: "italic", lineHeight: 1.45, padding: "0 4px" }}>
                  {captions[i] ?? ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Chapter block ─────────────────────────────────────────────────── */
function ChapterBlock({ chapter, photos, p }) {
  return (
    <div style={{ marginBottom: "3.5rem", paddingBottom: "3.5rem", borderBottom: `1px solid ${p.text}0D` }}>
      {/* Meta */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.85rem" }}>
        <span style={{ background: p.hero, color: "#fff", fontSize: "0.65rem", fontWeight: 800, padding: "0.2rem 0.65rem", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Ch. {chapter.num}
        </span>
        {(chapter.timeLabel || chapter.date) && (
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: p.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {chapter.timeLabel || ""}{chapter.date ? ` · ${chapter.date}` : ""}
          </span>
        )}
      </div>

      {/* Title — full width */}
      <h3 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.75rem", color: p.text, lineHeight: 1.15, marginBottom: "0.4rem" }}>
        {chapter.title}
      </h3>

      {/* Location */}
      {(chapter.location || chapter.researchSummary) && (
        <div style={{ fontSize: "0.85rem", color: p.muted, fontWeight: 600, marginBottom: "1.1rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.4rem" }}>
          {chapter.location && <span>📍 {chapter.location}</span>}
          {chapter.location && chapter.researchSummary && <span style={{ opacity: 0.3 }}>|</span>}
          {chapter.researchSummary && <span style={{ fontStyle: "italic" }}>{chapter.researchSummary}</span>}
        </div>
      )}

      {/* Prose — full width of the column */}
      {chapter.prose && (
        <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: p.text, fontWeight: 600, marginBottom: "1.75rem", width: "100%" }}>
          {chapter.prose}
        </p>
      )}

      {/* Polaroid strip — centered */}
      <PolaroidStrip chapter={chapter} photos={photos} p={p} />
    </div>
  );
}

/* ── Highlight card ─────────────────────────────────────────────────── */
function HighlightCard({ item, p }) {
  return (
    <div style={{ borderRadius: "10px", padding: "1rem", border: `1.5px solid ${p.text}0E`, background: p.card, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <div style={{ fontSize: "1.6rem" }}>{item.icon}</div>
      <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: p.muted }}>{item.label}</div>
      <div style={{ fontSize: "0.9rem", fontWeight: 800, color: p.text, lineHeight: 1.35 }}>{item.value}</div>
    </div>
  );
}

/* ── Timeline row ───────────────────────────────────────────────────── */
function TimelineRow({ item, p, isLast }) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: p.hero, marginTop: "5px" }} />
        {!isLast && <div style={{ width: "1px", flex: 1, background: `${p.hero}28`, marginTop: "4px" }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : "1.1rem" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: p.hero, marginBottom: "0.15rem" }}>{item.timeLabel || item.label}</div>
        <div style={{ fontSize: "0.95rem", fontWeight: 800, color: p.text, marginBottom: "0.15rem" }}>{item.place || item.title}</div>
        <div style={{ fontSize: "0.83rem", fontWeight: 600, color: p.muted, lineHeight: 1.5 }}>{item.desc}</div>
      </div>
    </div>
  );
}

const FORMAT_BUTTONS = [
  { id: "video",     emoji: "🎬", label: "Export Video"  },
  { id: "scrapbook", emoji: "📖", label: "Export PDF"    },
  { id: "website",   emoji: "🌐", label: "Share Website" },
  { id: "slideshow", emoji: "🎞", label: "Export Slides" },
];

/* ── Main ───────────────────────────────────────────────────────────── */
export default function StorybookView({ storybook, photos, p, onRestart, onRegenerate, isRegenerating }) {
  const [exportFormat, setExportFormat] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!storybook) return null;
  const allPhotos = photos || [];

  return (
    <div style={{ minHeight: "100vh", background: p.bg, color: p.text, display: "flex", flexDirection: "column" }}>
      {exportFormat && <ExportModal format={exportFormat} p={p} onClose={() => setExportFormat(null)} />}

      {/* COVER */}
      <div style={{ background: `linear-gradient(140deg, ${p.hero} 0%, ${p.secondary} 100%)`, padding: "5rem 2rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.18)", borderRadius: "100px", padding: "0.3rem 0.9rem", fontSize: "0.68rem", fontWeight: 800, color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            ✈️ Travel Storybook
          </div>
          <h1 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "#fff", lineHeight: 1.05, marginBottom: "0.75rem", textShadow: "0 2px 16px rgba(0,0,0,0.12)" }}>
            {storybook.coverTitle}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", fontWeight: 600, fontStyle: "italic", maxWidth: "460px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
            {storybook.coverSubtitle}
          </p>
          {allPhotos.length > 0 && (
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              {allPhotos.slice(0, 5).map((photo, i) => {
                const tilts = [-6, 3, -1, 5, -3];
                return (
                  <div key={i}
                    style={{ background: "#fff", padding: "7px 7px 28px", transform: `rotate(${tilts[i] || 0}deg)`, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", transition: "transform 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg) scale(1.06)"}
                    onMouseLeave={e => e.currentTarget.style.transform = `rotate(${tilts[i]}deg)`}
                  >
                    <img src={URL.createObjectURL(photo)} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", display: "block" }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BODY — consistent horizontal padding, centered */}
      <div style={{ flex: 1, maxWidth: "860px", width: "100%", margin: "0 auto", padding: "3rem 3rem" }}>

        <NarrationPlayer storybook={storybook} p={p} />

        {/* Introduction */}
        <div style={{ borderLeft: `3px solid ${p.hero}`, paddingLeft: "1.4rem", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: p.hero, marginBottom: "0.5rem" }}>Introduction</div>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: p.text, fontWeight: 600, margin: 0 }}>{storybook.introduction}</p>
        </div>

        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.6rem", color: p.text, margin: 0, flexShrink: 0 }}>Your Story</h2>
          <div style={{ flex: 1, height: "1px", background: `${p.text}10` }} />
        </div>

        {(storybook.chapters || []).map((chapter, i) => (
          <ChapterBlock key={i} chapter={chapter} photos={allPhotos} p={p} />
        ))}

        {/* Highlights */}
        {storybook.highlights?.length > 0 && (
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.6rem", color: p.text, margin: 0, flexShrink: 0 }}>Highlights</h2>
              <div style={{ flex: 1, height: "1px", background: `${p.text}10` }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "0.75rem" }}>
              {storybook.highlights.map((item, i) => <HighlightCard key={i} item={item} p={p} />)}
            </div>
          </div>
        )}

        {/* Timeline */}
        {storybook.timeline?.length > 0 && (
          <div style={{ border: `1.5px solid ${p.text}0E`, borderRadius: "10px", padding: "1.75rem", marginBottom: "2.5rem", background: p.card }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: p.muted, marginBottom: "1.25rem" }}>Timeline</div>
            {storybook.timeline.map((item, i) => (
              <TimelineRow key={i} item={item} p={p} isLast={i === storybook.timeline.length - 1} />
            ))}
          </div>
        )}

        {/* Reflection */}
        {storybook.reflection && (
          <div style={{ textAlign: "center", padding: "2.75rem 2rem", marginBottom: "2.5rem", background: `${p.hero}08`, borderRadius: "10px", border: `1.5px solid ${p.hero}18` }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>🌅</div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: p.hero, marginBottom: "0.75rem" }}>Reflection</div>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: p.text, fontWeight: 600, fontStyle: "italic", maxWidth: "560px", margin: "0 auto" }}>
              "{storybook.reflection}"
            </p>
          </div>
        )}

        {/* Export */}
        <div style={{ border: `1.5px solid ${p.text}0E`, borderRadius: "10px", padding: "1.75rem", marginBottom: "1.5rem", background: p.card }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: p.muted, marginBottom: "1rem" }}>Export</div>
          <div style={{ background: p.bg, borderRadius: "7px", padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: p.muted, fontWeight: 600, marginBottom: "0.9rem", border: `1px solid ${p.text}08` }}>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>wandertale.tech/story/abc123</span>
            <button
              onClick={() => { navigator.clipboard.writeText("https://wandertale.tech/story/abc123").catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ background: copied ? p.hero : "transparent", color: copied ? "#fff" : p.hero, border: `1.5px solid ${p.hero}`, borderRadius: "5px", padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 800, flexShrink: 0, transition: "all 0.2s" }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.6rem" }}>
            {FORMAT_BUTTONS.map(f => (
              <button key={f.id} onClick={() => setExportFormat(f.id)}
                style={{ background: "transparent", color: p.text, border: `1.5px solid ${p.text}12`, padding: "0.7rem 1rem", borderRadius: "7px", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = p.hero; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = p.hero; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = p.text; e.currentTarget.style.borderColor = `${p.text}12`; }}
              >
                <span>{f.emoji}</span> {f.label}
              </button>
            ))}
          </div>
          <button onClick={onRegenerate} disabled={isRegenerating}
            style={{ background: "transparent", color: p.muted, border: `1.5px solid ${p.text}10`, padding: "0.7rem 1.5rem", borderRadius: "7px", fontWeight: 700, fontSize: "0.85rem", width: "100%", opacity: isRegenerating ? 0.6 : 1, transition: "all 0.15s" }}
            onMouseEnter={e => { if (!isRegenerating) { e.currentTarget.style.borderColor = p.muted; e.currentTarget.style.color = p.text; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${p.text}10`; e.currentTarget.style.color = p.muted; }}
          >
            {isRegenerating ? "✨ Rewriting..." : "🔄 Regenerate story"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
          {["Twitter/X", "Instagram", "WhatsApp", "Email"].map(s => (
            <button key={s}
              style={{ background: "transparent", border: `1px solid ${p.text}12`, color: p.muted, padding: "0.4rem 0.9rem", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 700, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = p.hero; e.currentTarget.style.color = p.hero; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${p.text}12`; e.currentTarget.style.color = p.muted; }}
            >{s}</button>
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
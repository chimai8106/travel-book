import { useState } from "react";

const Sticker = ({ emoji, style, cls }) => (
  <div className={cls} style={{
    position: "absolute", fontSize: "3.5rem", userSelect: "none",
    filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.15))", ...style
  }}>{emoji}</div>
);

const Tag = ({ children, color, bg }) => (
  <span style={{ background: bg, color, fontWeight: 800, fontSize: "0.75rem", padding: "0.3rem 0.85rem", borderRadius: "100px", letterSpacing: "0.05em", textTransform: "uppercase", border: `2px solid ${color}22` }}>
    {children}
  </span>
);

export default function Landing({ p, palettes, onPalette, onStart }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 2.5rem" }}>
        <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.6rem", color: p.hero, letterSpacing: "-0.01em" }}>
          Postcards
          <span style={{ color: p.secondary }}>I Never Sent</span>
        </div>

        {/* Palette switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: p.card, padding: "0.5rem 1rem", borderRadius: "100px", border: `2px solid ${p.surface}`, boxShadow: `0 2px 12px rgba(0,0,0,0.08)` }}>
          {palettes.map((pal) => (
            <button
              key={pal.id}
              title={pal.name}
              onClick={() => onPalette(pal)}
              onMouseEnter={() => setHovered(pal.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: `linear-gradient(135deg, ${pal.hero} 50%, ${pal.secondary} 100%)`,
                border: p.id === pal.id ? `3px solid ${p.text}` : "3px solid transparent",
                transform: hovered === pal.id || p.id === pal.id ? "scale(1.25)" : "scale(1)",
                transition: "all 0.2s", padding: 0, outline: "none",
                boxShadow: p.id === pal.id ? `0 0 0 2px ${p.card}, 0 0 0 4px ${pal.hero}` : "none",
              }}
            />
          ))}
          <span style={{ fontSize: "0.8rem", color: p.muted, fontWeight: 700, marginLeft: "0.25rem" }}>{p.emoji} {p.name}</span>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", minHeight: "80vh" }}>

        {/* Floating stickers */}
        <Sticker emoji="🗺️" cls="float-a" style={{ top: "8%",  left: "5%",  fontSize: "5rem" }} />
        <Sticker emoji="📸" cls="float-b" style={{ top: "12%", right: "8%", fontSize: "5rem" }} />
        <Sticker emoji="🎒" cls="float-a" style={{ bottom: "15%", left: "7%", fontSize: "5rem" }} />
        <Sticker emoji="🌍" cls="float-b" style={{ bottom: "20%", right: "5%", fontSize: "5rem" }} />
        <Sticker emoji="⭐" cls="float-a" style={{ top: "35%", left: "3%", fontSize: "5rem" }} />
        <Sticker emoji="🎫" cls="float-b" style={{ top: "55%", right: "4%", fontSize: "5rem" }} />

        {/* Big decorative circle */}
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", border: `3px dashed ${p.hero}33`, top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />

        {/* CENTER CONTENT */}
        <div style={{ textAlign: "center", maxWidth: "680px", position: "relative", zIndex: 1 }}>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <Tag color={p.hero} bg={`${p.hero}18`}>Gemini AI</Tag>
            <Tag color={p.secondary} bg={`${p.secondary}18`}>ElevenLabs</Tag>
            <Tag color={p.tertiary === "#FFE66D" ? "#6B5E00" : p.tertiary} bg={`${p.tertiary}30`}>Snowflake</Tag>
          </div>

          <h1 style={{
            fontFamily: "'Abril Fatface', serif",
            fontSize: "clamp(3.5rem, 9vw, 7rem)",
            lineHeight: 0.95,
            color: p.text,
            marginBottom: "0.1em",
            letterSpacing: "-0.02em",
          }}>
            Your trip,<br />
            <span style={{ color: p.hero, WebkitTextStroke: `3px ${p.hero}`, WebkitTextFillColor: "transparent" }}>retold</span>{" "}
            <span style={{ color: p.secondary }}>beautifully.</span>
          </h1>

          <p style={{ fontSize: "1.15rem", color: p.muted, maxWidth: "480px", margin: "1.5rem auto 2.5rem", lineHeight: 1.65, fontWeight: 600 }}>
            Drop your photos, videos & memories. Our AI turns them into a stunning storybook of your choice, video, website, scrapbook, or slideshow. ✨
          </p>

          {/* CTA */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={onStart}
              style={{
                background: p.hero, color: "#fff", border: "none",
                padding: "1.1rem 3rem", borderRadius: "100px",
                fontSize: "1.1rem", fontWeight: 800,
                boxShadow: `4px 4px 0px ${p.text}`,
                transition: "all 0.15s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = `6px 6px 0px ${p.text}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translate(0,0)"; e.currentTarget.style.boxShadow = `4px 4px 0px ${p.text}`; }}
            >
              Start my storybook ✈️
            </button>
            <button style={{
              background: "transparent", color: p.text,
              border: `3px solid ${p.text}`, padding: "1.1rem 2rem",
              borderRadius: "100px", fontSize: "1rem", fontWeight: 700,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = p.text; e.currentTarget.style.color = p.card; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = p.text; }}
            >See an example</button>
          </div>

          {/* FORMAT pills */}
          <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "2.5rem", flexWrap: "wrap" }}>
            {[["🎬", "Video"], ["🌐", "Website"], ["📖", "Scrapbook"], ["🎞", "Slideshow"]].map(([ic, lbl]) => (
              <div key={lbl} style={{ background: p.card, border: `2px solid ${p.surface}`, borderRadius: "12px", padding: "0.6rem 1rem", fontSize: "0.85rem", fontWeight: 700, color: p.muted, display: "flex", alignItems: "center", gap: "0.4rem", boxShadow: `2px 2px 0 ${p.surface}` }}>
                <span>{ic}</span> {lbl}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PALETTE SHOWCASE ROW */}
      <div style={{ padding: "1.5rem 2.5rem", borderTop: `3px solid ${p.surface}`, background: p.card }}>
        <p style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: p.muted, marginBottom: "1rem" }}>Pick your vibe</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          {palettes.map((pal) => (
            <button key={pal.id} onClick={() => onPalette(pal)} style={{
              background: pal.bg, border: `3px solid ${p.id === pal.id ? pal.hero : "transparent"}`,
              borderRadius: "14px", padding: "0.75rem 1.25rem", cursor: "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.5rem",
              transform: p.id === pal.id ? "scale(1.08) translateY(-2px)" : "scale(1)",
              boxShadow: p.id === pal.id ? `3px 3px 0 ${pal.hero}` : "none",
            }}>
              <span style={{ fontSize: "1.3rem" }}>{pal.emoji}</span>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 800, color: pal.text }}>{pal.name}</div>
                <div style={{ display: "flex", gap: "3px", marginTop: "3px" }}>
                  {[pal.hero, pal.secondary, pal.tertiary].map((c, i) => (
                    <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

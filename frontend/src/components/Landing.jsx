import { useState } from "react";

export default function Landing({ p, palettes, onPalette, onStart }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: p.bg,
      color: p.text,
      fontFamily: "'Nunito', sans-serif",
      transition: "background 0.5s, color 0.4s",
    }}>

      {/* NAV */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.75rem 3rem",
        borderBottom: `1px solid ${p.text}12`,
      }}>
        <div style={{
          fontFamily: "'Abril Fatface', serif",
          fontSize: "1.25rem",
          letterSpacing: "-0.01em",
          color: p.text,
        }}>
          Postcards<span style={{ color: p.hero }}>.</span>
        </div>

        {/* Palette dots */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {palettes.map((pal) => (
            <button
              key={pal.id}
              title={`${pal.emoji} ${pal.name}`}
              onClick={() => onPalette(pal)}
              onMouseEnter={() => setHovered(pal.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: pal.hero,
                border: "2px solid transparent",
                outline: p.id === pal.id ? `2px solid ${pal.hero}` : "none",
                outlineOffset: "2px",
                transform: hovered === pal.id || p.id === pal.id ? "scale(1.5)" : "scale(1)",
                transition: "all 0.2s",
                padding: 0,
              }}
            />
          ))}
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: p.muted, marginLeft: "0.5rem" }}>{p.emoji}</span>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        maxWidth: "1100px",
        margin: "0 auto",
        width: "100%",
        padding: "5rem 3rem",
        alignItems: "center",
        gap: "4rem",
      }}>
        {/* LEFT */}
        <div>
          <div style={{
            fontSize: "0.65rem",
            fontWeight: 800,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: p.hero,
            marginBottom: "1.5rem",
          }}>
            AI Travel Storybook
          </div>

          <h1 style={{
            fontFamily: "'Abril Fatface', serif",
            fontSize: "clamp(3rem, 4.5vw, 4.5rem)",
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            color: p.text,
            marginBottom: "1.5rem",
          }}>
            Your trip,<br />
            <span style={{ color: p.hero }}>retold</span><br />
            beautifully.
          </h1>

          <p style={{
            fontSize: "0.97rem",
            lineHeight: 1.75,
            color: p.muted,
            fontWeight: 600,
            maxWidth: "380px",
            marginBottom: "2.5rem",
          }}>
            Drop your photos and memories. Get back a stunning storybook — video, scrapbook, website, or slideshow.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <button
              onClick={onStart}
              style={{
                background: p.hero,
                color: "#fff",
                border: "none",
                padding: "0.9rem 2.25rem",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: 800,
                letterSpacing: "0.02em",
                transition: "all 0.2s",
                boxShadow: `0 4px 20px ${p.hero}44`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${p.hero}55`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 20px ${p.hero}44`; }}
            >
              Start my storybook
            </button>
            <span style={{ fontSize: "0.8rem", color: p.muted, fontWeight: 600 }}>Free · No account needed</span>
          </div>

          {/* Format icons */}
          <div style={{
            display: "flex",
            gap: "1.5rem",
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: `1px solid ${p.text}10`,
          }}>
            {[["🎬", "Video"], ["🌐", "Website"], ["📖", "Scrapbook"], ["🎞", "Slides"]].map(([ic, lbl]) => (
              <div key={lbl} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                <span style={{ fontSize: "1.1rem" }}>{ic}</span>
                <span style={{ fontSize: "0.6rem", fontWeight: 800, color: p.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — polaroid stack */}
        <div style={{ position: "relative", height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            position: "absolute",
            width: "280px", height: "280px",
            borderRadius: "50%",
            background: `${p.hero}0C`,
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
          }} />
          {[
            { rot: "-8deg", x: "-55px", y: "15px", z: 1, emoji: "🗼", label: "Tokyo · Jan" },
            { rot:  "5deg", x:  "45px", y: "-25px", z: 2, emoji: "🚋", label: "Lisbon · Mar" },
            { rot: "-2deg", x:  "-5px", y:  "45px", z: 3, emoji: "⛪", label: "Milan · Feb" },
          ].map((card, i) => (
            <div key={i} style={{
              position: "absolute",
              transform: `rotate(${card.rot}) translate(${card.x}, ${card.y})`,
              zIndex: card.z,
              background: "#fff",
              padding: "10px 10px 42px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)",
              width: "160px",
            }}>
              <div style={{
                width: "140px", height: "120px",
                background: `${p.hero}${["14","0E","09"][i]}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2.5rem",
              }}>
                {card.emoji}
              </div>
              <div style={{
                marginTop: "8px",
                fontFamily: "'Georgia', serif",
                fontSize: "0.65rem", color: "#aaa",
                textAlign: "center", fontStyle: "italic",
              }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        borderTop: `1px solid ${p.text}10`,
        padding: "1.25rem 3rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          {["Gemini AI", "ElevenLabs", "Google Search"].map(s => (
            <span key={s} style={{ fontSize: "0.7rem", fontWeight: 700, color: p.muted, letterSpacing: "0.04em" }}>{s}</span>
          ))}
        </div>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: p.muted }}>{p.emoji} {p.name}</span>
      </div>
    </div>
  );
}
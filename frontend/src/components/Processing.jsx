import { useState, useEffect, useRef } from "react";
import { generateStorybook } from "../api";

const STEPS = [
  { emoji: "🔍", label: "Analysing your photos",      sub: "Reading every face, place & colour...",             minMs: 1200 },
  { emoji: "🧠", label: "Building your story context", sub: "Connecting your memories and moments...",           minMs: 800  },
  { emoji: "✍️",  label: "Writing your narrative",     sub: "Crafting a story only you could have...",           minMs: 800  },
  { emoji: "🎨", label: "Designing your storybook",    sub: "Laying out every page beautifully...",              minMs: 600  },
  { emoji: "✅", label: "Done!",                        sub: "Your storybook is ready to share 🎉",               minMs: 0    },
];

const FUN_FACTS = [
  "Did you know? Travel makes you more creative 🧠",
  "The average person visits 8 countries in their lifetime 🌍",
  "Photos trigger more vivid memories than text 📸",
  "Sharing travel stories boosts happiness 😊",
  "Your trip generated enough data for a small book 📖",
];

export default function Processing({ p, tripData, format, onDone }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [factIdx, setFactIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const calledRef = useRef(false);

  // Animate through steps while API call runs in background
  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    let currentStep = 0;

    // Advance UI through steps 0→3 on a timer (step 4 = "Done" fires when API resolves)
    const advance = () => {
      if (currentStep < STEPS.length - 2) {
        currentStep++;
        setStepIdx(currentStep);
        setTimeout(advance, STEPS[currentStep].minMs + Math.random() * 600);
      }
    };
    setTimeout(advance, STEPS[0].minMs + Math.random() * 600);

    // Fire the real API call
    generateStorybook(tripData)
      .then((storybook) => {
        // Make sure we're at least on step 3 before showing Done
        const waitUntilStep3 = setInterval(() => {
          setStepIdx((s) => {
            if (s >= 3) {
              clearInterval(waitUntilStep3);
              setTimeout(() => {
                setStepIdx(4);
                setDone(true);
                setTimeout(() => onDone(storybook), 900);
              }, 400);
            }
            return s;
          });
        }, 200);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
      });

    const factTimer = setInterval(() => setFactIdx((f) => (f + 1) % FUN_FACTS.length), 3200);
    return () => clearInterval(factTimer);
  }, []);

  const progress = Math.round((stepIdx / (STEPS.length - 1)) * 100);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😢</div>
          <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "2rem", color: p.text, marginBottom: "0.75rem" }}>
            Something went wrong
          </h2>
          <div style={{ background: p.card, border: `2px solid #E05A0055`, borderRadius: "14px", padding: "1rem 1.25rem", color: "#C0392B", fontWeight: 700, fontSize: "0.88rem", marginBottom: "1.5rem", wordBreak: "break-word" }}>
            {error}
          </div>
          <p style={{ color: p.muted, fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>
            Make sure your backend is running and <code style={{ background: p.surface, padding: "0.1rem 0.4rem", borderRadius: "6px" }}>VITE_BACKEND_URL</code> is set correctly.
          </p>
          <button
            onClick={() => { setError(null); calledRef.current = false; setStepIdx(0); setDone(false); }}
            style={{ background: p.hero, color: "#fff", border: "none", padding: "0.85rem 2.5rem", borderRadius: "100px", fontWeight: 800, fontSize: "1rem", boxShadow: `4px 4px 0 ${p.text}33` }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "520px", width: "100%" }}>

        {/* Spinning emoji */}
        <div style={{
          fontSize: "5rem", marginBottom: "1.5rem", display: "inline-block",
          animation: done ? "none" : "spin 2s linear infinite",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
        }}>
          {done ? "🎉" : STEPS[Math.min(stepIdx, STEPS.length - 1)].emoji}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "2.2rem", color: p.text, marginBottom: "0.5rem" }}>
          {done ? "All done!" : "Magic in progress..."}
        </h2>
        <p style={{ color: p.muted, fontWeight: 700, marginBottom: "2rem", fontSize: "0.95rem" }}>
          {STEPS[Math.min(stepIdx, STEPS.length - 1)].sub}
        </p>

        {/* Progress bar */}
        <div style={{ background: p.surface, borderRadius: "100px", height: "12px", overflow: "hidden", marginBottom: "0.75rem", border: `2px solid ${p.surface}` }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${p.hero}, ${p.secondary})`, borderRadius: "100px", width: `${progress}%`, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ fontWeight: 800, fontSize: "0.85rem", color: p.hero, marginBottom: "2.5rem" }}>{progress}%</div>

        {/* Steps list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", textAlign: "left", marginBottom: "2.5rem" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.875rem", opacity: i > stepIdx ? 0.3 : 1, transition: "opacity 0.5s" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                background: i < stepIdx ? p.hero : i === stepIdx ? `${p.hero}22` : p.surface,
                border: `2.5px solid ${i <= stepIdx ? p.hero : p.surface}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: i < stepIdx ? "0.8rem" : "1rem", transition: "all 0.3s",
                color: i < stepIdx ? "#fff" : p.text,
              }}>
                {i < stepIdx ? "✓" : s.emoji}
              </div>
              <span style={{ fontSize: "0.9rem", fontWeight: i === stepIdx ? 800 : 600, color: i === stepIdx ? p.text : p.muted }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Fun fact ticker */}
        <div style={{ background: p.card, border: `2px solid ${p.surface}`, borderRadius: "14px", padding: "0.875rem 1.25rem", fontSize: "0.82rem", fontWeight: 700, color: p.muted, boxShadow: `3px 3px 0 ${p.surface}` }}>
          💡 {FUN_FACTS[factIdx]}
        </div>
      </div>
    </div>
  );
}

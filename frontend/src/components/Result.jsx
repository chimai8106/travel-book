import { useState } from "react";
import StorybookView from "./StorybookView";
import { regenerateStorybook } from "../api";

const Confetti = ({ p }) => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
    {Array.from({ length: 18 }).map((_, i) => (
      <div key={i} style={{
        position: "absolute",
        left: `${Math.random() * 100}%`,
        top: "-20px",
        fontSize: `${1 + Math.random() * 1.5}rem`,
        animation: `fall${i} ${3 + Math.random() * 4}s ease-in ${Math.random() * 2}s forwards`,
      }}>
        {["🎊", "⭐", "✈️", "🌟", "🎉", "💫", "🗺️"][Math.floor(Math.random() * 7)]}
      </div>
    ))}
    <style>{Array.from({ length: 18 }).map((_, i) => `
      @keyframes fall${i} {
        from { transform: translateY(-20px) rotate(0deg); opacity: 1; }
        to { transform: translateY(110vh) rotate(${360 + Math.random() * 360}deg); opacity: 0; }
      }
    `).join("")}</style>
  </div>
);

export default function Result({ p, format, storybook, tripData, onRestart }) {
  const [currentStorybook, setCurrentStorybook] = useState(storybook);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  // Hide confetti after 5s
  useState(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  });

  const handleRegenerate = async () => {
    if (!tripData || isRegenerating) return;
    setIsRegenerating(true);
    try {
      const fresh = await regenerateStorybook(tripData);
      setCurrentStorybook(fresh);
    } catch (err) {
      alert("Regeneration failed: " + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  // If we have a real storybook, render the full view
  if (currentStorybook) {
    return (
      <div style={{ position: "relative" }}>
        {showConfetti && <Confetti p={p} />}
        <StorybookView
          storybook={currentStorybook}
          photos={tripData?.photos || []}
          p={p}
          onRestart={onRestart}
          onRegenerate={handleRegenerate}
          isRegenerating={isRegenerating}
        />
      </div>
    );
  }

  // Fallback if no storybook data (shouldn't normally happen)
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Confetti p={p} />
      <div className="pop-in" style={{ textAlign: "center", maxWidth: "480px", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "2.5rem", color: p.text, marginBottom: "1rem" }}>
          Storybook ready!
        </h2>
        <p style={{ color: p.muted, fontWeight: 700, marginBottom: "2rem" }}>
          Something went wrong displaying your storybook. Try starting over.
        </p>
        <button onClick={onRestart} style={{ background: p.hero, color: "#fff", border: "none", padding: "1rem 2.5rem", borderRadius: "100px", fontWeight: 800, fontSize: "1rem" }}>
          ✈️ Start a new trip
        </button>
      </div>
    </div>
  );
}

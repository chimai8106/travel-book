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

/**
 * Sort places by date (earliest first) — mirrors backend's sortPlacesByDate().
 * Returns a flat array of File objects in the same global order the AI indexed them.
 */
function buildSortedPhotos(places) {
  if (!places || places.length === 0) return [];

  const sorted = [...places].sort((a, b) => {
    const da = a.date ? new Date(a.date) : null;
    const db = b.date ? new Date(b.date) : null;
    if (!da) return 1;
    if (!db) return -1;
    return da - db;
  });

  return sorted.flatMap(place => place.photos || []);
}

export default function Result({ storybook, tripData, photos, p, onRestart, onRegenerate, isRegenerating }) {
  const [currentStorybook, setCurrentStorybook] = useState(storybook);
  const [showConfetti, setShowConfetti] = useState(true);
  const [localIsRegenerating, setLocalIsRegenerating] = useState(false);

  // Hide confetti after 5s
  useState(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  });

  const handleRegenerate = async () => {
    if (!tripData || localIsRegenerating) return;
    setLocalIsRegenerating(true);
    try {
      const fresh = await regenerateStorybook(tripData);
      setCurrentStorybook(fresh);
    } catch (err) {
      alert("Regeneration failed: " + err.message);
    } finally {
      setLocalIsRegenerating(false);
    }
  };

  // Build the correctly-sorted photo array.
  // Priority: explicit photos prop → derive from tripData sorted by date (matching backend order)
  const sortedPhotos = photos ?? buildSortedPhotos(tripData?.places);

  if (currentStorybook) {
    return (
      <div style={{ position: "relative" }}>
        {showConfetti && <Confetti p={p} />}
        <StorybookView
          storybook={currentStorybook}
          photos={sortedPhotos}
          p={p}
          onRestart={onRestart}
          onRegenerate={onRegenerate ?? handleRegenerate}
          isRegenerating={isRegenerating ?? localIsRegenerating}
        />
      </div>
    );
  }

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
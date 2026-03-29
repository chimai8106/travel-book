import { useState, useEffect } from "react";

const FORMAT_CONFIG = {
  video: {
    emoji: "🎬",
    label: "Cinematic Video",
    ext: "MP4",
    steps: [
      "Compositing photo transitions...",
      "Generating AI voiceover with ElevenLabs...",
      "Adding background music...",
      "Encoding with FFmpeg...",
      "Finalising MP4...",
    ],
    duration: 5200,
    size: "47.3 MB",
    filename: "my-travel-story.mp4",
  },
  scrapbook: {
    emoji: "📖",
    label: "PDF Scrapbook",
    ext: "PDF",
    steps: [
      "Rendering page layouts...",
      "Compositing photos with captions...",
      "Applying typography & colours...",
      "Generating print-ready PDF...",
      "Optimising file size...",
    ],
    duration: 3800,
    size: "12.8 MB",
    filename: "my-travel-scrapbook.pdf",
  },
  website: {
    emoji: "🌐",
    label: "Interactive Website",
    ext: "URL",
    steps: [
      "Building page structure...",
      "Embedding photos & galleries...",
      "Adding scroll animations...",
      "Deploying to CDN...",
      "Generating shareable link...",
    ],
    duration: 3200,
    size: null,
    filename: null,
    url: "https://wandertale.tech/story/abc123",
  },
  slideshow: {
    emoji: "🎞",
    label: "Slideshow Deck",
    ext: "LINK",
    steps: [
      "Creating slide layouts...",
      "Placing photos & captions...",
      "Applying transitions...",
      "Uploading to cloud...",
      "Generating shareable link...",
    ],
    duration: 2800,
    size: null,
    filename: null,
    url: "https://wandertale.tech/slides/abc123",
  },
};

export default function ExportModal({ format, p, onClose }) {
  const config = FORMAT_CONFIG[format] || FORMAT_CONFIG.scrapbook;
  const [phase, setPhase] = useState("processing"); // processing | done
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalSteps = config.steps.length;
    const stepDuration = config.duration / totalSteps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= totalSteps) {
        clearInterval(interval);
        setStepIdx(totalSteps - 1);
        setProgress(100);
        setTimeout(() => setPhase("done"), 400);
      } else {
        setStepIdx(step);
        setProgress(Math.round((step / totalSteps) * 100));
      }
    }, stepDuration);

    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 99));
    }, config.duration / 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  const handleDownload = () => {
    // For PDF/video — create a fake blob download
    if (config.filename) {
      const blob = new Blob([""], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = config.filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(config.url || "https://wandertale.tech/story/abc123").catch(() => {});
  };

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in"
        style={{
          background: p.card,
          borderRadius: "24px",
          padding: "2rem",
          width: "100%",
          maxWidth: "440px",
          border: `3px solid ${p.surface}`,
          boxShadow: `8px 8px 0 ${p.text}22`,
        }}
      >
        {phase === "processing" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem", animation: "spin 2s linear infinite", display: "inline-block" }}>
                {config.emoji}
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <h3 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.5rem", color: p.text, marginBottom: "0.25rem" }}>
                Generating your {config.label}
              </h3>
              <p style={{ color: p.muted, fontSize: "0.82rem", fontWeight: 600 }}>
                {config.steps[stepIdx]}
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ background: p.surface, borderRadius: "100px", height: "10px", overflow: "hidden", marginBottom: "0.5rem" }}>
              <div style={{
                height: "100%",
                background: `linear-gradient(90deg, ${p.hero}, ${p.secondary})`,
                borderRadius: "100px",
                width: `${progress}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: p.hero, textAlign: "right", marginBottom: "1.5rem" }}>
              {progress}%
            </div>

            {/* Step list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {config.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", opacity: i > stepIdx ? 0.3 : 1, transition: "opacity 0.4s" }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                    background: i < stepIdx ? p.hero : i === stepIdx ? `${p.hero}22` : p.surface,
                    border: `2px solid ${i <= stepIdx ? p.hero : p.surface}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", color: i < stepIdx ? "#fff" : p.text,
                    transition: "all 0.3s",
                  }}>
                    {i < stepIdx ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: i === stepIdx ? 800 : 600, color: i === stepIdx ? p.text : p.muted }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          // DONE state
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>🎉</div>
            <h3 style={{ fontFamily: "'Abril Fatface', serif", fontSize: "1.6rem", color: p.text, marginBottom: "0.4rem" }}>
              Ready to share!
            </h3>
            <p style={{ color: p.muted, fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>
              Your {config.label} has been generated
              {config.size ? ` · ${config.size}` : ""}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {config.filename && (
                <button
                  onClick={handleDownload}
                  style={{
                    background: p.hero, color: "#fff", border: "none",
                    padding: "0.9rem 1.5rem", borderRadius: "100px",
                    fontWeight: 800, fontSize: "0.95rem",
                    boxShadow: `4px 4px 0 ${p.text}33`,
                    width: "100%",
                  }}
                >
                  ↓ Download {config.ext}
                </button>
              )}
              {config.url && (
                <button
                  onClick={handleCopyUrl}
                  style={{
                    background: p.secondary, color: "#fff", border: "none",
                    padding: "0.9rem 1.5rem", borderRadius: "100px",
                    fontWeight: 800, fontSize: "0.95rem",
                    boxShadow: `4px 4px 0 ${p.text}33`,
                    width: "100%",
                  }}
                >
                  🔗 Copy shareable link
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: "transparent", color: p.muted,
                  border: `2px solid ${p.surface}`,
                  padding: "0.75rem 1.5rem", borderRadius: "100px",
                  fontWeight: 700, fontSize: "0.85rem",
                  width: "100%",
                }}
              >
                Close
              </button>
            </div>

            {/* Social share */}
            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", flexWrap: "wrap" }}>
              {["Twitter/X", "Instagram", "WhatsApp", "Email"].map((s) => (
                <button key={s} style={{
                  background: p.surface, border: "none", color: p.muted,
                  padding: "0.4rem 0.8rem", borderRadius: "100px",
                  fontSize: "0.72rem", fontWeight: 700,
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
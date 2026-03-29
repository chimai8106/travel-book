import { useState, useRef, useEffect } from "react";

/**
 * NarrationPlayer
 * Props:
 *   storybook  — the full storybook object (passed to /api/narrate)
 *   p          — palette object
 */
export default function NarrationPlayer({ storybook, p }) {
  const [state, setState] = useState("idle"); // idle | loading | ready | playing | paused | error
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);       // 0–1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  const audioRef = useRef(null);
  const animFrameRef = useRef(null);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [audioUrl]);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  async function handleGenerate() {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${BASE_URL}/api/narrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storybook }),
      });

      if (!res.ok) {
        let msg = `Server error ${res.status}`;
        try { const j = await res.json(); msg = j.error || j.detail || msg; } catch {}
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setState("ready");

      // Auto-play once loaded
      setTimeout(() => {
        audioRef.current?.play();
        setState("playing");
        startProgressLoop();
      }, 100);
    } catch (err) {
      setErrorMsg(err.message);
      setState("error");
    }
  }

  function startProgressLoop() {
    const tick = () => {
      const audio = audioRef.current;
      if (!audio) return;
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
      if (!audio.paused && !audio.ended) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }

  function handlePlayPause() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setState("playing");
      startProgressLoop();
    } else {
      audio.pause();
      setState("paused");
      cancelAnimationFrame(animFrameRef.current);
    }
  }

  function handleEnded() {
    setState("paused");
    setProgress(1);
    cancelAnimationFrame(animFrameRef.current);
  }

  function handleSeek(e) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
    setCurrentTime(audio.currentTime);
  }

  function handleRestart() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setState("playing");
    startProgressLoop();
  }

  function handleDownload() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "travel-narration.mp3";
    a.click();
  }

  function fmt(secs) {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // ── Waveform bars (decorative, animated when playing) ──
  const BAR_COUNT = 28;
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    // Pseudo-random heights that look like audio
    const heights = [40, 65, 30, 80, 55, 70, 35, 90, 45, 60, 75, 50, 85, 40, 70, 55, 65, 80, 30, 60, 75, 45, 90, 50, 35, 70, 55, 65];
    return heights[i % heights.length];
  });

  const isPlaying = state === "playing";
  const isLoading = state === "loading";
  const hasAudio = ["ready", "playing", "paused"].includes(state);

  return (
    <div style={{
      background: p.card,
      border: `3px solid ${p.hero}33`,
      borderRadius: "20px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      boxShadow: `4px 4px 0 ${p.hero}18`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
        <span style={{ fontSize: "1.4rem" }}>🎙️</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: p.text }}>AI Narration</div>
          <div style={{ fontSize: "0.72rem", color: p.muted, fontWeight: 600 }}>
            Voiced by ElevenLabs · Rachel
          </div>
        </div>
        {hasAudio && (
          <button
            onClick={handleDownload}
            title="Download MP3"
            style={{
              marginLeft: "auto",
              background: p.surface,
              border: `2px solid ${p.surface}`,
              borderRadius: "10px",
              padding: "0.35rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: p.muted,
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = p.hero; e.currentTarget.style.color = p.hero; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = p.surface; e.currentTarget.style.color = p.muted; }}
          >
            ↓ MP3
          </button>
        )}
      </div>

      {/* Idle — generate button */}
      {state === "idle" && (
        <button
          onClick={handleGenerate}
          style={{
            width: "100%",
            background: `linear-gradient(135deg, ${p.hero}, ${p.secondary})`,
            color: "#fff",
            border: "none",
            borderRadius: "14px",
            padding: "1rem",
            fontWeight: 800,
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: `3px 3px 0 ${p.text}22`,
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `4px 5px 0 ${p.text}33`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `3px 3px 0 ${p.text}22`; }}
        >
          🎙️ Generate narration
        </button>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "0.75rem 0" }}>
          {/* Animated waveform while generating */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", height: "40px", marginBottom: "0.75rem" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "4px",
                  borderRadius: "2px",
                  background: p.hero,
                  opacity: 0.7,
                  animation: `narBar 1s ease-in-out ${i * 0.08}s infinite alternate`,
                  height: `${20 + Math.sin(i) * 14}px`,
                }}
              />
            ))}
          </div>
          <style>{`
            @keyframes narBar {
              from { transform: scaleY(0.4); opacity: 0.4; }
              to   { transform: scaleY(1.4); opacity: 1; }
            }
          `}</style>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: p.muted }}>
            Generating narration with ElevenLabs…
          </div>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div style={{ textAlign: "center" }}>
          <div style={{
            background: "#FFF0F0",
            border: "2px solid #E05A0033",
            borderRadius: "12px",
            padding: "0.75rem 1rem",
            color: "#C0392B",
            fontSize: "0.82rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}>
            ⚠️ {errorMsg}
          </div>
          <button
            onClick={handleGenerate}
            style={{ background: p.hero, color: "#fff", border: "none", borderRadius: "100px", padding: "0.6rem 1.5rem", fontWeight: 800, fontSize: "0.85rem" }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Player */}
      {hasAudio && (
        <div>
          {/* Waveform visualiser (decorative) */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "44px", marginBottom: "0.75rem" }}>
            {bars.map((h, i) => {
              const barProgress = i / BAR_COUNT;
              const isPast = barProgress <= progress;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    borderRadius: "2px",
                    background: isPast ? p.hero : `${p.hero}33`,
                    height: `${h}%`,
                    transition: "background 0.1s",
                    animation: isPlaying ? `narBar 0.8s ease-in-out ${i * 0.04}s infinite alternate` : "none",
                  }}
                />
              );
            })}
          </div>
          <style>{`
            @keyframes narBar {
              from { transform: scaleY(0.6); }
              to   { transform: scaleY(1); }
            }
          `}</style>

          {/* Seek bar */}
          <div
            onClick={handleSeek}
            style={{
              height: "6px",
              background: `${p.hero}28`,
              borderRadius: "100px",
              cursor: "pointer",
              marginBottom: "0.5rem",
              position: "relative",
            }}
          >
            <div style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${p.hero}, ${p.secondary})`,
              borderRadius: "100px",
              transition: "width 0.1s linear",
            }} />
            {/* Thumb */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: `${progress * 100}%`,
              transform: "translate(-50%, -50%)",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: p.hero,
              border: `2px solid ${p.card}`,
              boxShadow: `0 1px 4px ${p.hero}88`,
              transition: "left 0.1s linear",
            }} />
          </div>

          {/* Time labels */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 700, color: p.muted, marginBottom: "1rem" }}>
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            {/* Restart */}
            <button
              onClick={handleRestart}
              title="Restart"
              style={{
                background: p.surface,
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                color: p.muted,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = p.hero; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = p.surface; e.currentTarget.style.color = p.muted; }}
            >
              ↺
            </button>

            {/* Play / Pause — big center button */}
            <button
              onClick={handlePlayPause}
              style={{
                background: `linear-gradient(135deg, ${p.hero}, ${p.secondary})`,
                border: "none",
                borderRadius: "50%",
                width: "52px",
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                color: "#fff",
                boxShadow: `3px 3px 0 ${p.text}22`,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            {/* Spacer to keep center button centred */}
            <div style={{ width: "36px" }} />
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleEnded}
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}
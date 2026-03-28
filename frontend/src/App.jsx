import { useState } from "react";
import Landing from "./components/Landing";
import UploadWizard from "./components/UploadWizard";
import FormatPicker from "./components/FormatPicker";
import Processing from "./components/Processing";
import Result from "./components/Result";

export const PALETTES = [
  {
    id: "fiesta",
    name: "Fiesta",
    emoji: "🌺",
    bg: "#FFF3E0",
    hero: "#FF6B35",
    secondary: "#FFD93D",
    tertiary: "#6BCB77",
    text: "#1A0A00",
    card: "#FFFFFF",
    muted: "#A0522D",
    surface: "#FFE5CC",
    stamp: "#FF6B35",
  },
  {
    id: "tropicool",
    name: "Tropicool",
    emoji: "🌴",
    bg: "#E8F8F5",
    hero: "#00B4D8",
    secondary: "#FF6B6B",
    tertiary: "#FFE66D",
    text: "#0A2342",
    card: "#FFFFFF",
    muted: "#2A7B9B",
    surface: "#D0F0FA",
    stamp: "#00B4D8",
  },
  {
    id: "retropop",
    name: "Retro Pop",
    emoji: "🎠",
    bg: "#FDF0FF",
    hero: "#BF00FF",
    secondary: "#FF3CAC",
    tertiary: "#F9CB28",
    text: "#1A001A",
    card: "#FFFFFF",
    muted: "#7B2FBE",
    surface: "#F0D6FF",
    stamp: "#BF00FF",
  },
  {
    id: "citrus",
    name: "Citrus",
    emoji: "🍋",
    bg: "#FFFDE7",
    hero: "#F4A500",
    secondary: "#E63946",
    tertiary: "#4CAF50",
    text: "#1A1200",
    card: "#FFFFFF",
    muted: "#9B6F00",
    surface: "#FFF3B0",
    stamp: "#F4A500",
  },
  {
    id: "nightmarket",
    name: "Night Market",
    emoji: "🏮",
    bg: "#0D0221",
    hero: "#FF4D6D",
    secondary: "#FFD60A",
    tertiary: "#7FE7CC",
    text: "#FEFAE0",
    card: "#1A0533",
    muted: "#B09CC0",
    surface: "#1E0A3C",
    stamp: "#FF4D6D",
  },
  {
    id: "safari",
    name: "Safari",
    emoji: "🦁",
    bg: "#FDF6E3",
    hero: "#D4622A",
    secondary: "#5C8A3C",
    tertiary: "#E8C547",
    text: "#1C1200",
    card: "#FFFAF0",
    muted: "#8B6914",
    surface: "#F5E6C8",
    stamp: "#D4622A",
  },
];

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [palette, setPalette] = useState(PALETTES[0]);
  const [tripData, setTripData] = useState({});
  const [format, setFormat] = useState(null);
  // storybook is set by Processing after the API call succeeds
  const [storybook, setStorybook] = useState(null);

  const go = (s) => setScreen(s);

  const handleProcessingDone = (storybookData) => {
    setStorybook(storybookData);
    go("result");
  };

  const handleRestart = () => {
    setTripData({});
    setFormat(null);
    setStorybook(null);
    go("landing");
  };

  return (
    <div style={{ background: palette.bg, color: palette.text, minHeight: "100vh", transition: "background 0.6s, color 0.4s" }}>
      {screen === "landing"    && <Landing    p={palette} palettes={PALETTES} onPalette={setPalette} onStart={() => go("upload")} />}
      {screen === "upload"     && <UploadWizard p={palette} onNext={(d) => { setTripData(d); go("format"); }} onBack={() => go("landing")} />}
      {screen === "format"     && <FormatPicker p={palette} onNext={(f) => { setFormat(f); go("processing"); }} onBack={() => go("upload")} />}
      {screen === "processing" && (
        <Processing
          p={palette}
          tripData={tripData}
          format={format}
          onDone={handleProcessingDone}
        />
      )}
      {screen === "result" && (
        <Result
          p={palette}
          format={format}
          storybook={storybook}
          tripData={tripData}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

import type { Language } from "@/store/settingsStore";

export function FlightKeys({ language }: { language: Language }) {
  const id = language === "id";
  const controls = [
    ["A D", id ? "Kiri / kanan" : "Left / right"],
    ["Q E", id ? "Naik / turun" : "Climb / dive"],
    ["W", id ? "Lebih cepat" : "Accelerate"],
    ["S", id ? "Rem" : "Brake"],
    ["SHIFT", "Boost"],
    ["SPACE", id ? "Pindai" : "Scan"],
    ["ESC", id ? "Jeda" : "Pause"],
  ];
  return (
    <div
      className="flight-keys desktop-instructions"
      aria-label={id ? "Panduan tombol PC" : "PC flight controls"}
    >
      {controls.map(([key, label]) => (
        <div key={key}>
          <kbd>{key}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

"use client";
import { CRAFT_SKINS } from "@/game/crafts";
import { useSettingsStore } from "@/store/settingsStore";
export function SkinSelector() {
  const selected = useSettingsStore((state) => state.craftSkin);
  const update = useSettingsStore((state) => state.update);
  const language = useSettingsStore((state) => state.language);
  return (
    <div
      className="courier-skins"
      role="group"
      aria-label={language === "id" ? "Skin roket" : "Courier skin"}
    >
      <span>{language === "id" ? "WARNA KURIR" : "COURIER LIVERY"}</span>
      <div>
        {CRAFT_SKINS.map((skin) => (
          <button
            type="button"
            key={skin.id}
            aria-pressed={selected === skin.id}
            onClick={() => update({ craftSkin: skin.id })}
            aria-label={`${skin.name} skin`}
          >
            <i
              style={{
                background: `linear-gradient(135deg, ${skin.color} 60%, ${skin.trim} 60%)`,
              }}
              aria-hidden="true"
            />
            <span>{skin.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

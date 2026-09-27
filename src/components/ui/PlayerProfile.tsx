"use client";

import { useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { copyFor } from "@/game/copy";
import { useGameStore } from "@/store/gameStore";
import { usePlayerProfileStore } from "@/store/playerProfileStore";
import { useSettingsStore, type Language } from "@/store/settingsStore";

export function PlayerProfile({
  onboarding = false,
}: {
  onboarding?: boolean;
}) {
  const saved = usePlayerProfileStore();
  const [name, setName] = useState(saved.name);
  const [xHandle, setXHandle] = useState(saved.xHandle);
  const [avatarUrl, setAvatarUrl] = useState(saved.avatarUrl);
  const [error, setError] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);
  const language = useSettingsStore((state) => state.language);
  const updateSettings = useSettingsStore((state) => state.update);
  const completeProfile = useGameStore((state) => state.completeProfile);
  const closePanel = useGameStore((state) => state.closePanel);
  const t = copyFor(language);
  const initials = name.trim().slice(0, 2).toUpperCase() || "01";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return setError(t.nameError);
    if (xHandle.trim() && !/^@?[a-zA-Z0-9_]{1,15}$/.test(xHandle.trim()))
      return setError(t.handleError);
    if (avatarUrl.trim()) {
      try {
        if (new URL(avatarUrl.trim()).protocol !== "https:")
          return setError(t.urlError);
      } catch {
        return setError(t.urlError);
      }
    }
    saved.save({ name, xHandle, avatarUrl });
    if (onboarding) completeProfile();
    else closePanel();
  };

  return (
    <section
      className={`profile-screen ${onboarding ? "profile-screen--onboarding" : ""}`}
      aria-label={t.playerProfile}
    >
      <div className="profile-headline">
        <span>DLICOM / 1% LAST MESSAGE</span>
        {!onboarding && (
          <GameButton onClick={closePanel}>{t.close} ×</GameButton>
        )}
      </div>
      <div className="profile-layout">
        <div className="profile-identity-art" aria-hidden="true">
          <span className="profile-orbit profile-orbit--outer" />
          <span className="profile-orbit profile-orbit--inner" />
          <div className="profile-avatar">
            {avatarUrl && !avatarFailed ? (
              // The user supplies this image URL. Next Image cannot know its host in advance.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <strong>{initials}</strong>
            )}
          </div>
          <span className="profile-art-index">
            {language === "id" ? "01 / DATA IDENTITAS" : "01 / IDENTITY RECORD"}
          </span>
        </div>
        <form onSubmit={submit} className="profile-form">
          <span className="micro-label">
            {language === "id"
              ? "IDENTITAS JARINGAN / 01"
              : "NETWORK IDENTITY / 01"}
          </span>
          <h2>{t.playerProfile}</h2>
          <p>{t.profileIntro}</p>
          <label>
            <span>{t.displayName}</span>
            <input
              autoComplete="nickname"
              maxLength={28}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={language === "id" ? "Namamu" : "Your name"}
              required
            />
          </label>
          <label>
            <span>{t.xUsername}</span>
            <div className="profile-handle-field">
              <b>@</b>
              <input
                autoComplete="off"
                maxLength={16}
                value={xHandle}
                onChange={(event) => setXHandle(event.target.value)}
                placeholder="username"
              />
            </div>
          </label>
          <label>
            <span>{t.photoLink}</span>
            <input
              inputMode="url"
              maxLength={2048}
              value={avatarUrl}
              onChange={(event) => {
                setAvatarUrl(event.target.value);
                setAvatarFailed(false);
              }}
              placeholder="https://..."
            />
            <small>{t.photoHint}</small>
          </label>
          <fieldset className="profile-language">
            <legend>{t.language}</legend>
            {(["en", "id"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={language === value ? "active" : ""}
                onClick={() => updateSettings({ language: value as Language })}
              >
                {value === "en" ? "ENGLISH" : "BAHASA INDONESIA"}
              </button>
            ))}
          </fieldset>
          {error && (
            <span className="profile-error" role="alert">
              {error}
            </span>
          )}
          <GameButton variant="primary" type="submit">
            {t.saveProfile} <span aria-hidden="true">↗</span>
          </GameButton>
        </form>
      </div>
    </section>
  );
}

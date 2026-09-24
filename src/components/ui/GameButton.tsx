"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { playSound, unlockAudio } from "@/lib/audio";

interface Props extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  children: ReactNode;
  variant?: "primary" | "menu" | "quiet";
}

export function GameButton({
  children,
  variant = "quiet",
  className = "",
  onClick,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`game-button game-button--${variant} ${className}`}
      onClick={(event) => {
        unlockAudio();
        playSound("click");
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
}

"use client";
import { useMemo } from "react";
import { flightCenter } from "@/game/flightPath";

export function RouteMap({
  stage,
  progress = 0,
  large = false,
}: {
  stage: number;
  progress?: number;
  large?: boolean;
}) {
  const paths = useMemo(() => {
    const points = Array.from({ length: 91 }, (_, i) => {
      const d = i * 20,
        center = flightCenter(-d, stage);
      return {
        x: 16 + (d / 1800) * 288,
        y: 72 - center.x * 0.36,
        alt: 128 - center.y * 0.55,
      };
    });
    const line = (field: "y" | "alt") =>
      points
        .map(
          (p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p[field].toFixed(1)}`,
        )
        .join(" ");
    return { route: line("y"), height: line("alt") };
  }, [stage]);
  const p = Math.max(0, Math.min(1, progress));
  const center = flightCenter(-p * 1800, stage);
  return (
    <svg
      className={`route-map ${large ? "route-map--large" : ""}`}
      viewBox="0 0 320 148"
      role="img"
      aria-label="Curved flight route and elevation profile"
    >
      <defs>
        <pattern
          id={`route-grid-${large ? "large" : "small"}`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M20 0H0V20"
            fill="none"
            stroke="currentColor"
            opacity=".12"
            strokeWidth=".5"
          />
        </pattern>
      </defs>
      <rect
        width="320"
        height="148"
        fill={`url(#route-grid-${large ? "large" : "small"})`}
      />
      <path
        d={paths.route}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        opacity=".1"
      />
      <path
        d={paths.route}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity=".5"
      />
      <path
        d={paths.route}
        fill="none"
        stroke="#ffd894"
        strokeWidth="3"
        pathLength="1"
        strokeDasharray={`${p} 1`}
      />
      <path
        d={paths.height}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".45"
      />
      <circle cx="16" cy="72" r="4" fill="currentColor" />
      <path d="M298 66l6 6-6 6-6-6z" fill="currentColor" />
      <circle
        cx={16 + p * 288}
        cy={72 - center.x * 0.36}
        r="5"
        fill="#ffd894"
        stroke="#122737"
        strokeWidth="2"
      />
    </svg>
  );
}

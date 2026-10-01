import Image from "next/image";

export function GameLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      className={`message-logo ${className}`}
      src="/brand/last-message-logo.svg"
      width={620}
      height={240}
      alt="1% — Last Message"
      priority
      unoptimized
    />
  );
}

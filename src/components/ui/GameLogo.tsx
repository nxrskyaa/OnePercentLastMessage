export function GameLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`message-logo flight-logo ${className}`}
      role="img"
      aria-label="1% — Last Message"
    >
      <span className="logo-charge">
        1<span>%</span>
        <i />
      </span>
      <span className="logo-wordmark">
        LAST
        <br />
        MESSAGE<small>ONE SIGNAL LEFT</small>
      </span>
    </span>
  );
}

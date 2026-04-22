type Props = { className?: string };

export function VerifiedBadge({ className = 'h-5 w-5' }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Signalement vérifié" role="img">
      <defs>
        <linearGradient id="hadar-verified-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0078BA" />
          <stop offset="100%" stopColor="#00327D" />
        </linearGradient>
      </defs>
      <path
        fill="url(#hadar-verified-grad)"
        d="M12 0l2.4 1.8 2.9-.4 1.4 2.5 2.7 1.2-.4 2.9 2 2.2-2 2.2.4 2.9-2.7 1.2-1.4 2.5-2.9-.4L12 24l-2.4-1.8-2.9.4-1.4-2.5-2.7-1.2.4-2.9-2-2.2 2-2.2-.4-2.9 2.7-1.2 1.4-2.5 2.9.4L12 0z"
      />
      <path
        fill="#ffffff"
        d="M10.6 16l-4-4 1.8-1.8 2.2 2.2 5-5 1.8 1.8L10.6 16z"
      />
    </svg>
  );
}

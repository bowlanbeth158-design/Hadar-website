type Props = { className?: string };

export function VerifiedBadge({ className = 'h-5 w-5' }: Props) {
  return (
    <svg
      viewBox="0 0 22 22"
      className={className}
      role="img"
      aria-label="Signalement vérifié"
    >
      <path
        fill="#0095F6"
        d="M11.0298 1.6666L8.6089 0L6.9744 2.3733L4.1094 1.9043L3.7057 4.7143L1.0984 5.9783L2.3271 8.5867L0.5543 10.8621L2.719 12.7754L2.2966 15.5849L5.0972 16.1183L6.3046 18.745L8.8699 17.6196L11 19.7778L13.1301 17.6196L15.6954 18.745L16.9028 16.1183L19.7034 15.5849L19.281 12.7754L21.4457 10.8621L19.6729 8.5867L20.9016 5.9783L18.2943 4.7143L17.8906 1.9043L15.0256 2.3733L13.3911 0L11.0298 1.6666Z"
      />
      <path
        fill="#ffffff"
        d="M15.58 8.2L9.9 13.9L6.4 10.4L8 8.8L9.9 10.7L14 6.6L15.58 8.2Z"
      />
    </svg>
  );
}

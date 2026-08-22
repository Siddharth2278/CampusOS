export function Seal({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="19" stroke="var(--color-brass)" strokeWidth="1.4" />
      <circle cx="20" cy="20" r="15.5" stroke="var(--color-brass)" strokeWidth="0.75" />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fill="var(--color-brass)"
        fontSize="19"
        style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 }}
      >
        C
      </text>
    </svg>
  );
}

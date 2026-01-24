interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-sm" },
    md: { icon: 32, text: "text-base" },
    lg: { icon: 48, text: "text-xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background rounded square */}
        <rect width="48" height="48" rx="12" fill="#E07A5F" />

        {/* Three connected speech bubbles representing team posts */}
        {/* Top left bubble */}
        <path
          d="M12 14C12 12.8954 12.8954 12 14 12H22C23.1046 12 24 12.8954 24 14V20C24 21.1046 23.1046 22 22 22H16L14 24V22H14C12.8954 22 12 21.1046 12 20V14Z"
          fill="white"
          fillOpacity="0.9"
        />

        {/* Top right bubble */}
        <path
          d="M26 10C26 8.89543 26.8954 8 28 8H36C37.1046 8 38 8.89543 38 10V16C38 17.1046 37.1046 18 36 18H30L28 20V18H28C26.8954 18 26 17.1046 26 16V10Z"
          fill="white"
          fillOpacity="0.75"
        />

        {/* Bottom center bubble */}
        <path
          d="M16 28C16 26.8954 16.8954 26 18 26H32C33.1046 26 34 26.8954 34 28V36C34 37.1046 33.1046 38 32 38H22L20 40V38H18C16.8954 38 16 37.1046 16 36V28Z"
          fill="white"
          fillOpacity="0.9"
        />

        {/* Connection lines */}
        <path
          d="M22 22L24 26"
          stroke="white"
          strokeOpacity="0.6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M30 18L28 26"
          stroke="white"
          strokeOpacity="0.6"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Small text lines in bubbles */}
        <rect x="14" y="15" width="8" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
        <rect x="14" y="18" width="5" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />

        <rect x="28" y="11" width="8" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
        <rect x="28" y="14" width="5" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />

        <rect x="19" y="29" width="12" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
        <rect x="19" y="32" width="8" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
        <rect x="19" y="35" width="10" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
      </svg>

      {showText && (
        <span className={`font-semibold text-claude-text ${text}`}>
          TeamPost
        </span>
      )}
    </div>
  );
}

// Icon-only version for compact spaces
export function LogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rounded square */}
      <rect width="48" height="48" rx="12" fill="#E07A5F" />

      {/* Three connected speech bubbles representing team posts */}
      {/* Top left bubble */}
      <path
        d="M12 14C12 12.8954 12.8954 12 14 12H22C23.1046 12 24 12.8954 24 14V20C24 21.1046 23.1046 22 22 22H16L14 24V22H14C12.8954 22 12 21.1046 12 20V14Z"
        fill="white"
        fillOpacity="0.9"
      />

      {/* Top right bubble */}
      <path
        d="M26 10C26 8.89543 26.8954 8 28 8H36C37.1046 8 38 8.89543 38 10V16C38 17.1046 37.1046 18 36 18H30L28 20V18H28C26.8954 18 26 17.1046 26 16V10Z"
        fill="white"
        fillOpacity="0.75"
      />

      {/* Bottom center bubble */}
      <path
        d="M16 28C16 26.8954 16.8954 26 18 26H32C33.1046 26 34 26.8954 34 28V36C34 37.1046 33.1046 38 32 38H22L20 40V38H18C16.8954 38 16 37.1046 16 36V28Z"
        fill="white"
        fillOpacity="0.9"
      />

      {/* Connection lines */}
      <path
        d="M22 22L24 26"
        stroke="white"
        strokeOpacity="0.6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M30 18L28 26"
        stroke="white"
        strokeOpacity="0.6"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Small text lines in bubbles */}
      <rect x="14" y="15" width="8" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
      <rect x="14" y="18" width="5" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />

      <rect x="28" y="11" width="8" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
      <rect x="28" y="14" width="5" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />

      <rect x="19" y="29" width="12" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
      <rect x="19" y="32" width="8" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
      <rect x="19" y="35" width="10" height="1.5" rx="0.75" fill="#E07A5F" fillOpacity="0.4" />
    </svg>
  );
}

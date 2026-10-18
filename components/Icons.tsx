type P = { size?: number; className?: string };

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
});

export const IconSearch = ({ size = 24, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconClose = ({ size = 24, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconClock = ({ size = 24, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconPin = ({ size = 24, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

export const IconPhone = ({ size = 24, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

export const IconLock = ({ size = 24, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconEye = ({ size = 24, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconBell = ({ size = 24, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2z" />
    <path d="M10 21h4" />
  </svg>
);

export const IconPlate = ({ size = 24, className }: P) => (
  <svg {...base(size, className)} strokeWidth={1.6}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4.5" />
  </svg>
);

export const IconRefresh = ({ size = 24, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </svg>
);

/** Oltin to'ldirilgan yulduz (reyting) */
export const IconStar = ({ size = 24, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
    <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" />
  </svg>
);

/** Sakkiz qirrali milliy yulduz (milliy_brand.dart MilliyStar) */
export const MilliyStar = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
    <rect x="5.6" y="5.6" width="12.8" height="12.8" />
    <rect x="5.6" y="5.6" width="12.8" height="12.8" transform="rotate(45 12 12)" />
  </svg>
);

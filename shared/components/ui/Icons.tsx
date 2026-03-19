import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function DotIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="2.2" />
    </svg>
  );
}

export function MoreHorizontalIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 4.5a1 1 0 0 1 .78.38l5 6.2a1 1 0 1 1-1.56 1.24L13 8.27V19a1 1 0 1 1-2 0V8.27l-3.22 4.05a1 1 0 0 1-1.56-1.24l5-6.2A1 1 0 0 1 12 4.5Z" />
    </svg>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 19.5a1 1 0 0 1-.78-.38l-5-6.2a1 1 0 0 1 1.56-1.24L11 15.73V5a1 1 0 1 1 2 0v10.73l3.22-4.05a1 1 0 0 1 1.56 1.24l-5 6.2a1 1 0 0 1-.78.38Z" />
    </svg>
  );
}

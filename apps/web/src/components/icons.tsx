import type { ComponentProps } from "react";

// Decorative icons: always aria-hidden, meaning comes from adjacent text.
type IconProps = Omit<ComponentProps<"svg">, "children">;

function Icon({ children, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function WifiIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 8.5a15 15 0 0 1 20 0" />
      <path d="M5 12a10.5 10.5 0 0 1 14 0" />
      <path d="M8.5 15.5a5.5 5.5 0 0 1 7 0" />
      <path d="M12 19h.01" />
    </Icon>
  );
}

export function DeskIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="11" rx="1.5" />
      <path d="M2 19h20" />
      <path d="M10 15v4M14 15v4" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 12a9 9 0 1 1-6.2-8.6" />
    </Icon>
  );
}

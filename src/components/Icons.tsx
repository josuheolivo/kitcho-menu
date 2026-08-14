import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 19 19 5M8 5h11v11" /></Icon>;
}

export function CheckIcon(props: IconProps) {
  return <Icon {...props}><path d="m5 12 4.2 4.2L19.5 6" /></Icon>;
}

export function GlobeIcon(props: IconProps) {
  return <Icon {...props}><circle cx="12" cy="12" r="8.5" /><path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z" /></Icon>;
}

export function SparkIcon(props: IconProps) {
  return <Icon {...props}><path d="m12 3 1.5 5.2L18.5 10l-5 1.6L12 17l-1.5-5.4L5.5 10l5-1.8L12 3Z" /><path d="m18.5 16 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" /></Icon>;
}

export function QrIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM15 14h2v2h-2zM19 14h1v4h-3M14 19h2v1h4" /></Icon>;
}

export function PenIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 20h4l11-11a2.3 2.3 0 0 0-4-3L4 17v3Z" /><path d="m13.5 7.5 3 3" /></Icon>;
}

export function SettingsIcon(props: IconProps) {
  return <Icon {...props}><circle cx="12" cy="12" r="3" /><path d="M19.2 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-3h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z" /></Icon>;
}

export function MenuIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 6h14M5 12h14M5 18h9" /></Icon>;
}

import type { SVGProps } from 'react';

/**
 * lucide-react v1 no longer ships brand marks, so the social glyphs live here.
 * All icons share a 24x24 box and inherit `currentColor`.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true,
  focusable: false,
} as const;

export function TelegramIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21.7 3.4 2.9 10.6c-1.1.4-1.1 1.1-.2 1.4l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.2-.5-1.8-1.2-1.5ZM7.6 13.1l10.2-6.4c.5-.3.9-.1.6.2L9.7 15l-.3 3.3-1.8-5.2Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M22.5 7.4a2.9 2.9 0 0 0-2-2C18.7 5 12 5 12 5s-6.7 0-8.5.4a2.9 2.9 0 0 0-2 2A30 30 0 0 0 1.1 12a30 30 0 0 0 .4 4.6 2.9 2.9 0 0 0 2 2C5.3 19 12 19 12 19s6.7 0 8.5-.4a2.9 2.9 0 0 0 2-2 30 30 0 0 0 .4-4.6 30 30 0 0 0-.4-4.6ZM9.9 15.1V8.9l5.5 3.1-5.5 3.1Z" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14.9 3h-2.4A4.4 4.4 0 0 0 8.1 7.4V10H5.9v3.2h2.2V21h3.3v-7.8h2.6l.6-3.2h-3.2V7.6c0-.7.4-1.2 1.1-1.2h2.4V3Z" />
    </svg>
  );
}

export function TiktokIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15.6 2.5h-3v13.1a2.7 2.7 0 1 1-2.4-2.7v-3a5.7 5.7 0 1 0 5.4 5.7V9.3a7.7 7.7 0 0 0 4.4 1.5V7.7a4.6 4.6 0 0 1-4.4-4.6v-.6Z" />
    </svg>
  );
}

export function WhatsappIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.6a9.3 9.3 0 0 0-8 14.1L2.6 21.4l4.9-1.3A9.3 9.3 0 1 0 12 2.6Zm0 16.8a7.5 7.5 0 0 1-3.8-1l-.3-.2-2.8.7.8-2.7-.2-.3A7.5 7.5 0 1 1 12 19.4Zm4.2-5.4c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.1 6.1 0 0 1-3-2.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3a3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.6 4c1.6.6 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2c.2-.5.2-.9.2-1 0-.1-.2-.2-.5-.3Z" />
    </svg>
  );
}

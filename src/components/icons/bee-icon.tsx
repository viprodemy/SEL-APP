import { SVGProps } from 'react';

export function BeeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 6s-1-2-4-2-4 2-4 2" />
      <path d="M14 6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2" />
      <path d="M4 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2" />
      <path d="M4 12h12" />
      <path d="M16 12h4" />
      <path d="M10 18v-4" />
      <path d="M14 18v-4" />
    </svg>
  );
}

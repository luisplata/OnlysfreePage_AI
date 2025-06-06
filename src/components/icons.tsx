import type { SVGProps } from 'react';

export function VentaRapidaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="OnlysFree Logo"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      <text
        x="10"
        y="35"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))"
      >
        Onlys
      </text>
      <text
        x="95"
        y="35"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="30"
        fontWeight="normal"
        fill="hsl(var(--accent))"
      >
        Free
      </text>
    </svg>
  );
}

import type { SVGProps } from "react";

export function ToothIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M9.31 4.58c.45-1.11 1.3-2.03 2.4-2.5 1.28-.56 2.76-.23 3.8.7l.83.76c.86.8.96 2.13.29 3.06l-2.9 3.95c-.63.85-.43 2.07.45 2.62l3.4 2.05c1.1.66 1.48 2.05.81 3.16l-.2.32c-.87 1.38-2.53 2.1-4.14 1.77-1.3-.28-2.43-.98-3.3-1.95l-.65-.72c-.88-.97-2.2-.97-3.08 0l-.65.72c-.87.97-2 1.67-3.3 1.95-1.6.33-3.27-.4-4.14-1.77l-.2-.32c-.67-1.1-.29-2.5.81-3.16l3.4-2.05c.88-.55 1.08-1.77.45-2.62l-2.9-3.95a2.21 2.21 0 0 1 .29-3.06l.83-.76c1.04-.93 2.52-1.26 3.8-.7 1.1.47 1.95 1.39 2.4 2.5Z" />
      <path d="M12 13v9" />
    </svg>
  );
}

import type { SVGProps } from "react";

export type IconName =
  | "arrow"
  | "diagonal"
  | "leaf"
  | "shield"
  | "spark"
  | "bolt"
  | "check"
  | "instagram"
  | "chat";
const paths: Record<IconName, string[]> = {
  arrow: ["M4 12h16m-6-6 6 6-6 6"],
  diagonal: ["M5 19 19 5M5 5h14v14"],
  leaf: ["M20 4C8 2 2 9 6 16s16 3 14-12Z", "M4 21 15 10"],
  shield: ["m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z", "m8 12 3 3 5-6"],
  spark: ["m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z"],
  bolt: ["m13 2-9 12h7l-1 8 10-13h-7l1-7Z"],
  check: ["m5 12 4 4L19 6"],
  instagram: [
    "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z",
    "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    "M17.5 6.5h.01",
  ],
  chat: [
    "M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.7A9 9 0 1 1 21 11.5Z",
    "M8 8c0 4 3 7 7 7l1-2-2-1-1 1-3-3 1-1-1-2-2 1Z",
  ],
};
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name].map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  );
}

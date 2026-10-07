import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  size?: "narrow" | "wide";
  className?: string;
}

const MAX_WIDTH = {
  narrow: "max-w-xl",
  wide: "max-w-6xl",
} as const;

export function Container({ children, size = "narrow", className = "" }: ContainerProps) {
  return (
    <main
      className={`mx-auto w-full ${MAX_WIDTH[size]} px-fluid-sm py-fluid-md ${className}`}
    >
      {children}
    </main>
  );
}

import type { ReactNode } from "react";
import { PagoProvider } from "@/components/PagoProvider";

export default function PagoLayout({ children }: { children: ReactNode }) {
  return <PagoProvider>{children}</PagoProvider>;
}

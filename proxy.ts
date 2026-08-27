import { NextRequest, NextResponse } from "next/server";
import { pickVariant, VARIANT_COOKIE, type Variant } from "@/lib/experiment";

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(VARIANT_COOKIE)?.value as
    | Variant
    | undefined;

  if (existing === "base" || existing === "a" || existing === "b") {
    return NextResponse.next();
  }

  const variant = pickVariant(Math.random());
  const response = NextResponse.next();
  // Cookie de sesión: sin maxAge/expires, se borra al cerrar el navegador.
  response.cookies.set(VARIANT_COOKIE, variant, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

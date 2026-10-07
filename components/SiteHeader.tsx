import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-fluid-sm py-fluid-xs">
        <Link href="/" className="text-fluid-base font-semibold tracking-tight">
          Coworking
        </Link>
      </div>
    </header>
  );
}

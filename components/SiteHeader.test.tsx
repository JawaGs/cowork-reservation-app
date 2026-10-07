import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("enlaza el nombre del sitio a la home", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Coworking" })).toHaveAttribute("href", "/");
  });
});

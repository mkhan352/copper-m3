import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

// Only what every version of the home page keeps: the placeholder (Module 0)
// and the landing page (Module 1 on). Module specs test the rest.
describe("Home page", () => {
  it("shows the logo", () => {
    render(<Home />);
    expect(screen.getAllByAltText("Copper State Labs").length).toBeGreaterThan(
      0,
    );
  });

  it("has the fictional-use footer", () => {
    render(<Home />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "Fictional — for educational use.",
    );
  });
});

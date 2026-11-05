import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SetupRequired } from "@/components/setup-required";

describe("SetupRequired", () => {
  it("names the service and the variables to set", () => {
    render(<SetupRequired service="ai" />);
    expect(
      screen.getByText("Set up Google AI to use this page"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("GOOGLE_GENERATIVE_AI_API_KEY"),
    ).toBeInTheDocument();
  });
});

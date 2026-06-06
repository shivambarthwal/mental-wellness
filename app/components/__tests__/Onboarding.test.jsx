import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Onboarding from "../Onboarding";

vi.mock("../../lib/storage", () => ({
  saveUserProfile: vi.fn(),
  saveExamDate: vi.fn(),
}));

describe("Onboarding component", () => {
  it("renders the welcome heading and input fields", () => {
    render(<Onboarding onComplete={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: /welcome to mindspace/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/what should we call you/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/preparing for/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target exam date/i)).toBeInTheDocument();
  });

  it("calls onComplete with name and exam after valid submit", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<Onboarding onComplete={onComplete} />);

    await user.type(screen.getByLabelText(/what should we call you/i), "Asha");
    await user.selectOptions(screen.getByLabelText(/preparing for/i), ["NEET"]);
    await user.click(screen.getByRole("button", { name: /begin journey/i }));

    expect(onComplete).toHaveBeenCalledWith("Asha", "NEET", "");
  });
});

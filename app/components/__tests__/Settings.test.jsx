import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Settings from "../Settings";

const exportData = vi.fn();
const importData = vi.fn();
const clearAllData = vi.fn();

vi.mock("../../lib/storage", () => ({
  exportData,
  importData,
  clearAllData,
}));

describe("Settings component", () => {
  it("renders profile info and action buttons", () => {
    render(
      <Settings
        name="Ravi"
        exam="JEE"
        storageStats={{ totalEntries: 5, checkIns: 3, journalEntries: 2 }}
        onResetProfile={vi.fn()}
        onUpdateStorage={vi.fn()}
      />,
    );

    expect(screen.getByText(/aspirant profile/i)).toBeInTheDocument();
    expect(screen.getByText(/ravi/i)).toBeInTheDocument();
    expect(screen.getByText(/jee/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /edit profile details/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /download backup/i }),
    ).toBeInTheDocument();
  });

  it("calls exportData when export button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Settings
        name="Ravi"
        exam="JEE"
        storageStats={{ totalEntries: 5, checkIns: 3, journalEntries: 2 }}
        onResetProfile={vi.fn()}
        onUpdateStorage={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /download backup/i }));
    expect(exportData).toHaveBeenCalled();
  });

  it("calls reset profile when edit profile button is clicked", async () => {
    const user = userEvent.setup();
    const onResetProfile = vi.fn();

    render(
      <Settings
        name="Ravi"
        exam="JEE"
        storageStats={{ totalEntries: 5, checkIns: 3, journalEntries: 2 }}
        onResetProfile={onResetProfile}
        onUpdateStorage={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /edit profile details/i }),
    );
    expect(onResetProfile).toHaveBeenCalled();
  });
});

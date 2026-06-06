"use client";

import { useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { exportData, importData, clearAllData } from "../lib/storage";

export default function Settings({
  name,
  exam,
  storageStats,
  onResetProfile,
  onUpdateStorage,
}) {
  const [importLoading, setImportLoading] = useState(false);

  const handleExport = () => {
    try {
      exportData();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);

    try {
      await importData(file);
      onUpdateStorage();
      alert("✓ Data imported successfully!");
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import data. Please check the file format.");
    } finally {
      setImportLoading(false);
    }
  };

  const handleClear = () => {
    if (
      confirm(
        "⚠️ WARNING: This will permanently delete all your check-ins, tasks, and journals. This action cannot be undone. Are you sure?",
      )
    ) {
      clearAllData();
      alert("All data cleared successfully.");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800">
          Settings & Data Control
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure your profile details and backup local database logs
        </p>
      </div>

      {/* Profile summary */}
      <Card className="bg-white border-slate-100/80 p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">
          Aspirant Profile
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-xs">
            <span className="text-slate-400">Name</span>
            <span className="font-bold text-slate-700">
              {name || "Not Set"}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-xs">
            <span className="text-slate-400">Target Examination</span>
            <span className="font-bold text-slate-700">
              {exam || "Not Set"}
            </span>
          </div>
          <Button
            onClick={onResetProfile}
            variant="ghost"
            className="w-full text-xs font-semibold py-2.5"
          >
            Edit Profile details
          </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="bg-white border-slate-100/80 p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-800">Backup & Restore</h3>

        <div>
          <h4 className="text-xs font-bold text-slate-700">
            Export Wellness Logs
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 mb-3">
            Download all your mood logs, daily planners, and journal reflection
            history into a portable JSON backup.
          </p>
          <Button
            onClick={handleExport}
            variant="primary"
            className="text-xs py-2.5"
          >
            📥 Download Backup (JSON)
          </Button>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h4 className="text-xs font-bold text-slate-700">Restore Backup</h4>
          <p className="text-[11px] text-slate-400 mt-1 mb-3">
            Load previous entries and preferences back into this browser's
            database.
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              id="import-file-settings"
              style={{ display: "none" }}
              onChange={handleImport}
            />
            <Button
              onClick={() =>
                document.getElementById("import-file-settings").click()
              }
              disabled={importLoading}
              variant="secondary"
              className="text-xs py-2.5"
            >
              {importLoading ? "Restoring logs..." : "📤 Select Backup File"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Storage and Reset */}
      <Card className="bg-slate-50 border-slate-200 p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Storage Information
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-400">Total Entries</span>
              <span className="font-bold text-slate-700">
                {storageStats.totalEntries}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-400">Check-ins</span>
              <span className="font-bold text-slate-700">
                {storageStats.checkIns}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 col-span-2">
              <span className="text-slate-400">Journal Reflections</span>
              <span className="font-bold text-slate-700">
                {storageStats.journalEntries}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-bold text-red-750 mb-2">Danger Zone</h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Irreversibly erase all stored mental wellness tracking logs and
            clear the local storage profile.
          </p>
          <Button
            onClick={handleClear}
            variant="rose"
            className="text-xs py-2.5"
          >
            ⚠️ Wipe All Browser Logs
          </Button>
        </div>
      </Card>
    </div>
  );
}

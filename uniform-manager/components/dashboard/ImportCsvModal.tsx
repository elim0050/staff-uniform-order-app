import { useState } from "react";
import { Modal } from "./Modal";

type ImportCsvModalProps = {
  type: "uniform" | "staff";
  onClose: () => void;
  onImported: (payload: { summaryMessage: string }) => void;
  onError: (message: string) => void;
};

export function ImportCsvModal({
  type,
  onClose,
  onImported,
  onError,
}: ImportCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState<{
    totalRows: number;
    validRows: number;
    invalidRows: { rowNumber: number; error: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    if (!file) return;
    setIsImporting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/import/${type}`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          data?.error ?? data?.message ?? "We could not import this file.";
        setError(message);
        onError(message);
        return;
      }
      const data = await res.json();
      const invalidRows =
        data.invalidRows?.map((row: any) => ({
          rowNumber: row.rowNumber ?? row.row_number ?? 0,
          error: row.error ?? "Invalid row",
        })) ?? [];
      const nextSummary = {
        totalRows: data.totalRows ?? data.total_rows ?? 0,
        validRows: data.validRows ?? data.valid_rows ?? 0,
        invalidRows,
      };
      setSummary(nextSummary);
      const summaryMessage = `Imported ${nextSummary.validRows} of ${nextSummary.totalRows} row(s).`;
      onImported({ summaryMessage });
    } catch (err: any) {
      const message =
        err?.message ?? "We could not import this file right now.";
      setError(message);
      onError(message);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Modal onClose={onClose} ariaLabel="Import staff and uniform data from CSV">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-900">
            Import Staff &amp; Uniform Data
          </h2>
          <p className="text-xs text-zinc-500">
            Upload a CSV file to add or update staff and uniform information.
            Invalid rows will be skipped and listed below.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f ?? null);
                setSummary(null);
                setError(null);
              }}
            />
            <span className="text-sm font-medium text-zinc-800">
              {file ? file.name : "Drop CSV here or click to browse"}
            </span>
            <span>.csv files only</span>
          </label>

          {error && (
            <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {error}
            </div>
          )}

          {summary && (
            <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              <p className="font-medium">
                Import summary: {summary.validRows} of {summary.totalRows} row(s)
                imported.
              </p>
              {summary.invalidRows.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  <p className="font-medium">Skipped rows</p>
                  <div className="max-h-32 overflow-auto rounded border border-emerald-100 bg-white">
                    <table className="min-w-full border-separate border-spacing-0 text-left text-[11px]">
                      <thead className="bg-emerald-50">
                        <tr>
                          <th className="border-b border-emerald-100 px-2 py-1 font-semibold text-emerald-900">
                            Row
                          </th>
                          <th className="border-b border-emerald-100 px-2 py-1 font-semibold text-emerald-900">
                            Issue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.invalidRows.map((row) => (
                          <tr key={row.rowNumber}>
                            <td className="px-2 py-1 text-emerald-900">
                              {row.rowNumber}
                            </td>
                            <td className="px-2 py-1 text-emerald-900">
                              {row.error}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!file || isImporting}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800 disabled:opacity-60"
          >
            {isImporting ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    </Modal>
  );
}


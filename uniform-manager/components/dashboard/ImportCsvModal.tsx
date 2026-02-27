import { useState } from "react"
import { Modal } from "./Modal"

type ImportCsvModalProps = {
  type: "uniform" | "staff"
  onClose: () => void
  onImported: (payload: { summaryMessage: string }) => void
  onError: (message: string) => void
}

type ImportSummary = {
  success: number
  failed: number
  failedMessages: string[]
}

export function ImportCsvModal({
  type,
  onClose,
  onImported,
  onError,
}: ImportCsvModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Uploads the selected CSV file to the server import endpoint and
   * displays a summary of imported/skipped rows.
   */
  async function handleImport() {
    if (!file || isImporting) return

    setIsImporting(true)
    setError(null)

    try {
      // API expects raw CSV text (req.text() on the server).
      const csvText = await file.text()

      const res = await fetch(`/api/import/${type}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: csvText,
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const message =
          data?.error ?? data?.message ?? "We could not import this file."
        setError(message)
        onError(message)
        return
      }

      const nextSummary: ImportSummary = {
        success: Number(data?.success ?? 0),
        failed: Number(data?.failed ?? 0),
        failedMessages: Array.isArray(data?.failedMessages)
          ? data.failedMessages
          : [],
      }

      setSummary(nextSummary)

      const total = nextSummary.success + nextSummary.failed
      onImported({
        summaryMessage: `Imported ${nextSummary.success} of ${total} row(s).`,
      })
    } catch (err: any) {
      const message = err?.message ?? "We could not import this file right now."
      setError(message)
      onError(message)
    } finally {
      setIsImporting(false)
    }
  }

  /**
   * Handles file selection and resets any previous import results.
   */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setSummary(null)
    setError(null)
  }

  return (
    <Modal onClose={onClose} ariaLabel="Import staff and uniform data from CSV">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-900">
            {`Import ${type} data from CSV`}
          </h2>
          <p className="text-xs text-zinc-500">
            Upload a CSV file to add or update {type} information.
            Invalid rows will be skipped and listed below.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
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
                Import summary: {summary.success} imported, {summary.failed}{" "}
                skipped.
              </p>

              {summary.failedMessages.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  <p className="font-medium">Skipped rows</p>
                  <div className="max-h-32 overflow-auto rounded border border-emerald-100 bg-white">
                    <table className="min-w-full border-separate border-spacing-0 text-left text-[11px]">
                      <thead className="bg-emerald-50">
                        <tr>
                          <th className="border-b border-emerald-100 px-2 py-1 font-semibold text-emerald-900">
                            #
                          </th>
                          <th className="border-b border-emerald-100 px-2 py-1 font-semibold text-emerald-900">
                            Issue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.failedMessages.map((msg, i) => (
                          <tr key={`${i}-${msg}`}>
                            <td className="px-2 py-1 text-emerald-900">
                              {i + 1}
                            </td>
                            <td className="px-2 py-1 text-emerald-900">{msg}</td>
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
  )
}
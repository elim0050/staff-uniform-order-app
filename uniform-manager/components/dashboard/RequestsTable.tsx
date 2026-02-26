import type { RequestRow, RequestStatus } from "../../types /types";

type RequestsTableProps = {
  isLoading: boolean;
  error: string | null;
  requests: RequestRow[];
  onRetry: () => void;
};

const statusLabel: Record<RequestStatus, string> = {
  REQUESTED: "Requested",
  DISPATCHED: "Dispatched",
  ARRIVED: "Arrived",
  COLLECTED: "Collected",
};

const statusColorClasses: Record<RequestStatus, string> = {
  REQUESTED: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  DISPATCHED: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
  ARRIVED: "bg-teal-50 text-teal-800 ring-1 ring-teal-100",
  COLLECTED: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100",
};

export function RequestsTable({
  isLoading,
  error,
  requests,
  onRetry,
}: RequestsTableProps) {
  console.log(requests)
  if (isLoading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading requests…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-6 text-center">
        <p className="text-sm font-medium text-rose-900">
          We couldn&apos;t load your requests.
        </p>
        <p className="text-xs text-rose-700">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center justify-center rounded-full bg-rose-900 px-4 py-1.5 text-xs font-medium text-rose-50 hover:bg-rose-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-8 text-center">
        <p className="text-sm font-medium text-zinc-800">
          No uniform requests yet
        </p>
        <p className="max-w-sm text-xs text-zinc-500">
          Once you submit a request, it will appear here so you can track when
          it is dispatched, arrives, and is collected.
        </p>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mb-4 overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr>
            <Th>Staff name</Th>
            <Th>Uniform item</Th>
            <Th>Size</Th>
            <Th>EAN</Th>
            <Th className="text-right">Quantity</Th>
            <Th>Status</Th>
            <Th>Requested on</Th>
            <Th>order id</Th>
            <Th>Notes / flags</Th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, index) => {
            console.log("I'm here listing the request :::::::::", req)
            const showDivider = index !== requests.length - 1;
            const flags: string[] = [];
            if (req.lowStock) flags.push("Low stock");
            if (req.onCooldown) flags.push("On cooldown");

            return (
              <tr
                key={req.id}
                className={`transition-colors hover:bg-zinc-50 ${
                  showDivider ? "border-b border-zinc-100" : ""
                }`}
              >
                <Td>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900">
                      {req.staffName}
                    </span>
                    {req.staffRole && (
                      <span className="text-xs text-zinc-500">
                        {req.staffRole}
                      </span>
                    )}
                  </div>
                </Td>
                <Td>
                  <span className="text-sm text-zinc-800">{req.uniformItem}</span>
                </Td>
                <Td>
                  <span className="text-sm text-zinc-800">{req.uniformSize}</span>
                </Td>
                <Td>
                  <span className="text-sm text-zinc-800">{req.uniformEan}</span>
                </Td>
                <Td className="text-right">
                  <span className="tabular-nums">{req.quantity}</span>
                </Td>
                <Td>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColorClasses[req.status]}`}
                  >
                    {statusLabel[req.status]}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-zinc-600">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </span>
                </Td>
                <Td>
                  <span className="text-sm text-zinc-800">{req.trackingNum}</span>
                </Td>
                <Td>
                  {flags.length ? (
                    <div className="flex flex-wrap gap-1">
                      {flags.map((flag) => (
                        <span
                          key={flag}
                          className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 align-top text-sm text-zinc-800 ${className ?? ""}`}>
      {children}
    </td>
  );
}


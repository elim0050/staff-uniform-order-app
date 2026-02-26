import { useMemo, useState } from "react";
import type {
  RequestRow,
  RequestStatus,
  RoleLimit,
  StaffOption,
  UniformItemOption,
} from "../../types /types";
import { Modal } from "./Modal";

type NewRequestModalProps = {
  staffOptions: StaffOption[];
  uniformOptions: UniformItemOption[];
  roleLimits: RoleLimit[];
  onClose: () => void;
  onCreated: (request: RequestRow) => void;
  onError: (message: string) => void;
};

export function NewRequestModal({
  staffOptions,
  uniformOptions,
  roleLimits,
  onClose,
  onCreated,
  onError,
}: NewRequestModalProps) {
  const [staffId, setStaffId] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const selectedStaff = useMemo(
    () => staffOptions.find((s) => s.id === staffId),
    [staffId, staffOptions]
  );
  const selectedItem = useMemo(
    () => uniformOptions.find((u) => u.id === itemId),
    [itemId, uniformOptions]
  );
  const roleLimit = useMemo(
    () =>
      selectedStaff?.roleName
        ? roleLimits.find((rl) => rl.role === selectedStaff.roleName)
        : undefined,
    [selectedStaff, roleLimits]
  );

  function validateLocally() {
    const next: Record<string, string> = {};
    if (!staffId) next.staffId = "Please choose a staff member.";
    if (!itemId) next.itemId = "Please choose a uniform item.";
    if (quantity === "" || quantity === undefined || quantity === null) {
      next.quantity = "Please enter a quantity.";
    } else if (!Number.isInteger(quantity) || Number(quantity) <= 0) {
      next.quantity = "Quantity must be a positive whole number.";
    }
    if (typeof quantity === "number") {
      if (
        selectedItem?.stockOnHand != null &&
        quantity > selectedItem.stockOnHand
      ) {
        next.quantity = `Quantity cannot exceed available stock (${selectedItem.stockOnHand}).`;
      }
      if (roleLimit && quantity > roleLimit.maxItemsPerPeriod) {
        next.quantity = `Quantity cannot exceed this role's limit (${roleLimit.maxItemsPerPeriod}).`;
      }
    }
    setFieldError(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (selectedStaff?.lastRequestDate && roleLimit?.cooldownDays != null) {
      const last = new Date(selectedStaff.lastRequestDate);
      const now = new Date();
      const diffDays =
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays < roleLimit.cooldownDays) {
        const remaining = Math.ceil(roleLimit.cooldownDays - diffDays);
        const message = `This staff member is still in cooldown for approximately ${remaining} more day(s).`;
        setFormError(message);
        onError(message);
        return;
      }
    }

    if (!validateLocally()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId,
          items: [{ uniform_item_id: itemId, quantity: Number(quantity) }],
          reason: reason || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          data?.error ??
          data?.message ??
          "We could not submit this request right now.";
        setFormError(message);
        onError(message);
        return;
      }

      const created = await res.json();
      const mapped: RequestRow = {
        id: String(created.id),
        staffName:
          created.staff_name ??
          created.staffName ??
          selectedStaff?.name ??
          "Unknown",
        staffRole:
          created.staff_role ?? created.staffRole ?? selectedStaff?.roleName,
        uniformItem:
          created.uniform_item ??
          created.uniformItem ??
          selectedItem?.name ??
          "Uniform item",
        quantity: Number(created.quantity ?? quantity ?? 0),
        status: (created.status as RequestStatus) ?? "REQUESTED",
        requestedAt:
          created.requested_at ?? created.requestedAt ?? new Date().toISOString(),
        lowStock: Boolean(created.low_stock ?? created.lowStock),
        onCooldown: Boolean(created.on_cooldown ?? created.onCooldown),
      };

      onCreated(mapped);
      onClose();
    } catch (err: any) {
      const message =
        err?.message ?? "We could not submit this request right now.";
      setFormError(message);
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function helperText() {
    const parts: string[] = [];
    if (roleLimit) {
      parts.push(
        `Role limit: up to ${roleLimit.maxItemsPerPeriod} item(s) per request.`
      );
    }
    if (selectedItem?.stockOnHand != null) {
      parts.push(`Available stock: ${selectedItem.stockOnHand}.`);
    }
    return parts.join(" ");
  }

  return (
    <Modal onClose={onClose} ariaLabel="Create uniform request">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-900">
            Create Uniform Request
          </h2>
          <p className="text-xs text-zinc-500">
            Choose the staff member, uniform item, and quantity, then submit the
            request.
          </p>
        </header>

        {formError && (
          <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            {formError}
          </div>
        )}

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="staff"
              className="text-xs font-medium text-zinc-800"
            >
              Staff member
            </label>
            <select
              id="staff"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm text-zinc-800 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            >
              <option value="">Select staff</option>
              {staffOptions.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                  {staff.roleName ? ` – ${staff.roleName}` : ""}
                </option>
              ))}
            </select>
            {fieldError.staffId && (
              <p className="text-xs text-rose-600">{fieldError.staffId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="uniform-item"
              className="text-xs font-medium text-zinc-800"
            >
              Uniform item
            </label>
            <select
              id="uniform-item"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm text-zinc-800 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            >
              <option value="">Select item</option>
              {uniformOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.size ? ` (${item.size})` : ""}
                  {typeof item.stockOnHand === "number"
                    ? ` • ${item.stockOnHand} in stock`
                    : ""}
                  {item.lowStock ? " • Low stock" : ""}
                </option>
              ))}
            </select>
            {fieldError.itemId && (
              <p className="text-xs text-rose-600">{fieldError.itemId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="quantity"
              className="text-xs font-medium text-zinc-800"
            >
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={quantity === "" ? "" : quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setQuantity("");
                  return;
                }
                const asNumber = Number(val);

                if (!Number.isFinite(asNumber)) {
                  return;
                }

                const stockLimit =
                  typeof selectedItem?.stockOnHand === "number"
                    ? selectedItem.stockOnHand
                    : undefined;
                const roleLimitMax = roleLimit?.maxItemsPerPeriod;

                let maxAllowed = asNumber;
                if (typeof stockLimit === "number") {
                  maxAllowed = Math.min(maxAllowed, stockLimit);
                }
                if (typeof roleLimitMax === "number") {
                  maxAllowed = Math.min(maxAllowed, roleLimitMax);
                }

                let nextQuantity = asNumber;
                if (maxAllowed < asNumber) {
                  nextQuantity = maxAllowed > 0 ? maxAllowed : quantity || 0;

                  let message: string | undefined;
                  if (
                    typeof stockLimit === "number" &&
                    asNumber > stockLimit
                  ) {
                    message = `Quantity cannot exceed available stock (${stockLimit}).`;
                  } else if (
                    typeof roleLimitMax === "number" &&
                    asNumber > roleLimitMax
                  ) {
                    message = `Quantity cannot exceed this role's limit (${roleLimitMax}).`;
                  }

                  if (message) {
                    setFieldError((prev) => ({ ...prev, quantity: message }));
                    onError(message);
                  }
                } else {
                  setFieldError((prev) => {
                    const { quantity: _ignored, ...rest } = prev;
                    return rest;
                  });
                }

                setQuantity(nextQuantity);
              }}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm text-zinc-800 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            />
            <p className="text-[11px] text-zinc-500">{helperText()}</p>
            {fieldError.quantity && (
              <p className="text-xs text-rose-600">{fieldError.quantity}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="reason"
              className="text-xs font-medium text-zinc-800"
            >
              Notes (optional)
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              placeholder="e.g. New starter, size change, or damaged item replacement."
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800 disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}


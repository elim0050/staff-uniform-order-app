import type { ReactNode } from "react"

type ModalProps = {
  /** Modal content */
  children: ReactNode

  /** Function triggered when modal should close */
  onClose: () => void

  /** Accessible label describing the modal purpose */
  ariaLabel: string
}

/**
 * Reusable accessible modal component.
 *
 * Features:
 * - Closes when clicking outside modal content
 * - Prevents propagation when clicking inside content
 * - Accessible via aria attributes
 *
 * @param children - Modal inner content
 * @param onClose - Callback triggered when modal is dismissed
 * @param ariaLabel - Accessible description of modal purpose
 */
export function Modal({ children, onClose, ariaLabel }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose} // Close when clicking backdrop
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl ring-1 ring-zinc-200"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs text-zinc-500 hover:bg-zinc-50"
          aria-label="Close modal"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  )
}
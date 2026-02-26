import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  ariaLabel: string;
};

export function Modal({ children, onClose, ariaLabel }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl ring-1 ring-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs text-zinc-500 hover:bg-zinc-50"
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}


interface Props {
  isLoading?: boolean;
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirm = ({
  isLoading = false,
  onClose,
  onConfirm,
  isOpen,
}: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-md border border-[#2D3748] bg-[#10141C] p-6 shadow-lg">
        <span className="mb-4 text-center text-[14px] text-white">
          Are you sure you want delete?
        </span>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
import styles from "./ConfirmModal.module.css";

/**
 * ConfirmModal – thay thế window.confirm() bằng popup đẹp
 *
 * Props:
 *  - isOpen      : boolean
 *  - title       : string  (tiêu đề, mặc định "Xác nhận")
 *  - message     : string  (nội dung câu hỏi)
 *  - confirmText : string  (nhãn nút xác nhận, mặc định "Xác nhận")
 *  - cancelText  : string  (nhãn nút huỷ, mặc định "Huỷ")
 *  - variant     : "danger" | "warning" | "info"  (màu sắc nút xác nhận)
 *  - onConfirm   : () => void
 *  - onCancel    : () => void
 */
function ConfirmModal({
  isOpen,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Icon */}
        <div className={`${styles.iconWrapper} ${styles[`icon_${variant}`]}`}>
          {variant === "danger" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          {variant === "warning" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {variant === "info" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h3 id="confirm-modal-title" className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`${styles.confirmBtn} ${styles[`confirm_${variant}`]}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

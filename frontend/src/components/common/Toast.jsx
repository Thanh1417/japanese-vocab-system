import { useEffect } from "react";
import styles from "./Toast.module.css";

/**
 * Toast – thay thế alert() bằng thông báo nổi đẹp
 *
 * Props:
 *  - isOpen   : boolean
 *  - message  : string
 *  - variant  : "error" | "warning" | "success" | "info"
 *  - duration : number (ms, mặc định 3000)
 *  - onClose  : () => void
 */
function Toast({ isOpen, message, variant = "info", duration = 3000, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const icons = {
    error:   "✕",
    warning: "⚠",
    success: "✓",
    info:    "ℹ",
  };

  return (
    <div className={`${styles.toast} ${styles[variant]}`} role="alert">
      <span className={styles.icon}>{icons[variant]}</span>
      <span className={styles.text}>{message}</span>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">✕</button>
    </div>
  );
}

export default Toast;

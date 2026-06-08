import styles from "./LoadingMessage.module.css";

function LoadingMessage({ text = "Đang tải dữ liệu..." }) {
  return <p className={styles.loading}>{text}</p>;
}

export default LoadingMessage;
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./NotFoundPage.module.css";

function NotFoundPage() {
  const { user } = useAuth();

  const homePath = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.code}>404</h1>

        <h2 className={styles.title}>Không tìm thấy trang</h2>

        <p className={styles.description}>
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
        </p>

        <Link className={styles.link} to={homePath}>
          Quay về trang chính
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
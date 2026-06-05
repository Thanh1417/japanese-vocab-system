import AppHeader from "../components/layout/AppHeader";
import AppSidebar from "../components/layout/AppSidebar";
import styles from "./MainLayout.module.css";

function MainLayout({ children }) {
  return (
    <div className={styles.layout}>
      <AppSidebar />

      <div className={styles.main}>
        <AppHeader />

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
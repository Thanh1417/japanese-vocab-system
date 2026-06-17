import styles from "./DashboardCard.module.css";

function DashboardCard({ title, value, icon, colorTheme, subtitle }) {
  // colorTheme sẽ nhận các giá trị: blue, green, purple, orange, red, teal...
  return (
    <div className={`${styles.card} ${styles[colorTheme] || styles.default}`}>
      <div className={styles.iconWrapper}>{icon}</div>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <h2 className={styles.value}>{value}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default DashboardCard;
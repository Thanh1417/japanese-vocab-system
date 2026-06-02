function DashboardCard({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h4
        style={{
          margin: 0,
          color: "#64748b",
        }}
      >
        {title}
      </h4>

      <h2
        style={{
          marginTop: "10px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

export default DashboardCard;
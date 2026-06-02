import AppHeader from "../components/layout/AppHeader";
import AppSidebar from "../components/layout/AppSidebar";

function MainLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <AppSidebar />

      <div
        style={{
          flex: 1,
          background: "#f4f7fb",
        }}
      >
        <AppHeader />

        <main
          style={{
            padding: "20px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
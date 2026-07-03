import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
            Privacy Policy
          </h1>

          <p style={{ fontSize: "20px", color: "#666" }}>
            🚧 This page is currently under development.
          </p>

          <p style={{ marginTop: "15px", color: "#888" }}>
            Our Privacy Policy will be available here soon.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ShippingPolicy() {
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
            Shipping Policy
          </h1>

          <p style={{ fontSize: "20px", color: "#666" }}>
            🚧 This page is currently under development.
          </p>

          <p style={{ marginTop: "15px", color: "#888" }}>
            Our Shipping Policy will be available here soon.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
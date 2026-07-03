import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { authenticatedFetch } from "./authFetch.jsx";
import Payment_scanner from "./UPIImage.jpeg";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Fully Extended Translation System
  const t = {
    en: {
      title: "Checkout",
      subtitle: "Complete your payment to finalize the order.",
      orderSummary: "Order Summary",
      grandTotal: "Grand Total",
      customerDetails: "Customer Details",
      fullName: "Full Name *",
      emailAddress: "Email Address *",
      phoneNumber: "Phone Number *",
      paymentDetails: "Payment Details",
      accountName: "Account Name:",
      accountNameValue: "YEDAGAM EDUCATIONAL SOCIAL DEVELOPMENT AND REO",
      bankName: "Bank Name:",
      bankNameValue: "Indian Overseas Bank",
      accountNumber: "Account Number:",
      ifscCode: "IFSC Code:",
      upiId: "UPI ID:",
      scanToPay: "Scan to Pay",
      paymentInstruction: "Please complete the payment using UPI or Bank Transfer and then click Confirm Order.",
      confirmOrder: "Confirm Order",
      processing: "Submitting...",
      successTitle: "Order Submitted Successfully",
      yourOrderId: "Your Order ID",
      successMessage: "Our team will verify your payment and contact you shortly.",
      backToBooks: "Back to Books",
      goHome: "Go Home",
      validationError: "Please fill in all required customer details.",
      apiError: "An unexpected error occurred.",
      qty: "Qty:",
      subtotal: "Subtotal:",
      loginRequiredTitle: "Login Required",
      loginRequiredDesc: "Please log in to continue your purchase.",
      login: "Login",
      cancel: "Cancel"
    },
    ta: {
      title: "செக்அவுட்",
      subtitle: "ஆர்டரை முடிக்க உங்கள் கட்டணத்தை செலுத்தவும்.",
      orderSummary: "ஆர்டரின் சுருக்கம்",
      grandTotal: "மொத்த தொகை",
      customerDetails: "வாடிக்கையாளர் விவரங்கள்",
      fullName: "முழு பெயர் *",
      emailAddress: "மின்னஞ்சல் முகவரி *",
      phoneNumber: "தொலைபேசி எண் *",
      paymentDetails: "கட்டண விவரங்கள்",
      accountName: "கணக்கு பெயர்:",
      accountNameValue: "YEDAGAM EDUCATIONAL SOCIAL DEVELOPMENT AND REO",
      bankName: "வங்கியின் பெயர்:",
      bankNameValue: "Indian Overseas Bank",
      accountNumber: "கணக்கு எண்:",
      ifscCode: "IFSC குறியீடு:",
      upiId: "UPI ஐடி:",
      scanToPay: "பணம் செலுத்த ஸ்கேன் செய்யவும்",
      paymentInstruction: "UPI அல்லது வங்கி பரிமாற்றம் மூலம் கட்டணத்தை செலுத்தி, பின்னர் 'ஆர்டரை உறுதிப்படுத்து' என்பதை கிளிக் செய்யவும்.",
      confirmOrder: "ஆர்டரை உறுதிப்படுத்து",
      processing: "சமர்ப்பிக்கப்படுகிறது...",
      successTitle: "ஆர்டர் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது",
      yourOrderId: "உங்கள் ஆர்டர் ஐடி",
      successMessage: "எங்கள் குழு உங்கள் கட்டணத்தை சரிபார்த்து விரைவில் உங்களை தொடர்பு கொள்ளும்.",
      backToBooks: "புத்தகங்களுக்கு திரும்பு",
      goHome: "முகப்பிற்கு செல்",
      validationError: "தேவையான அனைத்து விவரங்களையும் நிரப்பவும்.",
      apiError: "எதிர்பாராத பிழை ஏற்பட்டுள்ளது.",
      qty: "அளவு:",
      subtotal: "உப மொத்தம்:",
      loginRequiredTitle: "உள்நுழைவு அவசியம்",
      loginRequiredDesc: "வாங்குதலை தொடர தயவுசெய்து உள்நுழையவும்.",
      login: "உள்நுழையவும்",
      cancel: "ரத்து செய்"
    }
  };

  const { items = [], total = 0 } = location.state || {};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ta');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);

  const text = t[lang] || t.en;

  useEffect(() => {
    const handleLanguageChange = () => {
      setLang(localStorage.getItem("app_lang") || "ta");
    };
    window.addEventListener("storage", handleLanguageChange);
    window.addEventListener("languageChanged", handleLanguageChange);
    return () => {
      window.removeEventListener("storage", handleLanguageChange);
      window.removeEventListener("languageChanged", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    // If user accesses this page directly without items, redirect to books
    if (!items || items.length === 0) {
      navigate("/books");
    }

    // Initial Auth Check
    if (!localStorage.getItem("ACCESS_TOKEN")) {
      setShowLoginModal(true);
    }
  }, [items, navigate]);

  // Handle body scroll locking when modals are open
  useEffect(() => {
    if (showLoginModal || success) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [showLoginModal, success]);

  // Handle Escape key for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showLoginModal) {
        setShowLoginModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLoginModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const cleanPath = url.replace(/\\/g, "/").replace(/^\//, "");
    const baseUrl = (BACKEND_URL || "").replace(/\/$/, "");
    return `${baseUrl}/${cleanPath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Enforce Login before processing payment
    if (!localStorage.getItem("ACCESS_TOKEN")) {
      setShowLoginModal(true);
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      setError(text.validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_id: localStorage.getItem("USER_ID") || "guest",
        user_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        books: items.map((item) => ({
          book_id: item.id,
          quantity: item.quantity,
        })),
      };


     const response = await authenticatedFetch("/book/order/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setOrderId(data.order_id);
      } else {
        setError(data.message || text.apiError);
      }
    } catch (err) {
      console.error("Order Submission Error:", err);
      setError(
        err.response?.data?.detail || text.apiError
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    sessionStorage.setItem("redirect_after_login", location.pathname);
    navigate("/login");
  };

  const closeLoginModal = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setShowLoginModal(false);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="payment-page">
        <div className="payment-container">
          <header className="payment-header">
            <h1 className="payment-title">{text.title}</h1>
            <p className="payment-subtitle">{text.subtitle}</p>
          </header>

          {error && (
            <div className="alert-box alert-error">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <div className="payment-grid">
            {/* Left Column: Order Summary & Customer Details */}
            <div className="payment-left">
              {/* Order Summary Card */}
              <div className="card order-summary-card">
                <h2 className="card-title">{text.orderSummary}</h2>
                <div className="order-items-list">
                  {items.map((item, idx) => {
                    const priceToUse = item.offer ? parseFloat(item.offer) : parseFloat(item.price);
                    const subtotal = priceToUse * item.quantity;
                    return (
                      <div key={item.id || idx} className="order-item">
                        <div className="order-item-img-wrapper">
                          {item.image_url ? (
                            <img
                              src={getImageUrl(item.image_url)}
                              alt={item.title}
                              className="order-item-img"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="order-item-placeholder"
                            style={{ display: item.image_url ? "none" : "flex" }}
                          >
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#94a3b8" strokeWidth="1" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="order-item-details">
                          <h3 className="order-item-title">{item.title}</h3>
                          <p className="order-item-qty">{text.qty} {item.quantity}</p>
                        </div>
                        <div className="order-item-price-box">
                          <p className="order-item-price">₹{priceToUse}</p>
                          <p className="order-item-subtotal">{text.subtotal} ₹{subtotal}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="order-total-row">
                  <span className="total-label">{text.grandTotal}</span>
                  <span className="total-amount">₹{total}</span>
                </div>
              </div>

              {/* Customer Details Card */}
              <div className="card customer-details-card">
                <h2 className="card-title">{text.customerDetails}</h2>
                <form id="payment-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">{text.fullName}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">{text.emailAddress}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">{text.phoneNumber}</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Payment Details */}
            <div className="payment-right">
              <div className="card payment-info-card">
                <h2 className="card-title">{text.paymentDetails}</h2>

                <div className="bank-details-box">
                  <div className="detail-row">
                    <span className="detail-label">{text.accountName}</span>
                    <span className="detail-value">{text.accountNameValue}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{text.bankName}</span>
                    <span className="detail-value">{text.bankNameValue}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{text.accountNumber}</span>
                    <span className="detail-value highlight">136401000027228</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{text.ifscCode}</span>
                    <span className="detail-value">IOBA0004</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{text.upiId}</span>
                    <span className="detail-value highlight">yedagamcentre@iob</span>
                  </div>
                </div>

                <div className="qr-section">
                  <p className="qr-title">{text.scanToPay}</p>

                  <div className="qr-image-wrapper">
                    <img
                      src={Payment_scanner}
                      alt="UPI QR Code"
                      className="qr-image"
                    />
                  </div>
                </div>

                <div className="payment-instruction">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <p>{text.paymentInstruction}</p>
                </div>

                <button
                  type="submit"
                  form="payment-form"
                  className="btn-confirm-order"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div> {text.processing}
                    </>
                  ) : (
                    text.confirmOrder
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="modal-overlay login-overlay" onClick={closeLoginModal}>
          <div className="modal-content login-modal">
            <div className="lock-icon">
              <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2>{text.loginRequiredTitle}</h2>
            <p className="login-message">{text.loginRequiredDesc}</p>
            <div className="modal-actions">
              <button onClick={() => setShowLoginModal(false)} className="btn-modal-outline">
                {text.cancel}
              </button>
              <button onClick={handleLoginRedirect} className="btn-modal-primary">
                {text.login}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>{text.successTitle}</h2>
            <div className="order-id-box">
              <p>{text.yourOrderId}</p>
              <h3>{orderId}</h3>
            </div>
            <p className="success-message">
              {text.successMessage}
            </p>
            <div className="modal-actions">
              <button onClick={() => navigate("/books")} className="btn-modal-outline">
                {text.backToBooks}
              </button>
              <button onClick={() => navigate("/")} className="btn-modal-primary">
                {text.goHome}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ===========================
           Variables & Reset
        =========================== */
        :root {
          --primary: #10b981;
          --primary-dark: #059669;
          --primary-light: #d1fae5;
          --bg-main: #f8fafc;
          --bg-card: #ffffff;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --danger: #ef4444;
          --danger-light: #fee2e2;
          --radius-lg: 16px;
          --radius-md: 12px;
          --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* ===========================
           Layout
        =========================== */
        .payment-page {
          min-height: 100vh;
          background: var(--bg-main);
          background-image: radial-gradient(var(--border) 1px, transparent 1px);
          background-size: 24px 24px;
          padding: 60px 20px 120px 20px;
        }

        .payment-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .payment-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .payment-title {
          font-size: 36px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }

        .payment-subtitle {
          font-size: 18px;
          color: var(--text-muted);
        }

        .payment-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-md);
          padding: 32px;
          margin-bottom: 32px;
        }

        .card-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        /* ===========================
           Order Summary
        =========================== */
        .order-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px dashed var(--border);
        }

        .order-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .order-item-img-wrapper {
          width: 64px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: #f1f5f9;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }

        .order-item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .order-item-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        .order-item-details {
          flex: 1;
        }

        .order-item-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .order-item-qty {
          font-size: 14px;
          color: var(--text-muted);
        }

        .order-item-price-box {
          text-align: right;
        }

        .order-item-price {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .order-item-subtotal {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .order-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 2px solid var(--border);
        }

        .total-label {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
        }

        .total-amount {
          font-size: 28px;
          font-weight: 800;
          color: var(--primary-dark);
        }

        /* ===========================
           Form Styles
        =========================== */
        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 16px;
          color: var(--text-main);
          transition: var(--transition);
          background: #f8fafc;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
          background: #ffffff;
        }

        /* ===========================
           Payment Details Box
        =========================== */
        .payment-info-card {
          position: sticky;
          top: 32px;
        }

        .bank-details-box {
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-bottom: 24px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 15px;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .detail-value {
          color: var(--text-main);
          font-weight: 600;
          text-align: right;
        }

        .detail-value.highlight {
          color: var(--primary-dark);
          font-weight: 700;
          font-family: monospace;
          font-size: 16px;
        }

        .qr-section {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px dashed var(--border);
        }

        .qr-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-main);
        }

        .qr-image-wrapper {
          display: inline-block;
          padding: 12px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
        }

        .qr-image {
          width: 160px;
          height: 160px;
          object-fit: cover;
          display: block;
        }

        .payment-instruction {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: var(--primary-light);
          color: var(--primary-dark);
          padding: 16px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 500;
        }

        .payment-instruction svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .btn-confirm-order {
          width: 100%;
          padding: 18px;
          background: var(--primary);
          color: white;
          font-size: 18px;
          font-weight: 700;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
        }

        .btn-confirm-order:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
        }

        .btn-confirm-order:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ===========================
           Alerts & Modals
        =========================== */
        .alert-box {
          padding: 16px 24px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          font-weight: 500;
        }

        .alert-error {
          background: var(--danger-light);
          color: #b91c1c;
          border: 1px solid #fca5a5;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: #fff;
          border-radius: 24px;
          padding: 48px 32px;
          width: 100%;
          max-width: 500px;
          text-align: center;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
        }

        .lock-icon {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          color: var(--text-main);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
        }

        .modal-content h2 {
          font-size: 24px;
          color: var(--text-main);
          margin-bottom: 16px;
          font-weight: 800;
        }

        .order-id-box {
          background: #f8fafc;
          border: 1px dashed var(--border);
          padding: 16px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
        }

        .order-id-box p {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .order-id-box h3 {
          font-size: 24px;
          color: var(--primary-dark);
          font-family: monospace;
          letter-spacing: 2px;
        }

        .success-message, .login-message {
          color: var(--text-muted);
          margin-bottom: 32px;
          font-size: 16px;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 16px;
        }

        .btn-modal-outline {
          flex: 1;
          padding: 14px;
          border: 2px solid var(--border);
          background: transparent;
          color: var(--text-main);
          font-weight: 600;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
        }

        .btn-modal-outline:hover {
          border-color: var(--text-muted);
          background: #f8fafc;
        }

        .btn-modal-primary {
          flex: 1;
          padding: 14px;
          border: none;
          background: var(--primary);
          color: white;
          font-weight: 600;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
        }

        .btn-modal-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ===========================
           Responsive
        =========================== */
        @media(max-width: 992px) {
          .payment-grid {
            grid-template-columns: 1fr;
          }
          
          .payment-info-card {
            position: static;
          }
        }

        @media(max-width: 600px) {
          .payment-page {
            padding: 32px 16px 80px 16px;
          }
          
          .card {
            padding: 24px 20px;
          }
          
          .modal-content {
            padding: 40px 24px;
          }
          
          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
      <Footer />
    </>
  );
}
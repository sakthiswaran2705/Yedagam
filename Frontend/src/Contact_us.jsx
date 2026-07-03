import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Contact() {
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "en");

  const translations = {
    en: {
      title: "Contact Us",
      subtitle: "We would love to hear from you. Please fill out the form below.",
      fullName: "Full Name",
      email: "Email Address",
      place: "Place",
      district: "District",
      mobile: "Mobile Number",
      enterName: "Enter your full name",
      enterEmail: "Enter your email address",
      enterPlace: "Enter your place",
      enterMobile: "Enter your mobile number",
      selectDistrict: "Select District",
      submit: "Submit",
      submitting: "Submitting...",
      reset: "Reset",
      success: "Contact details submitted successfully.",
      error: "Something went wrong. Please try again.",
      contactInfo: "Contact Information",
      thankYou: "Thank You!",
      doneBtn: "Done",
    },
    ta: {
      title: "எங்களை தொடர்பு கொள்ளுங்கள்",
      subtitle: "உங்கள் தகவல்களை கீழே உள்ள படிவத்தில் பதிவு செய்யுங்கள்.",
      fullName: "முழு பெயர்",
      email: "மின்னஞ்சல் முகவரி",
      place: "ஊர்",
      district: "மாவட்டம்",
      mobile: "கைபேசி எண்",
      enterName: "உங்கள் முழு பெயரை உள்ளிடவும்",
      enterEmail: "உங்கள் மின்னஞ்சலை உள்ளிடவும்",
      enterPlace: "உங்கள் ஊரை உள்ளிடவும்",
      enterMobile: "உங்கள் கைபேசி எண்ணை உள்ளிடவும்",
      selectDistrict: "மாவட்டத்தை தேர்வு செய்யவும்",
      submit: "தகவலை அனுப்பவும்",
      submitting: "அனுப்பப்படுகிறது...",
      reset: "அழிக்கவும்",
      success: "தொடர்பு தகவல் வெற்றிகரமாக பதிவு செய்யப்பட்டது.",
      error: "ஏதோ தவறு ஏற்பட்டுள்ளது. மீண்டும் முயற்சிக்கவும்.",
      contactInfo: "தொடர்பு தகவல்",
      thankYou: "நன்றி!",
      doneBtn: "சரி",
    },
  };

  const t = translations[lang];

  const districts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivagangai", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
    "Vellore", "Viluppuram", "Virudhunagar",
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    place: "",
    district: "",
    mobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleReset = () => {
    setForm({
      name: "",
      email: "",
      place: "",
      district: "",
      mobile: "",
    });
    setMessage("");
    setError("");
  };

  const closePopup = () => {
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("place", form.place);
      formData.append("district", form.district);
      formData.append("mobile", form.mobile);

      const response = await axios.post(
        `${BACKEND_URL}/contact/details/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Trigger the success popup
      setMessage(response.data.message || t.success);

      // Clear form inputs
      setForm({
        name: "",
        email: "",
        place: "",
        district: "",
        mobile: "",
      });

    } catch (err) {
      setError(err.response?.data?.detail || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar onLanguageChange={setLang} />

      <div className="contact-page">

        {/* --- SUCCESS POPUP MODAL --- */}
        {message && (
          <div className="popup-overlay">
            <div className="popup-card">
              <div className="popup-icon-wrapper">
                <div className="popup-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <h2 className="popup-title">{t.thankYou}</h2>
              <p className="popup-message">{message}</p>
              <button className="btn submit-btn popup-btn" onClick={closePopup}>
                {t.doneBtn}
              </button>
            </div>
          </div>
        )}

        <div className="contact-card">
          <div className="contact-header">
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            {/* Keeping inline error just in case, but success is now a modal */}
            {error && (
              <div className="alert error-message">
                <span className="icon">⚠</span> {error}
              </div>
            )}

            <div className="form-section-title">
              <h2>{t.contactInfo}</h2>
              <hr />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>{t.fullName}</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t.enterName}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.email}</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t.enterEmail}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.place}</label>
                <input
                  type="text"
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  placeholder={t.enterPlace}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.district}</label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    {t.selectDistrict}
                  </option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label>{t.mobile}</label>
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder={t.enterMobile}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn reset-btn"
                onClick={handleReset}
                disabled={loading}
              >
                {t.reset}
              </button>
              <button
                type="submit"
                className="btn submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-text">{t.submitting}</span>
                ) : (
                  t.submit
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* ===========================
           Variables & Resets
        =========================== */
        :root {
          --primary: #10b981;
          --primary-dark: #059669;
          --primary-light: #d1fae5;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --bg-main: #f8fafc;
          --bg-card: #ffffff;
          --border: #e2e8f0;
          --error: #ef4444;
          --error-light: #fee2e2;
          --transition: all 0.25s ease;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* ===========================
           Layout
        =========================== */
        .contact-page {
          min-height: 100vh;
          padding: 60px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--bg-main);
          background-image: radial-gradient(var(--border) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .contact-card {
          width: 100%;
          max-width: 800px;
          background: var(--bg-card);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05), 
                      0 0 0 1px rgba(0,0,0,0.03);
        }

        /* ===========================
           Header
        =========================== */
        .contact-header {
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
          color: white;
          padding: 48px 40px;
          text-align: center;
        }

        .contact-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .contact-header p {
          font-size: 16px;
          opacity: 0.9;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* ===========================
           Form
        =========================== */
        .contact-form {
          padding: 40px;
        }

        .form-section-title {
          margin-bottom: 30px;
        }

        .form-section-title h2 {
          font-size: 20px;
          color: var(--text-main);
          font-weight: 600;
        }

        .form-section-title hr {
          border: none;
          height: 3px;
          width: 40px;
          background: var(--primary);
          margin-top: 8px;
          border-radius: 2px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        /* ===========================
           Inputs
        =========================== */
        .form-group label {
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input,
        .form-group select {
          padding: 14px 16px;
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 15px;
          color: var(--text-main);
          transition: var(--transition);
          appearance: none;
        }

        .form-group select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 40px;
        }

        .form-group input::placeholder,
        .form-group select::placeholder {
          color: #94a3b8;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          background: #ffffff;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-light);
        }

        /* ===========================
           Buttons
        =========================== */
        .button-group {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
          gap: 16px;
        }

        .btn {
          padding: 14px 28px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .reset-btn {
          background: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border);
        }

        .reset-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: var(--text-main);
        }

        .submit-btn {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          min-width: 200px;
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
        }

        /* ===========================
           Alerts & Popups
        =========================== */
        .error-message {
          background: var(--error-light);
          color: #b91c1c;
          border-left: 4px solid var(--error);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        /* Popup Overlay */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: overlayFadeIn 0.3s ease forwards;
        }

        .popup-card {
          background: var(--bg-card);
          padding: 40px 30px;
          border-radius: 24px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: cardPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .popup-icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .popup-icon {
          width: 80px;
          height: 80px;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: iconBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s forwards;
          transform: scale(0);
        }

        .popup-icon svg {
          width: 40px;
          height: 40px;
        }

        .popup-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 12px;
        }

        .popup-message {
          font-size: 16px;
          color: var(--text-muted);
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .popup-btn {
          width: 100%;
          padding: 16px;
        }

        /* Animations */
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cardPopIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes iconBounce {
          0% { transform: scale(0); }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        /* ===========================
           Responsive
        =========================== */
        @media(max-width: 768px) {
          .contact-page {
            padding: 20px 16px;
          }
          .contact-header {
            padding: 40px 24px;
          }
          .contact-form {
            padding: 24px;
          }
          .form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .button-group {
            flex-direction: column-reverse;
          }
          .btn {
            width: 100%;
          }
        }
      `}</style>
        <Footer />
    </>
  );
}
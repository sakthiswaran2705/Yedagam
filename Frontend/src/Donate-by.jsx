import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar.jsx";
import {authenticatedFetch} from "./authFetch.jsx";
import { Heart, Mail, Phone, MessageSquare, CheckCircle2, XCircle, X, Loader2 } from 'lucide-react';
import Footer from "./Footer.jsx";
import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Donate = () => {
  // Language State
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });

  const [formData, setFormData] = useState({
    message: '',
    email: '',
    phone: '',
  });

  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Translations
  const t = {
    en: {
      title: "Support Our Mission",
      subtitle: "Your contributions help us keep the platform running. Every donation empowers us to do more.",
      messageLabel: "Why are you donating?",
      messagePlaceholder: "Leave a note for the team...",
      contactDivider: "Provide at least one way to reach you",
      emailLabel: "Email Address",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+91 ",
      submitBtn: "Submit",
      processing: "Processing...",
      successTitle: "Thank You!",
      successDesc: "Your donation request has been successfully received. We will reach out to you shortly.",
      errorTitle: "Submission Failed",
      errorMissingContact: "Please provide either an email address or a phone number.",
      errorApi: "Something went wrong while submitting the request. Please try again.",
      closeBtn: "Close"
    },
    ta: {
      title: "எங்கள் பணிக்கு ஆதரவளிக்கவும்",
      subtitle: "உங்கள் பங்களிப்புகள் இத்தளத்தை தொடர்ந்து இயக்க உதவுகின்றன. ஒவ்வொரு நன்கொடையும் எங்களை மேலும் செயல்பட வைக்கிறது.",
      messageLabel: "நீங்கள் ஏன் நன்கொடை அளிக்கிறீர்கள்?",
      messagePlaceholder: "குழுவுக்கு ஒரு குறிப்பை எழுதவும்...",
      contactDivider: "உங்களை தொடர்புகொள்ள குறைந்தபட்சம் ஒரு வழியை வழங்கவும்",
      emailLabel: "மின்னஞ்சல் முகவரி",
      emailPlaceholder: "you@example.com",
      phoneLabel: "தொலைபேசி எண்",
      phonePlaceholder: "+91",
      submitBtn: "நன்கொடை கோரிக்கையைச் சமர்ப்பிக்கவும்",
      processing: "செயலாக்கப்படுகிறது...",
      successTitle: "நன்றி!",
      successDesc: "உங்கள் நன்கொடை கோரிக்கை பெறப்பட்டது. நாங்கள் விரைவில் உங்களை தொடர்புகொள்வோம்.",
      errorTitle: "சமர்ப்பிப்பு தோல்வியடைந்தது",
      errorMissingContact: "மின்னஞ்சல் அல்லது தொலைபேசி எண்ணை வழங்கவும்.",
      errorApi: "கோரிக்கையைச் சமர்ப்பிக்கும்போது ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.",
      closeBtn: "மூடு"
    }
  };

  const text = t[lang] || t.en;

  useEffect(() => {
    const handleStorageChange = () => {
      setLang(localStorage.getItem('app_lang') || 'en');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setStatus({
    loading: true,
    error: null,
    success: false,
  });

  if (!formData.email && !formData.phone) {
    setStatus({
      loading: false,
      error: "missing_contact",
      success: false,
    });
    setIsModalOpen(true);
    return;
  }

  try {
    const payload = new FormData();
    payload.append("message", formData.message);

    if (formData.email) payload.append("email", formData.email);
    if (formData.phone) payload.append("phone", formData.phone);

    const response = await axios.post(
      `${BACKEND_URL}/donate-by/`,
      payload
    );

    const data = response.data;

    if (!data.status) {
      throw new Error(data.message || "api_error");
    }

    setStatus({
      loading: false,
      error: null,
      success: true,
    });

    setFormData({
      message: "",
      email: "",
      phone: "",
    });

    setIsModalOpen(true);

  } catch (error) {
    setStatus({
      loading: false,
      error: error.message || "api_error",
      success: false,
    });

    setIsModalOpen(true);
  }
};

  const closeModal = () => setIsModalOpen(false);

  return (
    <>

      <style>{styles}</style>
      <div className="donate-page-wrapper">
        <Navbar />

        <main className="donate-layout">
          {/* Left Hero Section */}
          <section className="donate-hero">
            <div className="hero-content">
              <div className="icon-wrapper">
                <Heart size={40} className="heart-icon" fill="currentColor" />
              </div>
              <h1 className="hero-title">{text.title}</h1>
              <p className="hero-subtitle">{text.subtitle}</p>

              <div className="hero-decoration">
                <div className="blur-circle circle-1"></div>
                <div className="blur-circle circle-2"></div>
              </div>
            </div>
          </section>

          {/* Right Form Section */}
          <section className="donate-form-section">
            <div className="form-card">
              <form onSubmit={handleSubmit} className="custom-form">

                {/* Message Input */}
                <div className="input-group">
                  <label htmlFor="message">
                    {text.messageLabel} <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <MessageSquare size={20} className="input-icon" />
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={text.messagePlaceholder}
                      className="custom-input textarea"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="form-divider">
                  <span>{text.contactDivider}</span>
                </div>

                {/* Email Input */}
                <div className="input-group">
                  <label htmlFor="email">{text.emailLabel}</label>
                  <div className="input-wrapper">
                    <Mail size={20} className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={text.emailPlaceholder}
                      className="custom-input"
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div className="input-group">
                  <label htmlFor="phone">{text.phoneLabel}</label>
                  <div className="input-wrapper">
                    <Phone size={20} className="input-icon" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={text.phonePlaceholder}
                      className="custom-input"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status.loading}
                  className={`submit-btn ${status.loading ? 'loading' : ''}`}
                >
                  {status.loading ? (
                    <>
                      <Loader2 size={20} className="spinner" />
                      {text.processing}
                    </>
                  ) : (
                    text.submitBtn
                  )}
                </button>

              </form>
            </div>
          </section>
        </main>

        {/* Custom Animated Popup Modal */}
        {isModalOpen && (
          <div className="custom-modal-overlay" onClick={closeModal}>
            <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>

              <div className={`modal-icon-container ${status.success ? 'success' : 'error'}`}>
                {status.success ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
              </div>

              <h2 className="modal-title">
                {status.success ? text.successTitle : text.errorTitle}
              </h2>

              <p className="modal-desc">
                {status.success
                  ? text.successDesc
                  : (status.error === 'missing_contact' ? text.errorMissingContact : text.errorApi)
                }
              </p>

              <button
                className={`modal-action-btn ${status.success ? 'success' : 'error'}`}
                onClick={closeModal}
              >
                {text.closeBtn}
              </button>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
};

// --- PERFECT CUSTOM CSS ---
const styles = `
  :root {
    --brand-primary: #4F46E5;
    --brand-primary-hover: #4338CA;
    --brand-secondary: #EC4899;
    --bg-main: #F8FAFC;
    --surface: #FFFFFF;
    --text-main: #0F172A;
    --text-muted: #64748B;
    --border-color: #E2E8F0;
    --success: #10B981;
    --error: #EF4444;
  }

  * {
    box-sizing: border-box;
  }

  .donate-page-wrapper {
    min-height: 100vh;
    background-color: var(--bg-main);
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
  }

  /* Layout */
  .donate-layout {
    display: flex;
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 2rem;
    gap: 4rem;
    align-items: center;
  }

  /* Left Hero */
  .donate-hero {
    flex: 1;
    position: relative;
  }

  .hero-content {
    position: relative;
    z-index: 10;
  }

  .icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(236, 72, 153, 0.1));
    border-radius: 24px;
    color: var(--brand-secondary);
    margin-bottom: 2rem;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    color: var(--text-main);
    line-height: 1.1;
    margin: 0 0 1.5rem 0;
    letter-spacing: -0.02em;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 90%;
  }

  /* Decorative Background Blurs */
  .hero-decoration {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  }

  .blur-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
  }

  .circle-1 {
    width: 300px;
    height: 300px;
    background: var(--brand-primary);
    top: -10%;
    left: -10%;
  }

  .circle-2 {
    width: 250px;
    height: 250px;
    background: var(--brand-secondary);
    bottom: -10%;
    right: 10%;
  }

  /* Right Form */
  .donate-form-section {
    flex: 1;
    width: 100%;
    max-width: 500px;
  }

  .form-card {
    background: var(--surface);
    padding: 3rem;
    border-radius: 32px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.02);
  }

  .custom-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .required {
    color: var(--error);
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 1rem;
    color: #94A3B8;
    pointer-events: none;
  }

  .custom-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    background: var(--bg-main);
    border: 2px solid transparent;
    border-radius: 16px;
    font-size: 1rem;
    color: var(--text-main);
    transition: all 0.3s ease;
    outline: none;
  }

  .custom-input::placeholder {
    color: #94A3B8;
  }

  .custom-input:focus {
    background: var(--surface);
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }

  .textarea {
    resize: none;
    padding-top: 1rem;
    align-items: flex-start;
  }
  
  .input-wrapper:has(.textarea) .input-icon {
    top: 1rem;
  }

  /* Form Divider */
  .form-divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 0.5rem 0;
  }

  .form-divider::before,
  .form-divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--border-color);
  }

  .form-divider span {
    padding: 0 1rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    color: var(--text-muted);
  }

  /* Submit Button */
  .submit-btn {
    margin-top: 1rem;
    width: 100%;
    padding: 1.25rem;
    background: var(--brand-primary);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .submit-btn:hover:not(.loading) {
    background: var(--brand-primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
  }

  .submit-btn:active:not(.loading) {
    transform: translateY(0);
  }

  .submit-btn.loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  /* --- POPUP MODAL --- */
  .custom-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease forwards;
    padding: 1rem;
  }

  .custom-modal-content {
    background: var(--surface);
    width: 100%;
    max-width: 400px;
    border-radius: 32px;
    padding: 2.5rem 2rem;
    position: relative;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .close-btn {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    background: var(--bg-main);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #F1F5F9;
    color: var(--text-main);
  }

  .modal-icon-container {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem auto;
  }

  .modal-icon-container.success {
    background: #D1FAE5;
    color: var(--success);
  }

  .modal-icon-container.error {
    background: #FEE2E2;
    color: var(--error);
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-main);
    margin: 0 0 0.75rem 0;
  }

  .modal-desc {
    font-size: 0.95rem;
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0 0 2rem 0;
  }

  .modal-action-btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 700;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .modal-action-btn.success {
    background: var(--text-main);
  }
  .modal-action-btn.success:hover {
    background: #000000;
  }

  .modal-action-btn.error {
    background: var(--error);
  }
  .modal-action-btn.error:hover {
    background: #DC2626;
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 968px) {
    .donate-layout {
      flex-direction: column;
      padding: 2rem 1.5rem;
      gap: 3rem;
    }
    
    .donate-hero {
      text-align: center;
    }
    
    .hero-subtitle {
      max-width: 100%;
    }
    
    .form-card {
      padding: 2rem;
    }
  }

  @media (max-width: 480px) {
    .hero-title {
      font-size: 2.5rem;
    }
    .form-card {
      padding: 1.5rem;
      border-radius: 24px;
    }
  }
`;

export default Donate;
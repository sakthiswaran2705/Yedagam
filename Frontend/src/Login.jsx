import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Hexagon } from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ======================================================
//                 ANIMATION VARIANTS
// ======================================================
const toastVariants = {
  initial: { opacity: 0, y: -50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25, delay: 0.1 } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
};

const iconDrawVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: "easeInOut", delay: 0.2 } }
};

// ======================================================
//                  MAIN AUTH COMPONENT
// ======================================================
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Auth Modes ---
  const [isLogin, setIsLogin] = useState(true);

  // --- Form States ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // --- UI States ---
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Popup States ---
  const [toast, setToast] = useState(null);
  const [modalType, setModalType] = useState(null);

  const showToast = (type, message, title = "") => {
    setToast({ type, message, title });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Security Validators ---
  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // ================= HANDLERS =================

  // 1. LOGIN
  const handleLogin = async () => {
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      return showToast("warning", "Please enter your email and password.", "Missing Fields");
    }
    if (!validateEmail(email)) {
      return showToast("warning", "Invalid email format.", "Validation");
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("username", email.trim());
      fd.append("password", password);

      const res = await fetch(`${BACKEND_URL}/login/`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("ACCESS_TOKEN", data.access_token);
        localStorage.setItem("REFRESH_TOKEN", data.refresh_token);
        localStorage.setItem("FIRST_NAME", data.firstname);
        localStorage.setItem("LAST_NAME", data.lastname);
        localStorage.setItem("USER_EMAIL", data.email);
        localStorage.setItem("USER_STATUS", data.status);

        showToast("success", "Login Successful!", "Welcome Back");

        // Role-Based Redirect
        const redirectPath = data.status === "admin" ? "/dashboard" : "/";
        setTimeout(() => { navigate(redirectPath, { replace: true }); }, 1000);
      } else {
        showToast("error", data.detail || "Incorrect email or password.", "Login Failed");
      }
    } catch (err) {
      showToast("error", "A server connection error occurred.", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (loading) return;

    if (!firstname.trim() || !lastname.trim()) return showToast("warning", "Please enter your full name.", "Validation");
    if (!email.trim()) return showToast("warning", "Please enter your email address.", "Validation");
    if (!validateEmail(email)) return showToast("warning", "Invalid email format.", "Validation");
    if (password.length < 6) return showToast("warning", "Password must be at least 6 characters.", "Weak Password");
    if (password !== confirmPassword) return showToast("warning", "Passwords do not match.", "Validation");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("firstname", firstname.trim());
      fd.append("lastname", lastname.trim());
      fd.append("email", email.trim());
      fd.append("password", password);

      const res = await fetch(`${BACKEND_URL}/register/`, { method: "POST", body: fd });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        setModalType("success");
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
        setFirstname("");
        setLastname("");
      } else {
        showToast("error", data.detail || data.message || "Registration failed.", "Error");
      }
    } catch {
      showToast("error", "A server connection error occurred.", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI RENDERING =================
  return (
    <div style={styles.mainWrapper}>
      <style>
        {`
          :root {
            --success: #10b981;
            --error: #ef4444;
            --warning: #f59e0b;
            --primary: #4F46E5;
          }
          * { box-sizing: border-box; }
          
          /* Toast System */
          .custom-popup-toast {
            position: fixed; top: 24px; left: 50%; transform: translateX(-50%); z-index: 999999;
            min-width: 320px; max-width: 400px;
            background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
            border-radius: 16px; padding: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.4);
            display: flex; align-items: flex-start; gap: 12px;
          }
          .popup-icon-box {
            width: 40px; height: 40px; border-radius: 12px; display: flex;
            align-items: center; justify-content: center; flex-shrink: 0;
          }
          .popup-icon-box.success { background: rgba(16, 185, 129, 0.15); color: var(--success); }
          .popup-icon-box.error { background: rgba(239, 68, 68, 0.15); color: var(--error); }
          .popup-icon-box.warning { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
          .popup-content h5 { margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #0f172a; }
          .popup-content p { margin: 0; font-size: 13px; color: #64748b; font-weight: 500; line-height: 1.4; }

          /* Modals */
          .modal-overlay {
            position: fixed; inset: 0; z-index: 9999999;
            background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center; padding: 20px;
          }
          .modal-card {
            background: #ffffff; width: 100%; max-width: 440px;
            padding: 40px 32px; border-radius: 24px; text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          .modal-icon-circle {
            width: 80px; height: 80px; margin: 0 auto 24px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
          }
          .modal-icon-circle.success { background: rgba(16, 185, 129, 0.1); border: 2px solid rgba(16, 185, 129, 0.2); }
          
          .modal-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
          .modal-body { background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 32px; border: 1px solid #e2e8f0; }
          .body-en { font-size: 14px; color: #334155; font-weight: 600; margin: 0 0 12px 0; line-height: 1.5; }

          .modal-btn {
            width: 100%; padding: 14px; border: none; border-radius: 12px;
            font-size: 15px; font-weight: 700; cursor: pointer; color: white;
            transition: transform 0.1s, opacity 0.2s, box-shadow 0.2s;
          }
          .modal-btn.success { background: #10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3); }
          .modal-btn:hover { opacity: 0.9; transform: translateY(-1px); }
          
          /* Placeholders */
          ::placeholder { color: #94a3b8; font-weight: 500; }

          /* Animations */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .input-focus:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        `}
      </style>

      <Navbar />

      <div style={styles.authContainer}>
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div style={styles.headerContainer}>
            <motion.div
              style={styles.logoWrapper}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Hexagon size={42} color="#4F46E5" strokeWidth={1.5} />
            </motion.div>
            <h2 style={styles.heading}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p style={styles.subHeading}>
              {isLogin ? "Please enter your details to sign in." : "Fill out the form below to get started."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); isLogin ? handleLogin() : handleRegister(); }}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.nameGroup}
                >
                  <input className="input-focus" style={styles.halfInput} placeholder="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                  <input className="input-focus" style={styles.halfInput} placeholder="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={styles.inputWrapper}>
              <label style={styles.label}>Email Address</label>
              <input
                className="input-focus"
                style={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={styles.inputWrapper}>
              <label style={styles.label}>Password</label>
              <div style={styles.passBox}>
                <input className="input-focus" style={styles.passInput} type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeIcon} aria-label="Toggle password visibility">
                  {showPass ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div style={styles.optionsContainer}>
                <label style={styles.rememberMe}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <span style={styles.forgotLink}>Forgot Password?</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.inputWrapper}
                >
                  <label style={styles.label}>Confirm Password</label>
                  <div style={styles.passBox}>
                    <input className="input-focus" style={styles.passInput} type={showConfirmPass ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeIcon} aria-label="Toggle confirm password visibility">
                      {showConfirmPass ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              style={{ ...styles.submitButton, opacity: loading ? 0.8 : 1 }}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loader}></span>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </motion.button>
          </form>

          {/* Toggle Form Mode */}
          <p style={styles.link} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? (
              <>Don't have an account? <span style={styles.linkBold}>Register</span></>
            ) : (
              <>Already have an account? <span style={styles.linkBold}>Sign In</span></>
            )}
          </p>
        </motion.div>
      </div>

      {/* ======================================= */}
      {/* TOAST NOTIFICATIONS                     */}
      {/* ======================================= */}
      <AnimatePresence>
        {toast && (
          <motion.div className="custom-popup-toast" variants={toastVariants} initial="initial" animate="animate" exit="exit" style={{ x: "-50%" }}>
            <div className={`popup-icon-box ${toast.type}`}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <XCircle size={20} />}
              {toast.type === 'warning' && <AlertTriangle size={20} />}
            </div>
            <div className="popup-content">
              {toast.title && <h5>{toast.title}</h5>}
              <p>{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================= */}
      {/* MODALS SYSTEM                           */}
      {/* ======================================= */}
      <AnimatePresence>
        {modalType && (
          <motion.div className="modal-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit">
            {modalType === "success" && (
              <motion.div className="modal-card" variants={modalVariants}>
                <div className="modal-icon-circle success">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d="M20 6L9 17l-5-5" variants={iconDrawVariants} initial="hidden" animate="visible" />
                  </svg>
                </div>
                <h2 className="modal-title">Account Created!</h2>
                <div className="modal-body">
                  <p className="body-en">Your registration was successful.<br/>You can now log in with your credentials.</p>
                </div>
                <button className="modal-btn success" onClick={() => setModalType(null)}>Login Now</button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>  
  );
}

// ================= JSS STYLES (Premium SaaS UI) =================
const styles = {
  mainWrapper: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minHeight: "100vh",
    background: "radial-gradient(circle at top left, #f3f4f6, #e5e7eb)",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  authContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "48px 40px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)",
  },
  headerContainer: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logoWrapper: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "16px",
  },
  heading: {
    margin: "0 0 8px 0",
    fontWeight: 800,
    fontSize: "28px",
    color: "#0f172a",
    letterSpacing: "-0.5px"
  },
  subHeading: {
    margin: 0,
    fontSize: "15px",
    color: "#64748b",
    fontWeight: 500
  },
  nameGroup: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    overflow: "hidden"
  },
  halfInput: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    fontSize: "15px",
    background: "rgba(248, 250, 252, 0.8)",
    outline: "none",
    width: "100%",
    color: "#0f172a",
    transition: "all 0.2s ease"
  },
  inputWrapper: {
    marginBottom: "20px",
    overflow: "hidden"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#475569"
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    fontSize: "15px",
    background: "rgba(248, 250, 252, 0.8)",
    outline: "none",
    color: "#0f172a",
    transition: "border-color 0.2s, box-shadow 0.2s"
  },
  passBox: {
    position: "relative",
  },
  passInput: {
    width: "100%",
    padding: "14px 46px 14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    fontSize: "15px",
    background: "rgba(248, 250, 252, 0.8)",
    outline: "none",
    color: "#0f172a",
    transition: "all 0.2s ease"
  },
  eyeIcon: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    background: "none",
    border: "none",
  },
  optionsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    marginTop: "-4px"
  },
  rememberMe: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 500,
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    borderRadius: "6px",
    accentColor: "#4F46E5",
    cursor: "pointer",
  },
  forgotLink: {
    fontSize: "14px",
    color: "#4F46E5",
    cursor: "pointer",
    fontWeight: 600
  },
  submitButton: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    fontWeight: 700,
    color: "#ffffff",
    background: "#0f172a",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "56px"
  },
  link: {
    textAlign: "center",
    marginTop: "24px",
    marginBottom: 0,
    fontWeight: 500,
    fontSize: "15px",
    color: "#64748b",
    cursor: "pointer"
  },
  linkBold: {
    color: "#4F46E5",
    fontWeight: 700
  },
  loader: {
    display: "inline-block",
    width: "22px",
    height: "22px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderRadius: "50%",
    borderTopColor: "#fff",
    animation: "spin 1s ease-in-out infinite",
  }
};
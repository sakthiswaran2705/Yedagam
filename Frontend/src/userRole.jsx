import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Mail, ShieldCheck, AlertCircle, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { authenticatedFetch } from "./authFetch"; // Ensure this matches your project structure
import Footer from "./Footer.jsx"

const translations = {
  en: {
    pageTitle: "Access & Role Management",
    pageSubtitle: "Modify user permissions and monitor system administrators.",
    assignRole: "Assign Role",
    assignDesc: "Enter the user's email and select their new system clearance level.",
    emailPlaceholder: "user@example.com",
    regUser: "Regular User",
    admin: "Administrator",
    updateBtn: "Update Permissions",
    lastUpdated: "Last Updated Account",
    sysDir: "System Directory",
    liveData: "Live Data",
    adminsLabel: "Administrators",
    usersLabel: "Regular Users",
    noAdmins: "No administrators found or update pending.",
    noUsers: "No users found or update pending.",
    emailError: "Please enter a valid email address.",
    successRoleMsg: "Role updated successfully!"
  },
  ta: {
    adminProcess: "அட்மின் செயல்முறை",
    categoryOp: "பிரிவுகள் விருப்பங்கள்",
    userToAdmin: "பயனர் முதல் அட்மின் வரை",
    adminPanel: "அட்மின் பேனல்",
    signOut: "வெளியேறு",
    pageTitle: "அணுகல் மற்றும் பங்கு மேலாண்மை",
    pageSubtitle: "பயனர் அனுமதிகளை மாற்றி, கணினி நிர்வாகிகளைக் கண்காணிக்கவும்.",
    assignRole: "பங்கு ஒதுக்கீடு",
    assignDesc: "பயனரின் மின்னஞ்சலை உள்ளிட்டு, புதிய அனுமதியைத் தேர்ந்தெடுக்கவும்.",
    emailPlaceholder: "user@example.com",
    regUser: "வழக்கமான பயனர்",
    admin: "நிர்வாகி",
    updateBtn: "அனுமதிகளைப் புதுப்பி",
    lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்ட கணக்கு",
    sysDir: "கணினி கோப்பகம்",
    liveData: "நேரலை தரவு",
    adminsLabel: "நிர்வாகிகள்",
    usersLabel: "வழக்கமான பயனர்கள்",
    noAdmins: "நிர்வாகிகள் யாரும் இல்லை அல்லது தரவு நிலுவையில் உள்ளது.",
    noUsers: "பயனர்கள் யாரும் இல்லை அல்லது தரவு நிலுவையில் உள்ளது.",
    emailError: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    successRoleMsg: "பங்கு வெற்றிகரமாக புதுப்பிக்கப்பட்டது!"
  }
};

const UserRoleManager = () => {
  // --- Language State ---
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang] || translations.en;

  // --- Component State ---
  const [email, setEmail] = useState('');
  const [availableEmails, setAvailableEmails] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const containerRef = useRef(null);

  // State to hold the backend response data
  const [systemData, setSystemData] = useState({
    target: null,
    admins: { count: 0, emails: [] },
    users: { count: 0, emails: [] }
  });

  // Fetch Available Emails on Load
  useEffect(() => {
    const fetchUserEmails = async () => {
      try {
        const response = await authenticatedFetch('/user-emails/');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && Array.isArray(data.emails)) {
            setAvailableEmails(data.emails);
          }
        }
      } catch (error) {
        console.error("Failed to load user autocomplete list", error);
      }
    };

    fetchUserEmails();
  }, []);

  // Close custom popup if clicking outside of the form input container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter emails dynamically based on input characters
  const filteredEmails = availableEmails.filter((item) =>
    item.toLowerCase().includes(email.toLowerCase()) && item.toLowerCase() !== email.toLowerCase()
  );

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRoleChange = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast(t.emailError, 'error');
      return;
    }

    setIsLoading(true);
    setShowDropdown(false);

    try {
      const response = await authenticatedFetch('/change-user-role/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          status: selectedRole
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update user role.');
      }

      setSystemData({
        target: data.target_account,
        admins: data.admins,
        users: data.users
      });

      showToast(data.message || t.successRoleMsg, 'success');
      setEmail('');

    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="role-manager-wrapper">
        <div className="container">
          <header className="page-header">
            <div className="header-icon">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1>{t.pageTitle}</h1>
              <p className="subtitle">{t.pageSubtitle}</p>
            </div>
          </header>

          <div className="layout-grid">
            {/* LEFT COLUMN: ACTION FORM */}
            <div className="action-column">
              <div className="glass-card form-card">
                <h3>{t.assignRole}</h3>
                <p className="card-desc">{t.assignDesc}</p>

                <form onSubmit={handleRoleChange}>
                  {/* Added containerRef to look out for outside clicks */}
                  <div className="input-group" ref={containerRef}>
                    <div className="input-icon"><Mail size={18} /></div>
                    <input
                      type="email"
                      placeholder={t.emailPlaceholder}
                      className="custom-input"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      autoComplete="off"
                      required
                    />

                    {/* UI Floating Filtering Popup Box */}
                    <AnimatePresence>
                      {showDropdown && email && filteredEmails.length > 0 && (
                        <motion.ul
                          className="autocomplete-popup"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                        >
                          {filteredEmails.map((suggestedEmail) => (
                            <li
                              key={suggestedEmail}
                              onClick={() => {
                                setEmail(suggestedEmail);
                                setShowDropdown(false);
                              }}
                            >
                              {suggestedEmail}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="segmented-control">
                    <button
                      type="button"
                      className={`segment-btn ${selectedRole === 'user' ? 'active user-active' : ''}`}
                      onClick={() => setSelectedRole('user')}
                    >
                      <User size={16} /> {t.regUser}
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${selectedRole === 'admin' ? 'active admin-active' : ''}`}
                      onClick={() => setSelectedRole('admin')}
                    >
                      <Shield size={16} /> {t.admin}
                    </button>
                  </div>

                  <button type="submit" className="btn-submit" disabled={isLoading || !email}>
                    {isLoading ? <Loader2 className="spinner" size={18} /> : t.updateBtn}
                  </button>
                </form>
              </div>

              {/* Status Display */}
              <AnimatePresence>
                {systemData.target && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card target-status-card"
                  >
                    <h4>{t.lastUpdated}</h4>
                    <div className="target-info">
                      <span className="target-email">{systemData.target.email}</span>
                      <span className={`badge ${systemData.target.assigned_role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {systemData.target.assigned_role}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: LIVE DIRECTORY */}
            <div className="directory-column">
              <div className="glass-card directory-card">
                <div className="directory-header">
                  <h3>{t.sysDir}</h3>
                  <span className="live-indicator">{t.liveData}</span>
                </div>

                <div className="lists-container">
                  {/* ADMINS LIST */}
                  <div className="role-list-section">
                    <div className="list-header">
                      <div className="list-title">
                        <Shield size={16} className="text-admin" />
                        <h4>{t.adminsLabel}</h4>
                      </div>
                      <span className="count-pill admin-pill">{systemData.admins.count}</span>
                    </div>

                    <div className="email-list">
                      {systemData.admins.count === 0 ? (
                        <p className="empty-text">{t.noAdmins}</p>
                      ) : (
                        <AnimatePresence>
                          {systemData.admins.emails.map(adminEmail => (
                            <motion.div
                              key={`admin-${adminEmail}`}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="email-item admin-item"
                            >
                              <ChevronRight size={14} /> {adminEmail}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </div>

                  <hr className="divider" />

                  {/* USERS LIST */}
                  <div className="role-list-section">
                    <div className="list-header">
                      <div className="list-title">
                        <User size={16} className="text-user" />
                        <h4>{t.usersLabel}</h4>
                      </div>
                      <span className="count-pill user-pill">{systemData.users.count}</span>
                    </div>

                    <div className="email-list">
                      {systemData.users.count === 0 ? (
                        <p className="empty-text">{t.noUsers}</p>
                      ) : (
                        <AnimatePresence>
                          {systemData.users.emails.map(userEmail => (
                            <motion.div
                              key={`user-${userEmail}`}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="email-item user-item"
                            >
                              <ChevronRight size={14} /> {userEmail}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Global Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`toast-notification ${toast.type}`}
            >
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
};

// --- CSS Styles Updated for Popups ---
const styles = `
  :root {
    --primary: #4F46E5;
    --admin-color: #8B5CF6;
    --admin-bg: #F5F3FF;
    --user-color: #3B82F6;
    --user-bg: #EFF6FF;
    --bg-color: #F8FAFC;
    --card-bg: rgba(255, 255, 255, 0.8);
    --border: #E2E8F0;
    --text-main: #0F172A;
    --text-muted: #64748B;
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05);
    --radius-lg: 16px;
    --radius-md: 12px;
  }

  .role-manager-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-color) 0%, #EEF2FF 100%);
    padding: 0 0 3rem 0;
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--text-main);
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 3rem;
  }
  .header-icon {
    background: linear-gradient(135deg, var(--primary), #818CF8);
    color: white;
    padding: 1rem;
    border-radius: var(--radius-md);
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  }
  .page-header h1 { margin: 0 0 0.25rem 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
  .subtitle { color: var(--text-muted); margin: 0; font-size: 1rem; }

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 2rem;
  }

  @media (max-width: 768px) {
    .layout-grid { grid-template-columns: 1fr; }
  }

  .glass-card {
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 2rem;
  }

  .form-card h3 { margin-top: 0; font-size: 1.25rem; margin-bottom: 0.5rem; }
  .card-desc { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2rem; line-height: 1.5; }

  .input-group { position: relative; margin-bottom: 1.5rem; }
  .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); z-index: 2; }
  .custom-input { width: 100%; padding: 1rem 1rem 1rem 3rem; border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 1rem; outline: none; transition: all 0.2s; box-sizing: border-box; background: rgba(255,255,255,0.9); position: relative; z-index: 1; }
  .custom-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

  /* Autocomplete Custom Dropdown Styles */
  .autocomplete-popup {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    margin: 4px 0 0 0;
    padding: 0;
    list-style: none;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    z-index: 100;
  }
  .autocomplete-popup li {
    padding: 0.75rem 1rem 0.75rem 3rem;
    cursor: pointer;
    font-size: 0.95rem;
    color: var(--text-main);
    transition: background 0.15s ease;
  }
  .autocomplete-popup li:hover {
    background: #F1F5F9;
    color: var(--primary);
  }

  .segmented-control {
    display: flex;
    background: #F1F5F9;
    padding: 0.35rem;
    border-radius: var(--radius-md);
    margin-bottom: 2rem;
    gap: 0.35rem;
  }
  .segment-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    background: transparent;
    color: var(--text-muted);
    transition: all 0.2s ease-out;
  }
  .segment-btn.active { background: white; color: var(--text-main); box-shadow: var(--shadow-md); }
  .segment-btn.user-active { color: var(--user-color); }
  .segment-btn.admin-active { color: var(--admin-color); }

  .btn-submit {
    width: 100%;
    background: var(--primary);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    transition: all 0.2s;
  }
  .btn-submit:hover:not(:disabled) { background: #4338CA; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
  .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

  .target-status-card { margin-top: 1.5rem; padding: 1.5rem; background: linear-gradient(to right, #ffffff, #f8fafc); border-left: 4px solid var(--primary); }
  .target-status-card h4 { margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .target-info { display: flex; justify-content: space-between; align-items: center; }
  .target-email { font-weight: 600; font-size: 1.05rem; }

  .directory-card { height: 100%; display: flex; flex-direction: column; }
  .directory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
  .directory-header h3 { margin: 0; font-size: 1.25rem; }
  .live-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; color: var(--success); background: #ECFDF5; padding: 0.25rem 0.75rem; border-radius: 99px; }
  .live-indicator::before { content: ''; width: 6px; height: 6px; background: #10B981; border-radius: 50%; animation: pulse 2s infinite; }

  .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .list-title { display: flex; align-items: center; gap: 0.5rem; }
  .list-title h4 { margin: 0; font-size: 1.05rem; }
  .text-admin { color: var(--admin-color); }
  .text-user { color: var(--user-color); }

  .count-pill { font-size: 0.85rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 99px; }
  .admin-pill { background: var(--admin-bg); color: var(--admin-color); }
  .user-pill { background: var(--user-bg); color: var(--user-color); }

  .email-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 250px; overflow-y: auto; padding-right: 0.5rem; }
  .email-list::-webkit-scrollbar { width: 4px; }
  .email-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

  .email-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #fff; border: 1px solid var(--border); border-radius: 8px; font-size: 0.95rem; font-weight: 500; }
  .admin-item { border-left: 3px solid var(--admin-color); }
  .user-item { border-left: 3px solid var(--user-color); }
  .empty-text { color: var(--text-muted); font-size: 0.9rem; font-style: italic; }

  .divider { border: 0; border-top: 1px dashed var(--border); margin: 2rem 0; }

  .badge { font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 700; text-transform: capitalize; }
  .badge-admin { background: var(--admin-bg); color: var(--admin-color); }
  .badge-user { background: var(--user-bg); color: var(--user-color); }

  .spinner { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

  .toast-notification { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: var(--radius-md); display: flex; align-items: center; gap: 0.75rem; font-weight: 600; box-shadow: var(--shadow-lg); z-index: 1000; color: white; }
  .toast-notification.success { background: #10B981; }
  .toast-notification.error { background: #EF4444; }
`;

export default UserRoleManager;

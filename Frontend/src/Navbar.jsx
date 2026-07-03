import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Navbar = ({ onLanguageChange }) => {
  const navigate = useNavigate();

  // Authentication State
  const token = localStorage.getItem("ACCESS_TOKEN");
  const userStatus = localStorage.getItem("USER_STATUS");
  const isLoggedIn = !!token;

  // Language State
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const toggleLanguage = (selectedLang) => {
    setLang(selectedLang);
    localStorage.setItem('app_lang', selectedLang);
    if (onLanguageChange) {
      onLanguageChange(selectedLang);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("FIRST_NAME");
    localStorage.removeItem("LAST_NAME");
    localStorage.removeItem("USER_EMAIL");
    localStorage.removeItem("USER_STATUS");

    navigate("/");
    window.location.reload();
  };

  // Fetch Notifications
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notification/?lang=${lang}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, [isLoggedIn, lang, token]);

  // Handle clicking outside of notification dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Notification Click
  const handleNotificationClick = (blogId) => {
    setIsNotifOpen(false);
    if (blogId) {
      navigate(`/blog/${blogId}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <style>{`
        /* Core Containers */
        .news-navbar {
          width: 100%;
          background: #ffffff;
          font-family: system-ui, -apple-system, sans-serif;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        /* Top Bar Section - 3 Column Grid */
        .nav-top-row {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.2rem 2rem;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }

        /* Left Actions (Search & Language) */
        .nav-left-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          justify-self: start;
        }

        .search-icon-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        
        .search-icon-btn:hover {
          color: #111827;
        }

        /* Simple Language Box */
        .simple-lang-box {
          display: flex;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }

        .simple-lang-btn {
          background: #ffffff;
          border: none;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: bold;
          cursor: pointer;
          color: #6b7280;
        }

        .simple-lang-btn.selected {
          background: #f3f4f6;
          color: #111827;
        }

        /* Centered Branding (Logo Image + Red Text) */
        .nav-center-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-decoration: none;
          justify-self: center;
        }

        .navbar-logo-img {
          width: 55px;
          height: 55px;
          object-fit: contain;
          border-radius: 8px;
        }

        .brand-text-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .brand-main-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #dc2626; /* Red color from reference */
          margin: 0;
          line-height: 1.1;
        }

        .brand-sub-title {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        /* Right Actions (Notifications & Profile/Login) */
        .nav-right-actions {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          justify-self: end;
        }

        /* Profile/Login Pill Button */
        .profile-login-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-login-pill:hover {
          background-color: #f3f4f6;
        }

        .mini-logout-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 600;
        }
        .mini-logout-btn:hover { color: #dc2626; }

        /* Bottom Row - Navigation Links */
        .nav-bottom-row {
          border-top: 1px solid #f3f4f6;
          background: #ffffff;
        }

        .nav-links-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
        }

        .nav-links-container::-webkit-scrollbar {
          height: 4px;
        }
        .nav-links-container::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 4px;
        }

        .nav-item-link {
          padding: 0.85rem 1.2rem;
          color: #111827;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          cursor: pointer;
          display: inline-block;
          transition: color 0.2s ease;
        }

        .nav-item-link:hover {
          color: #dc2626;
        }

        .nav-item-link.active-home {
          color: #dc2626; /* Highlights Home just like the reference */
        }

        /* Notifications Dropdown Elements */
        .notif-wrapper { position: relative; }
        .bell-icon-btn {
          background: transparent;
          border: none;
          color: #4b5563;
          cursor: pointer;
          position: relative;
          padding: 6px;
          display: flex;
        }
        .notif-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #ef4444;
          color: white;
          font-size: 0.6rem;
          font-weight: bold;
          height: 16px;
          min-width: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notif-dropdown {
          position: absolute;
          top: 35px;
          right: 0;
          width: 320px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 1050;
          overflow: hidden;
        }
        .notif-header { padding: 1rem; border-bottom: 1px solid #e5e7eb; font-weight: bold; font-size: 0.9rem; background: #f9fafb;}
        .notif-body { max-height: 300px; overflow-y: auto; }
        .notif-item { padding: 1rem; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
        .notif-item.unread { background-color: #eff6ff; }
        .notif-empty { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.9rem; }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .nav-top-row {
            padding: 1rem;
            grid-template-columns: auto 1fr auto;
            gap: 10px;
          }
          .nav-left-actions { gap: 0.5rem; }
          .navbar-logo-img { width: 40px; height: 40px; }
          .brand-main-title { font-size: 1.5rem; }
          .brand-sub-title { font-size: 0.6rem; }
          .nav-links-container { padding: 0 1rem; }
          .nav-item-link { padding: 0.75rem 0.85rem; font-size: 0.85rem; }
          .profile-login-pill span { display: none; /* Hide text on mobile, show only icon */ }
        }
      `}</style>

      <nav className="news-navbar">
        {/* TOP ROW: Search, Logo & Branding, User Login */}
        <div className="nav-top-row">

          <div className="nav-left-actions">


            {/* Language Selection */}
            <div className="simple-lang-box">
              <button
                className={`simple-lang-btn ${lang === 'ta' ? 'selected' : ''}`}
                onClick={() => toggleLanguage('ta')}
              >
                தமிழ்
              </button>
              <button
                className={`simple-lang-btn ${lang === 'en' ? 'selected' : ''}`}
                onClick={() => toggleLanguage('en')}
              >
                EN
              </button>
            </div>
          </div>

          {/* Central Branding: YOUR Logo + Red Text styling */}
          <div className="nav-center-brand" onClick={() => navigate("/")}>
            <img src="/yedagam_main.jpeg" alt="Yedagam Logo" className="navbar-logo-img" />
            <div className="brand-text-col">
              <h1 className="brand-main-title">
                {lang === "ta" ? "ஏடகம்" : "Yedagam"}
              </h1>
              <span className="brand-sub-title">
                {lang === "ta" ? "தமிழ் அறிவு மையம்" : "Tamil Knowledge Hub"}
              </span>
            </div>
          </div>

          <div className="nav-right-actions">
            {/* Notification Setup */}
            {isLoggedIn && (
              <div className="notif-wrapper" ref={notifRef}>
                <button className="bell-icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
                  <Bell size={22} />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>

                {isNotifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      {lang === "ta" ? "அறிவிப்புகள்" : "Notifications"}
                    </div>
                    <div className="notif-body">
                      {notifications.length > 0 ? (
                        notifications.map((notif, idx) => (
                          <div
                            key={idx}
                            className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notif.blog_id)}
                          >
                            <strong>{notif.title}</strong>
                            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.85rem' }}>{notif.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="notif-empty">
                          {lang === "ta" ? "புதிய அறிவிப்புகள் இல்லை" : "No new notifications"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login / Profile Container */}
            {/* Login / Profile Container */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isLoggedIn ? (
                <>
                  <button
                    className="profile-login-pill"
                    onClick={() => {
                      if (userStatus === "admin") {
                        // Opens the dashboard in a new tab securely
                        window.open("/dashboard", "_blank", "noopener,noreferrer");
                      } else {
                        // Optional: If you have a profile route for non-admins, add it here
                        // navigate("/profile");
                      }
                    }}
                  >
                    <User size={16} />
                    <span>{userStatus === "admin" ? (lang === "ta" ? "நிர்வாகி" : "Admin") : (lang === "ta" ? "சுயவிவரம்" : "Profile")}</span>
                  </button>
                  <button className="mini-logout-btn" onClick={handleLogout}>
                    {lang === "ta" ? "வெளியேறு" : "Logout"}
                  </button>
                </>
              ) : (
                <button className="profile-login-pill" onClick={() => navigate("/login")}>
                  <User size={16} />
                  <span>{lang === "ta" ? "உள்நுழைய (Login)" : "Login"}</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* BOTTOM ROW: Your Original Navigation Links */}
        <div className="nav-bottom-row">
          <div className="nav-links-container">
            <span className="nav-item-link active-home" onClick={() => navigate("/")}>
              {lang === "ta" ? "முகப்பு" : "Home"}
            </span>

            <span className="nav-item-link" onClick={() => navigate("/category")}>
              {lang === "ta" ? "பிரிவுகள்" : "Categories"}
            </span>
            <span className="nav-item-link" onClick={() => navigate("/Book")}>
              {lang === "ta" ? "புத்தகங்கள்" : "Books"}
             </span>
            <span className="nav-item-link" onClick={() => navigate("/CourseUser")}>
              {lang === "ta" ? "பாடநெறிகள்" : "courses"}
             </span><span className="nav-item-link" onClick={() => navigate("/membership")}>
              {lang === "ta" ? "உறுப்பினர் சேர்க்கை" : "Memebership"}
             </span>
            <span className="nav-item-link" onClick={() => navigate("/Scanner")}>
              {lang === "ta" ? "கட்டணங்கள்" : "Payments"}
             </span>

            <span className="nav-item-link" onClick={() => navigate("/Donate")}>
              {lang === "ta" ? "புத்தக நன்கொடை " : "Book Donation"}
             </span>
            <span className="nav-item-link" onClick={() => navigate("/About")}>
              {lang === "ta" ? "எங்களைப் பற்றி" : "About of trust"}
             </span>
            <span className="nav-item-link" onClick={() => navigate("/Contact")}>
              {lang === "ta" ? "தொடர்புக்கு" : "Contact"}
             </span>
          </div>
        </div>
      </nav>

    </>

  );
};

export default Navbar;
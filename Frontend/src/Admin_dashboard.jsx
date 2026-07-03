import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Settings,
  FolderOpen,
  LogOut,
  Users,
  Book,
  HandHeart,
  Contact,
  CreditCard,
  GraduationCap,
  Menu,
  Receipt,
  Form,
  X
} from 'lucide-react';
import Footer from './Footer.jsx';

// --- TRANSLATION DICTIONARY ---
const translations = {
  en: {
    adminPanel: "Admin Panel",
    adminProcess: "Admin Process",
    categoryOp: "Category Operations",
    userToAdmin: "User to Admin",
    Book_store: "Book store",
    coursesoperations: "Courses Operations",
    DonateList: "Donater Messages",
    ContactCheck: "Contact Detail",
    Payments: "Payments",
    Book_orders:"Book orders",
    Membership_detail:"Membership-detail",
    signOut: "Sign Out"
  },
  ta: {
    adminPanel: "அட்மின் பேனல்",
    adminProcess: "நிர்வாகி செயல்முறை",
    categoryOp: "பிரிவுகள் செயல்பாடுகள்",
    userToAdmin: "பயனர் முதல் நிர்வாகி வரை",
    coursesoperations: "பாடநெறிச் செயல்பாடுகள்",
    Book_store: "புத்தகக் கடை",
    DonateList: "நன்கொடையாளர் செய்திகள்",
    ContactCheck: "தொடர்பு விவரம்",
    Book_orders:"புத்தக ஆர்டர்கள்",
    Payments: "கட்டணங்கள்",
    Membership_detail:"உறுப்பினர் விவரம்",
    signOut: "வெளியேறு"
  }
};

// ======================================================
// LAYOUT: SIDEBAR
// ======================================================
const Sidebar = ({ lang, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[lang] || translations.en;

  const menu = [
    { name: t.adminProcess, path: '/AdminProcess', icon: Settings },
    { name: t.categoryOp, path: '/category_op', icon: FolderOpen },
    { name: t.Book_store, path: '/BookStore', icon: Book },
    { name: t.userToAdmin, path: '/UserRoleManager', icon: Users },
    { name: t.coursesoperations, path: '/CourseAdminPanel', icon: GraduationCap },
    { name: t.DonateList, path: '/DonateList', icon: HandHeart },
    { name: t.ContactCheck, path: '/ContactCheck', icon: Contact },
    { name: t.Payments, path: '/Payments', icon: CreditCard },
    { name: t.Book_orders, path: '/Bookorders', icon: Receipt },
    { name: t.Membership_detail, path: '/MembershipForm-admin', icon: Form },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={toggleSidebar}
      />

      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-wrapper">
            <div className="sidebar-logo">A</div>
          </div>
          <div className="sidebar-title-wrapper">
            <h2>{t.adminPanel}</h2>
            <span className="sidebar-subtitle">Administration</span>
          </div>
          <button className="mobile-close-btn" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menu.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <div
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={item.name}
              >
                <item.icon size={20} className="nav-icon" />
                <span className="nav-text">{item.name}</span>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn-signout"
            onClick={() => { localStorage.clear(); navigate('/'); }}
          >
            <LogOut size={20} />
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// ======================================================
// APP ROOT
// ======================================================
const AdminDashboard = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Check if we are at the root of the dashboard
  const isDashboardRoot = location.pathname === '/dashboard' || location.pathname === '/dashboard/' || location.pathname === '/';

  return (
    <>
      <style>{styles}</style>

      <div className="dashboard-layout">
        <Sidebar lang={lang} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main className="dashboard-main">
          {/* Mobile Top Navigation */}
          <div className="mobile-top-nav">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2>{translations[lang]?.adminPanel || 'Admin Panel'}</h2>
            <div className="mobile-nav-placeholder"></div>
          </div>

          <div className="dashboard-content">
            <div className="content-wrapper glass-panel">
              {isDashboardRoot ? (
                <div className="dashboard-welcome">
                  <h1>YEDAGAM ADMIN PANEL</h1>
                  <p>Select a module from the left menu to begin.</p>
                </div>
              ) : (
                <Outlet />
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

// --- PREMIUM SAAS CSS ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --primary: #4F46E5;
    --primary-gradient: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
    --bg-color: #F8FAFC;
    --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
    --sidebar-bg: #FFFFFF;
    --text-main: #0F172A;
    --text-muted: #64748B;
    --border: #E2E8F0;
    --danger: #EF4444;
    --danger-bg: #FEF2F2;
    --shadow-soft: 4px 0 24px rgba(0, 0, 0, 0.02);
    --shadow-primary: 0 4px 14px 0 rgba(79, 70, 229, 0.3);
  }

  * {
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  body {
    margin: 0;
    background: var(--bg-gradient);
    color: var(--text-main);
      overflow-x: hidden;
        overflow-y: auto;


  }

  /* Layout */
  .dashboard-layout {
  display: flex;
  min-height: calc(100vh - 80px); /* adjust footer height */
}

  .dashboard-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .dashboard-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
  }

  .content-wrapper {
    max-width: 1600px;
    margin: 0 auto;
    height: 100%;
  }

  /* Dashboard Welcome Message */
  .dashboard-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 2rem;
    animation: fadeIn 0.5s ease-out;
  }

  .dashboard-welcome h1 {
    font-size: 2.25rem;
    font-weight: 800;
    color: var(--text-main);
    margin-bottom: 0.5rem;
    letter-spacing: -0.025em;
  }

  .dashboard-welcome p {
    font-size: 1.125rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Mobile Top Nav */
  .mobile-top-nav {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--sidebar-bg);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .mobile-top-nav h2 {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-main);
  }

  .hamburger-btn {
    background: transparent;
    border: none;
    color: var(--text-main);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-nav-placeholder {
    width: 24px;
  }

  /* Sidebar Overlay (Mobile) */
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(2px);
    z-index: 40;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .sidebar-overlay.show {
    opacity: 1;
    visibility: visible;
  }

  /* Sidebar */
  .sidebar-container {
    width: 280px;
    min-width: 280px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    z-index: 50;
    box-shadow: var(--shadow-soft);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar-header {
    padding: 1.75rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid transparent; /* Keeps spacing intact */
  }

  .sidebar-logo-wrapper {
    flex-shrink: 0;
  }

  .sidebar-logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: var(--primary-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 800;
    font-size: 1.25rem;
    box-shadow: var(--shadow-primary);
  }

  .sidebar-title-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }

  .sidebar-header h2 {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-subtitle {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 2px;
  }

  .mobile-close-btn {
    display: none;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    margin-left: auto;
    padding: 4px;
  }

  /* Sidebar Navigation */
  .sidebar-nav {
    flex: 1;
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
  }

  .nav-item {
    height: 52px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 1rem;
    border-radius: 12px;
    color: var(--text-muted);
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 0;
    transition: all 0.25s ease;
    cursor: pointer;
  }

  .nav-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .nav-item:hover:not(.active) {
    background: #F1F5F9;
    color: var(--text-main);
    transform: translateX(4px);
  }

  .nav-item.active {
    background: var(--primary-gradient);
    color: white;
    box-shadow: var(--shadow-primary);
  }

  .nav-icon {
    flex-shrink: 0;
    transition: transform 0.25s ease;
  }

  .nav-item:hover .nav-icon {
    transform: scale(1.1);
  }

  /* Sidebar Footer */
  .sidebar-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border);
  }

  .btn-signout {
    width: 100%;
    height: 52px;
    border-radius: 12px;
    border: none;
    font-size: 15px;
    font-weight: 600;
    color: var(--danger);
    background: var(--danger-bg);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.25s ease;
  }

  .btn-signout:hover {
    background: #FEE2E2;
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.15);
  }

  /* Custom Scrollbar for Nav */
  .sidebar-nav::-webkit-scrollbar {
    width: 4px;
  }
  .sidebar-nav::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar-nav::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 10px;
  }
  .sidebar-container:hover .sidebar-nav::-webkit-scrollbar-thumb {
    background: #CBD5E1;
  }
  
  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .dashboard-content {
      padding: 1.5rem 1rem;
    }
    .mobile-top-nav {
      display: flex;
    }
    .sidebar-container {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      transform: translateX(-100%);
    }
    .sidebar-container.open {
      transform: translateX(0);
    }
    .mobile-close-btn {
      display: block;
    }
  }
`;

export default AdminDashboard;
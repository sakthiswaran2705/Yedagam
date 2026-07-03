import React, { useState, useEffect, useRef } from 'react';
import { authenticatedFetch } from "./authFetch.jsx";
import Footer from "./Footer.jsx";

// --- TRANSLATIONS ---
const translations = {
  en: {
    // Form
    title: "Create Payment",
    subtitle: "Record a new manual transaction",
    paymentId: "Payment ID",
    userEmail: "User Email",
    amount: "Amount (₹)",
    createPaymentBtn: "Create Payment",
    processingBtn: "Processing...",
    searching: "Searching...",
    noUsersFound: "No users found.",
    successMsg: "Payment successfully recorded!",
    errorMsg: "Failed to process request.",
    networkError: "Network error. Please try again.",

    // Stats
    totalPayments: "Total Payments",
    totalRevenue: "Total Revenue",
    todaysPayments: "Today's Payments",

    // Table & Toolbar
    searchPlaceholder: "Search by ID or Email...",
    refresh: "Refresh",
    exportCSV: "Export CSV",
    emptyState: "No payments found.",

    // Table Headers
    slNo: "S.No",
    tablePaymentId: "Payment ID",
    tableUserEmail: "User Email",
    tableUserId: "User ID",
    tableAmount: "Amount",
    tableDate: "Date",
    tableActions: "Actions",

    // Delete Modal
    deleteTitle: "Delete Payment",
    deleteDesc: "Are you sure you want to delete this payment? This action cannot be undone.",
    cancelBtn: "Cancel",
    confirmDeleteBtn: "Delete",
    deleteSuccess: "Payment deleted successfully."
  },
  ta: {
    // Form
    title: "கட்டணத்தை உருவாக்கு",
    subtitle: "புதிய பரிவர்த்தனையைப் பதிவு செய்யவும்",
    paymentId: "கட்டண ஐடி",
    userEmail: "பயனர் மின்னஞ்சல்",
    amount: "தொகை (₹)",
    createPaymentBtn: "பதிவு செய்",
    processingBtn: "செயலாக்கப்படுகிறது...",
    searching: "தேடப்படுகிறது...",
    noUsersFound: "பயனர்கள் காணப்படவில்லை.",
    successMsg: "கட்டணம் வெற்றிகரமாக பதிவு செய்யப்பட்டது!",
    errorMsg: "கோரிக்கையைச் செயல்படுத்த முடியவில்லை.",
    networkError: "நெட்வொர்க் பிழை. மீண்டும் முயற்சிக்கவும்.",

    // Stats
    totalPayments: "மொத்த கட்டணங்கள்",
    totalRevenue: "மொத்த வருவாய்",
    todaysPayments: "இன்றைய கட்டணங்கள்",

    // Table & Toolbar
    searchPlaceholder: "ஐடி அல்லது மின்னஞ்சல் மூலம் தேடுக...",
    refresh: "புதுப்பி",
    exportCSV: "CSV ஏற்றுமதி",
    emptyState: "கட்டணங்கள் எதுவும் காணப்படவில்லை.",

    // Table Headers
    slNo: "வ.எண்",
    tablePaymentId: "கட்டண ஐடி",
    tableUserEmail: "பயனர் மின்னஞ்சல்",
    tableUserId: "பயனர் ஐடி",
    tableAmount: "தொகை",
    tableDate: "தேதி",
    tableActions: "செயல்கள்",

    // Delete Modal
    deleteTitle: "கட்டணத்தை நீக்கு",
    deleteDesc: "இந்த கட்டணத்தை நீக்க விரும்புகிறீர்களா? இந்த செயலை செயல்தவிர்க்க முடியாது.",
    cancelBtn: "ரத்து செய்",
    confirmDeleteBtn: "நீக்கு",
    deleteSuccess: "கட்டணம் வெற்றிகரமாக நீக்கப்பட்டது."
  }
};

// --- ANIMATED COUNTER HOOK ---
function AnimatedCounter({ value, prefix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1 second animation
    const increment = value / (duration / 16);

    if (value === 0) {
      setCount(0);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toLocaleString()}</span>;
}

export default function PaymentManagement() {
  // Language State
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ta');
  const t = translations[lang] || translations['ta'];

  useEffect(() => {
    const handleStorageChange = () => {
      const storedLang = localStorage.getItem('app_lang');
      if (storedLang && storedLang !== lang) setLang(storedLang);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [lang]);

  // --- FORM STATE ---
  const [paymentId, setPaymentId] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ text: '', type: '' });

  // --- TABLE & DATA STATE ---
  const [payments, setPayments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- MODAL STATE ---
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Refs for autocomplete
  const autocompleteWrapperRef = useRef(null);
  const activeItemRef = useRef(null);
  const skipSearchRef = useRef(false);
  const debounceTimerRef = useRef(null);

  // Initial Fetch
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoadingData(true);
    try {
      const response = await authenticatedFetch(`/payments/all/`);
      const result = await response.json();
      if (result.success) {
        setPayments(result.data);
      }
    } catch (error) {
      showToast(t.networkError, 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const showToast = (text, type) => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4000);
  };

  // --- AUTOCOMPLETE LOGIC ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteWrapperRef.current && !autocompleteWrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    if (email.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await authenticatedFetch(`/users/search/?search=${encodeURIComponent(email)}`);
        if (response && typeof response.json === 'function') {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setSuggestions(result.data);
          } else {
            setSuggestions([]);
          }
        }
      } catch (error) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
        setActiveIndex(-1);
      }
    }, 300);
    return () => clearTimeout(debounceTimerRef.current);
  }, [email]);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  const handleSelectEmail = (selectedEmail) => {
    skipSearchRef.current = true;
    setEmail(selectedEmail);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelectEmail(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  // --- SUBMIT PAYMENT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new URLSearchParams();
    formData.append('payment_id', paymentId);
    formData.append('email', email);
    formData.append('amount', amount);

    try {
      const response = await authenticatedFetch(`/admin/payment/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast(t.successMsg, 'success');
        setPaymentId('');
        setEmail('');
        setAmount('');
        // Refresh Table without page reload
        fetchPayments();
      } else {
        showToast(result.detail || t.errorMsg, 'error');
      }
    } catch (error) {
      showToast(t.networkError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const response = await authenticatedFetch(`/payments/delete/${deleteModal.id}/`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast(t.deleteSuccess, 'success');
        // Remove from state instantly without full refetch
        setPayments(prev => prev.filter(p => p.id !== deleteModal.id));
      } else {
        showToast(result.detail || t.errorMsg, 'error');
      }
    } catch (error) {
      showToast(t.networkError, 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  // --- EXPORT CSV ---
  const handleExportCSV = () => {
    if (filteredPayments.length === 0) return;

    const headers = ["Payment ID", "User Email", "User ID", "Amount", "Date"];
    const rows = filteredPayments.map(p => [
      p.payment_id,
      p.email,
      p.user_id,
      p.amount,
      new Date(p.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payments_${new Date().getTime()}.csv`;
    link.click();
  };

  // --- COMPUTED DATA ---
  const filteredPayments = payments.filter(p =>
    p.payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: payments.length,
    revenue: payments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0),
    today: payments.filter(p => p.created_at && p.created_at.startsWith(new Date().toISOString().split('T')[0])).length,
  };

  return (
    <div className="layout-container">

      {/* Toast Notification */}
      {toast.text && (
        <div className={`toast-alert ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '⚠️'} <span>{toast.text}</span>
        </div>
      )}

      <main className="dashboard-content">

        {/* Statistics Row */}
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon purple">💳</div>
            <div className="stat-info">
              <h3>{t.totalPayments}</h3>
              <p className="stat-number">
                {loadingData ? <span className="skeleton skeleton-text"></span> : <AnimatedCounter value={stats.total} />}
              </p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon green">💰</div>
            <div className="stat-info">
              <h3>{t.totalRevenue}</h3>
              <p className="stat-number">
                {loadingData ? <span className="skeleton skeleton-text"></span> : <AnimatedCounter value={stats.revenue} prefix="₹" />}
              </p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon blue">📅</div>
            <div className="stat-info">
              <h3>{t.todaysPayments}</h3>
              <p className="stat-number">
                {loadingData ? <span className="skeleton skeleton-text"></span> : <AnimatedCounter value={stats.today} />}
              </p>
            </div>
          </div>

        </div>

        <div className="dashboard-main-grid">
          {/* Create Payment Form */}
          <div className="payment-card glass-card">
            <div className="payment-header">
              <div>
                <h2 className="payment-title">{t.title}</h2>
                <p className="payment-subtitle">{t.subtitle}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="floating-group">
                <input
                  id="paymentId"
                  type="text"
                  className="floating-input"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder=" "
                  required
                />
                <label className="floating-label" htmlFor="paymentId">{t.paymentId}</label>
              </div>

              <div className="floating-group autocomplete-wrapper" ref={autocompleteWrapperRef}>
                <input
                  id="email-input"
                  type="email"
                  className="floating-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (email.trim().length >= 2) setShowDropdown(true); }}
                  placeholder=" "
                  required
                  autoComplete="off"
                />
                <label className="floating-label" htmlFor="email-input">{t.userEmail}</label>

                {showDropdown && (
                  <div className="dropdown-menu shadow-soft">
                    {isSearching ? (
                      <div className="dropdown-status">
                        <div className="spinner"></div> <span>{t.searching}</span>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <ul className="dropdown-list">
                        {suggestions.map((suggestionEmail, index) => (
                          <li
                            key={index}
                            ref={index === activeIndex ? activeItemRef : null}
                            className={`dropdown-item ${index === activeIndex ? 'active' : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectEmail(suggestionEmail);
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                          >
                            <span className="email-icon">📧</span>
                            <span className="email-text">{suggestionEmail}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="dropdown-status">{t.noUsersFound}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="floating-group">
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="floating-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder=" "
                  required
                />
                <label className="floating-label" htmlFor="amount">{t.amount}</label>
              </div>

              <button type="submit" className={`gradient-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><div className="btn-spinner"></div> {t.processingBtn}</>
                ) : t.createPaymentBtn}
              </button>
            </form>
          </div>

          {/* Payment History Table */}
          <div className="table-container glass-card">
            <div className="table-toolbar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="toolbar-actions">
                <button type="button" className="action-btn" onClick={fetchPayments} disabled={loadingData}>
                  🔄 <span className="hide-mobile">{t.refresh}</span>
                </button>
                <button type="button" className="action-btn primary" onClick={handleExportCSV}>
                  📥 <span className="hide-mobile">{t.exportCSV}</span>
                </button>
              </div>
            </div>

            <div className="responsive-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>{t.slNo}</th>
                    <th>{t.tablePaymentId}</th>
                    <th>{t.tableUserEmail}</th>
                    <th className="hide-tablet">{t.tableUserId}</th>
                    <th>{t.tableAmount}</th>
                    <th>{t.tableDate}</th>
                    <th>{t.tableActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    // Skeleton rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j}><div className="skeleton skeleton-cell"></div></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredPayments.length > 0 ? (
                    filteredPayments.map((p, index) => (
                      <tr key={p.id}>
                        <td data-label={t.slNo}>{index + 1}</td>
                        <td data-label={t.tablePaymentId}><strong>{p.payment_id}</strong></td>
                        <td data-label={t.tableUserEmail}>{p.email}</td>
                        <td data-label={t.tableUserId} className="hide-tablet mask-text">{p.user_id.slice(-6)}</td>
                        <td data-label={t.tableAmount} className="amount-cell">₹{p.amount}</td>
                        <td data-label={t.tableDate}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td data-label={t.tableActions}>
                          <button className="icon-btn delete-btn" onClick={() => setDeleteModal({ isOpen: true, id: p.id })}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-state">

                        <div className="empty-icon">📭</div>
                        <p>{t.emptyState}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
       <Footer />
      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3 className="modal-title">⚠️ {t.deleteTitle}</h3>
            <p className="modal-desc">{t.deleteDesc}</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                disabled={isDeleting}
              >
                {t.cancelBtn}
              </button>
              <button
                className="modal-btn danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <div className="btn-spinner"></div> : t.confirmDeleteBtn}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* --- INLINE STYLES --- */}
      <style>{`
        /* Global & Layout Variables */
        :root {
          --primary-blue: #2563eb;
          --primary-hover: #1d4ed8;
          --danger-color: #ef4444;
          --danger-hover: #dc2626;
          --bg-color: #f3f4f6;
          --card-bg: rgba(255, 255, 255, 0.85);
          --text-main: #111827;
          --text-muted: #6b7280;
          --border-color: rgba(229, 231, 235, 0.6);
          --focus-ring: rgba(37, 99, 235, 0.2);
          --shadow-soft: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
        }

        .layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          font-family: ui-sans-serif, system-ui, sans-serif;
          position: relative;
        }

        .dashboard-content {
          flex: 1;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .glass-card {
          background: var(--card-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          box-shadow: var(--shadow-soft);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .stat-icon.purple { background: #f3e8ff; color: #9333ea; }
        .stat-icon.green { background: #dcfce7; color: #16a34a; }
        .stat-icon.blue { background: #dbeafe; color: #2563eb; }
        .stat-icon.orange { background: #ffedd5; color: #ea580c; }

        .stat-info h3 {
          margin: 0;
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 500;
        }
        
        .stat-number {
          margin: 5px 0 0 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--text-main);
        }

        /* Main Grid (Form + Table) */
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 2rem;
          align-items: start;
        }

        /* Form Styles */
        .payment-card { padding: 2rem; }
        .payment-header { margin-bottom: 1.5rem; }
        .payment-title { margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: var(--text-main); }
        .payment-subtitle { margin: 0; font-size: 14px; color: var(--text-muted); }
        
        .payment-form { display: flex; flex-direction: column; gap: 1.25rem; }
        
        .floating-group { position: relative; width: 100%; }
        .floating-input {
          width: 100%; padding: 22px 16px 10px; font-size: 15px; color: var(--text-main);
          border: 1px solid var(--border-color); border-radius: 12px;
          background: rgba(255, 255, 255, 0.9); box-sizing: border-box; outline: none;
          transition: all 0.2s ease;
        }
        .floating-input:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 4px var(--focus-ring); background: #fff; }
        .floating-label {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          font-size: 15px; color: var(--text-muted); pointer-events: none; transition: all 0.2s ease;
        }
        .floating-input:focus ~ .floating-label,
        .floating-input:not(:placeholder-shown) ~ .floating-label {
          top: 12px; font-size: 12px; font-weight: 600; color: var(--primary-blue);
        }
        .floating-input:not(:focus):not(:placeholder-shown) ~ .floating-label { color: var(--text-muted); }

        .gradient-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, var(--primary-blue) 0%, #1e40af 100%);
          color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600;
          cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
          display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 8px;
        }
        .gradient-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4); }
        .gradient-btn:disabled { background: #93c5fd; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Autocomplete Dropdown */
        .autocomplete-wrapper { position: relative; }
        .dropdown-menu {
          position: absolute; top: calc(100% + 8px); left: 0; width: 100%;
          background: #ffffff; border: 1px solid var(--border-color); border-radius: 12px;
          z-index: 100; max-height: 220px; overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); animation: slideDown 0.2s ease;
        }
        .dropdown-list { list-style: none; margin: 0; padding: 8px 0; }
        .dropdown-item {
          display: flex; align-items: center; padding: 12px 16px; cursor: pointer;
          font-size: 14px; color: var(--text-main); transition: background 0.15s ease;
        }
        .dropdown-item.active, .dropdown-item:hover { background: #eff6ff; }
        .dropdown-item.active .email-text { color: var(--primary-blue); font-weight: 600; }
        .email-icon { margin-right: 12px; font-size: 16px; }
        .dropdown-status { padding: 16px; font-size: 14px; color: var(--text-muted); text-align: center; display: flex; justify-content: center; align-items: center; gap: 8px; }

        /* Table Area */
        .table-container { padding: 1.5rem; display: flex; flex-direction: column; overflow: hidden; }
        
        .table-toolbar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
        }
        .search-box {
          position: relative; flex: 1; max-width: 400px;
        }
        .search-box input {
          width: 100%; padding: 12px 16px 12px 40px; border-radius: 10px;
          border: 1px solid var(--border-color); background: rgba(255,255,255,0.7);
          outline: none; font-size: 14px; box-sizing: border-box; transition: all 0.2s;
        }
        .search-box input:focus { border-color: var(--primary-blue); background: #fff; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px;}
        
        .toolbar-actions { display: flex; gap: 10px; }
        .action-btn {
          padding: 10px 16px; border-radius: 10px; border: 1px solid var(--border-color);
          background: #fff; color: var(--text-main); font-weight: 600; font-size: 14px;
          cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .action-btn:hover { background: #f9fafb; border-color: #d1d5db; }
        .action-btn.primary { background: #fff; border-color: var(--border-color); }
        .action-btn.primary:hover { background: #eff6ff; color: var(--primary-blue); border-color: #bfdbfe; }

        .responsive-table-wrapper { overflow-x: auto; border-radius: 12px; }
        
        .modern-table { width: 100%; border-collapse: collapse; text-align: left; }
        .modern-table th {
          background: rgba(243, 244, 246, 0.6); padding: 16px; font-size: 13px;
          font-weight: 600; color: var(--text-muted); text-transform: uppercase;
          letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color);
        }
        .modern-table td { padding: 16px; font-size: 14px; color: var(--text-main); border-bottom: 1px solid var(--border-color); }
        .modern-table tbody tr { transition: background 0.2s; }
        .modern-table tbody tr:hover { background: rgba(255, 255, 255, 0.4); }
        .modern-table tbody tr:last-child td { border-bottom: none; }
        
        .amount-cell { font-weight: 600; color: #16a34a; }
        .mask-text { color: var(--text-muted); font-family: monospace; }
        
        .icon-btn {
          background: none; border: none; font-size: 16px; cursor: pointer; padding: 6px;
          border-radius: 6px; transition: all 0.2s;
        }
        .delete-btn { color: var(--text-muted); }
        .delete-btn:hover { background: #fef2f2; color: var(--danger-color); }

        .empty-state { text-align: center; padding: 3rem 1rem !important; color: var(--text-muted); }
        .empty-icon { font-size: 48px; margin-bottom: 1rem; opacity: 0.6; }

        /* Skeletons */
        .skeleton {
          background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;
        }
        .skeleton-text { display: inline-block; width: 100px; height: 28px; border-radius: 6px; margin-top: 5px; }
        .skeleton-cell { height: 20px; width: 100%; border-radius: 4px; }
        
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Modal */
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          width: 90%; max-width: 400px; padding: 24px; background: #fff;
          text-align: center; transform: translateY(0); animation: slideUp 0.3s ease;
        }
        .modal-title { margin: 0 0 12px 0; font-size: 20px; color: var(--text-main); }
        .modal-desc { margin: 0 0 24px 0; font-size: 14px; color: var(--text-muted); line-height: 1.5; }
        .modal-actions { display: flex; gap: 12px; }
        .modal-btn {
          flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; font-size: 14px; display: flex; justify-content: center;
        }
        .modal-btn.cancel { background: #f3f4f6; color: var(--text-main); }
        .modal-btn.cancel:hover { background: #e5e7eb; }
        .modal-btn.danger { background: var(--danger-color); color: white; }
        .modal-btn.danger:hover { background: var(--danger-hover); }

        /* Toast */
        .toast-alert {
          position: fixed; top: 24px; right: 24px; padding: 16px 24px;
          border-radius: 12px; font-size: 14px; font-weight: 600;
          display: flex; align-items: center; gap: 12px; z-index: 9999;
          animation: slideLeft 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        .toast-alert.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .toast-alert.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        /* Spinners */
        .spinner { width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top-color: var(--primary-blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
        .btn-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .dashboard-main-grid { grid-template-columns: 1fr; }
          .payment-card { max-width: 100%; }
        }

        @media (max-width: 768px) {
          .dashboard-content { padding: 1rem; }
          .hide-tablet { display: none; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          
          /* Mobile Card Table */
          .modern-table thead { display: none; }
          .modern-table, .modern-table tbody, .modern-table tr, .modern-table td { display: block; width: 100%; box-sizing: border-box; }
          .modern-table tr { margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: rgba(255,255,255,0.5); overflow: hidden; }
          .modern-table td { display: flex; justify-content: space-between; align-items: center; text-align: right; border-bottom: 1px solid var(--border-color); padding: 12px 16px; }
          .modern-table td::before { content: attr(data-label); font-weight: 600; color: var(--text-muted); font-size: 13px; text-transform: uppercase; text-align: left; flex: 1; }
        }
        
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .hide-mobile { display: none; }
          .toolbar-actions { width: 100%; justify-content: flex-end; }
          .search-box { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
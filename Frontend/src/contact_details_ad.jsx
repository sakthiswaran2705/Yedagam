import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";
import Navbar from "./Navbar.jsx";
import { authenticatedFetch } from "./authFetch.jsx";
import Footer from "./Footer.jsx"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ContactCheck = () => {
  // ===============================
  // Language & Translations
  // ===============================
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "en");

  useEffect(() => {
    const updateLanguage = () => setLang(localStorage.getItem("app_lang") || "en");
    window.addEventListener("storage", updateLanguage);
    const interval = setInterval(updateLanguage, 200);
    return () => {
      window.removeEventListener("storage", updateLanguage);
      clearInterval(interval);
    };
  }, []);

  const translations = {
    en: {
      title: "Contact Management",
      subtitle: "Manage all contact enquiries",
      totalContacts: "Total Contacts",
      search: "Search contacts...",
      refresh: "Refresh",
      loading: "Loading contacts...",
      noData: "No contacts found",
      name: "Name",
      email: "Email",
      mobile: "Mobile",
      place: "Place",
      district: "District",
      actions: "Actions",
      delete: "Delete",
      deleting: "Deleting...",
      fetchFailed: "Unable to fetch contacts.",
      deleteFailed: "Unable to delete contact.",
      deleteSuccess: "Contact deleted successfully.",
      // Modal Translations
      modalTitle: "Confirm Deletion",
      deleteConfirm: "Are you sure you want to delete this contact? This action cannot be undone.",
      btnCancel: "Cancel",
      btnConfirmDelete: "Yes, Delete",
    },
    ta: {
      title: "தொடர்பு மேலாண்மை",
      subtitle: "அனைத்து தொடர்புகளையும் நிர்வகிக்கவும்",
      totalContacts: "மொத்த தொடர்புகள்",
      search: "தொடர்புகளை தேடுங்கள்...",
      refresh: "புதுப்பிக்கவும்",
      loading: "தொடர்புகள் ஏற்றப்படுகிறது...",
      noData: "தொடர்புகள் இல்லை",
      name: "பெயர்",
      email: "மின்னஞ்சல்",
      mobile: "மொபைல்",
      place: "இடம்",
      district: "மாவட்டம்",
      actions: "செயல்கள்",
      delete: "நீக்கு",
      deleting: "நீக்கப்படுகிறது...",
      fetchFailed: "தொடர்புகளை பெற முடியவில்லை.",
      deleteFailed: "தொடர்பை நீக்க முடியவில்லை.",
      deleteSuccess: "தொடர்பு வெற்றிகரமாக நீக்கப்பட்டது.",
      // Modal Translations
      modalTitle: "நீக்குதலை உறுதிப்படுத்தவும்",
      deleteConfirm: "இந்த தொடர்பை நீக்க உறுதியாக உள்ளீர்களா? இந்த செயலை மாற்றியமைக்க முடியாது.",
      btnCancel: "ரத்துசெய்",
      btnConfirmDelete: "ஆம், நீக்கு",
    },
  };

  const t = translations[lang] || translations.en;

  // ===============================
  // State
  // ===============================
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // ===============================
  // API Calls
  // ===============================
  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch("/contact/all/", { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        setContacts(result.data || []);
      } else {
        alert(result.detail || t.fetchFailed);
      }
    } catch (error) {
      console.error(error);
      alert(t.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // ===============================
  // Delete Modal Handlers
  // ===============================
  const triggerDelete = (id) => {
    setDeleteTargetId(id);
    setIsModalOpen(true);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setDeleteTargetId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setDeletingId(deleteTargetId);
      setIsModalOpen(false); // Close modal immediately so user sees "Deleting..."

      const response = await authenticatedFetch(`/contact/delete/${deleteTargetId}/`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok) {
        setContacts((prev) => prev.filter((item) => item.id !== deleteTargetId && item._id !== deleteTargetId));
      } else {
        alert(result.detail || t.deleteFailed);
      }
    } catch (error) {
      console.error(error);
      alert(t.deleteFailed);
    } finally {
      setDeletingId("");
      setDeleteTargetId(null);
    }
  };

  // ===============================
  // Derived Data
  // ===============================
  const filteredContacts = useMemo(() => {
    return contacts.filter((item) => {
      const value = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(value) ||
        item.email?.toLowerCase().includes(value) ||
        item.mobile?.toLowerCase().includes(value) ||
        item.place?.toLowerCase().includes(value) ||
        item.district?.toLowerCase().includes(value)
      );
    });
  }, [contacts, search]);

  // ===============================
  // Render
  // ===============================
  return (
      < >
    <div className="page">


      {/* Compact CSS injected directly */}
      <style>{`
        .page { min-height: 100vh; background: #f5f7fb; padding: 30px; font-family: 'Segoe UI', sans-serif; }
        .header-top { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
        .title h1 { margin: 0; font-size: 32px; color: #1e293b; }
        .title p { margin: 8px 0 0; color: #64748b; }
        .stats-card { background: #fff; padding: 20px 28px; border-radius: 18px; display: flex; align-items: center; gap: 18px; box-shadow: 0 12px 30px rgba(0,0,0,.08); }
        .stats-icon { width: 65px; height: 65px; border-radius: 50%; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; }
        .toolbar { display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }
        .search-box { flex: 1; display: flex; align-items: center; background: #fff; padding: 14px 18px; border-radius: 12px; gap: 12px; box-shadow: 0 4px 18px rgba(0,0,0,.06); }
        .search-box input { border: none; outline: none; width: 100%; font-size: 15px; }
        
        .btn-refresh { background: #2563eb; color: white; border: none; padding: 14px 24px; border-radius: 12px; cursor: pointer; display: flex; gap: 10px; align-items: center; font-weight: 600; transition: 0.2s;}
        .btn-refresh:hover { background: #1d4ed8; }
        
        .table-container { background: #fff; border-radius: 18px; overflow-x: auto; box-shadow: 0 10px 25px rgba(0,0,0,.06); }
        table { width: 100%; border-collapse: collapse; min-width: 950px; }
        th, td { padding: 18px; text-align: left; border-bottom: 1px solid #edf2f7; }
        th { background: #f8fafc; color: #334155; font-weight: 700; }
        .cell-flex { display: flex; align-items: center; gap: 8px; }
        .icon { color: #64748b; width: 16px; height: 16px; }
        
        .btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 10px 16px; border-radius: 10px; cursor: pointer; display: flex; gap: 8px; align-items: center; font-weight: 600; transition: 0.2s;}
        .btn-delete:hover:not(:disabled) { background: #ef4444; color: white; }
        .btn-delete:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .state-box { text-align: center; padding: 80px 20px; background: #fff; border-radius: 18px; color: #64748b; font-size: 18px; }
        
        /* --- CUSTOM MODAL STYLES --- */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          text-align: center;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-icon {
          width: 60px;
          height: 60px;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
        }

        .modal-content h3 { margin: 0 0 10px 0; color: #1f2937; font-size: 22px; }
        .modal-content p { color: #6b7280; margin: 0 0 25px 0; line-height: 1.5; }

        .modal-actions { display: flex; gap: 12px; justify-content: center; }
        .modal-btn { flex: 1; padding: 12px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 15px;}
        .cancel-btn { background: #f3f4f6; color: #4b5563; }
        .cancel-btn:hover { background: #e5e7eb; }
        .confirm-btn { background: #ef4444; color: white; }
        .confirm-btn:hover { background: #dc2626; }

        .mobile-cards { display: none; }
        @media (max-width: 768px) {
          .page { padding: 15px; }
          .table-container { display: none; }
          .mobile-cards { display: flex; flex-direction: column; gap: 15px; }
          .m-card { background: #fff; padding: 20px; border-radius: 16px; box-shadow: 0 8px 22px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
          .m-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .m-label { font-weight: bold; color: #1e293b; }
          .m-val { color: #475569; text-align: right; word-break: break-all;}
          .m-divider { height: 1px; background: #e2e8f0; margin: 14px 0; }
        }
      `}</style>

      {/* Header */}
      <div className="header-top">
        <div className="title">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="stats-card">
          <div className="stats-icon">
            <Users size={30} />
          </div>
          <div>
            <div style={{ fontSize: "32px", fontWeight: "700" }}>{filteredContacts.length}</div>
            <div style={{ color: "#64748b", fontSize: "14px" }}>{t.totalContacts}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search color="#64748b" />
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-refresh" onClick={loadContacts}>
          <RefreshCw size={18} />
          {t.refresh}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="state-box">{t.loading}</div>
      ) : filteredContacts.length === 0 ? (
        <div className="state-box">{t.noData}</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t.name}</th>
                  <th>{t.email}</th>
                  <th>{t.mobile}</th>
                  <th>{t.place}</th>
                  <th>{t.district}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id || contact._id}>
                    <td style={{ fontWeight: "600", color: "#1e293b" }}>{contact.name || "—"}</td>
                    <td>
                      <div className="cell-flex">
                        <Mail className="icon" /> {contact.email || "—"}
                      </div>
                    </td>
                    <td>
                      <div className="cell-flex">
                        <Phone className="icon" /> {contact.mobile || "—"}
                      </div>
                    </td>
                    <td>
                      <div className="cell-flex">
                        <Building2 className="icon" /> {contact.place || "—"}
                      </div>
                    </td>
                    <td>
                      <div className="cell-flex">
                        <MapPin className="icon" /> {contact.district || "—"}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => triggerDelete(contact.id || contact._id)}
                        disabled={deletingId === (contact.id || contact._id)}
                      >
                        <Trash2 size={16} />
                        {deletingId === (contact.id || contact._id) ? t.deleting : t.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {filteredContacts.map((contact) => (
              <div className="m-card" key={contact.id || contact._id}>
                <div className="m-row">
                  <span className="m-label">{t.name}</span>
                  <span className="m-val" style={{ fontWeight: "600" }}>{contact.name || "—"}</span>
                </div>
                <div className="m-row">
                  <span className="m-label">{t.email}</span>
                  <span className="m-val">{contact.email || "—"}</span>
                </div>
                <div className="m-row">
                  <span className="m-label">{t.mobile}</span>
                  <span className="m-val">{contact.mobile || "—"}</span>
                </div>
                <div className="m-divider"></div>
                <div className="m-row">
                  <span className="m-label">{t.place}</span>
                  <span className="m-val">{contact.place || "—"}</span>
                </div>
                <div className="m-row">
                  <span className="m-label">{t.district}</span>
                  <span className="m-val">{contact.district || "—"}</span>
                </div>
                <div className="m-divider"></div>
                <button
                  className="btn-delete"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => triggerDelete(contact.id || contact._id)}
                  disabled={deletingId === (contact.id || contact._id)}
                >
                  <Trash2 size={18} />
                  {deletingId === (contact.id || contact._id) ? t.deleting : t.delete}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Trash2 size={28} />
            </div>
            <h3>{t.modalTitle}</h3>
            <p>{t.deleteConfirm}</p>

            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={cancelDelete}>
                {t.btnCancel}
              </button>
              <button className="modal-btn confirm-btn" onClick={confirmDelete}>
                {t.btnConfirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
          <Footer />
      </>


  );

};

export default ContactCheck;
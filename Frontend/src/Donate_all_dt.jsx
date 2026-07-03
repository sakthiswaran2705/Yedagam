import React, { useEffect, useMemo, useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaCommentDots,
  FaSearch,
  FaSyncAlt,
  FaDownload,
  FaInbox,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import { authenticatedFetch } from "./authFetch.jsx";
import Footer from "./Footer.jsx"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function DonateList() {
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "en");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const token = localStorage.getItem("token");

  // --- TRANSLATIONS ---
  const translations = {
    en: {
      title: "Donation Requests",
      subtitle: "Manage all donation contact requests from users.",
      refresh: "Refresh",
      exportCSV: "Export CSV",
      totalRequests: "Total Requests",
      emailRequests: "Email Requests",
      phoneRequests: "Phone Requests",
      searchPlaceholder: "Search by email, phone or message...",
      errorLoad: "Failed to load donation requests.",
      loadingText: "Loading donation requests...",
      emptyTitle: "No Donation Requests Found",
      emptySub: "No donation requests are available.",
      thHash: "#",
      thEmail: "Email",
      thPhone: "Phone",
      thMessage: "Message",
      thDate: "Submitted Date",
      thAction: "Action",
      // Modal Translations
      modalTitle: "Confirm Deletion",
      deleteConfirm: "Are you sure you want to delete this donation request? This action cannot be undone.",
      deleteError: "Failed to delete donation request.",
      btnCancel: "Cancel",
      btnConfirmDelete: "Yes, Delete"
    },
    ta: {
      title: "நன்கொடை கோரிக்கைகள்",
      subtitle: "பயனர்களிடமிருந்து வரும் அனைத்து நன்கொடை தொடர்பு கோரிக்கைகளையும் நிர்வகிக்கவும்.",
      refresh: "புதுப்பி",
      exportCSV: "CSV பதிவிறக்கு",
      totalRequests: "மொத்த கோரிக்கைகள்",
      emailRequests: "மின்னஞ்சல் கோரிக்கைகள்",
      phoneRequests: "தொலைபேசி கோரிக்கைகள்",
      searchPlaceholder: "மின்னஞ்சல், தொலைபேசி அல்லது செய்தி மூலம் தேடுங்கள்...",
      errorLoad: "நன்கொடை கோரிக்கைகளை ஏற்றுவதில் தோல்வி.",
      loadingText: "நன்கொடை கோரிக்கைகளை ஏற்றுகிறது...",
      emptyTitle: "நன்கொடை கோரிக்கைகள் எதுவும் இல்லை",
      emptySub: "தற்போது எந்த நன்கொடை கோரிக்கைகளும் கிடைக்கவில்லை.",
      thHash: "#",
      thEmail: "மின்னஞ்சல்",
      thPhone: "தொலைபேசி",
      thMessage: "செய்தி",
      thDate: "சமர்ப்பிக்கப்பட்ட தேதி",
      thAction: "செயல்",
      // Modal Translations
      modalTitle: "நீக்குதலை உறுதிப்படுத்தவும்",
      deleteConfirm: "இந்த நன்கொடை கோரிக்கையை நீக்க உறுதியாக உள்ளீர்களா? இந்த செயலை மாற்றியமைக்க முடியாது.",
      deleteError: "நன்கொடை கோரிக்கையை நீக்குவதில் தோல்வி.",
      btnCancel: "ரத்துசெய்",
      btnConfirmDelete: "ஆம், நீக்கு"
    },
  };

  const t = translations[lang];

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await authenticatedFetch(`/donate-by/all/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = res;
      if (res && typeof res.json === "function") {
        data = await res.json();
      }

      if (data && data.status) {
        setDonations(data.data);
      } else {
        setDonations([]);
      }
    } catch (err) {
      console.error(err);
      setError(t.errorLoad);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // --- DELETE MODAL HANDLERS ---
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
      const res = await authenticatedFetch(`/donate-by/delete/${deleteTargetId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = res;
      if (res && typeof res.json === "function") {
        data = await res.json();
      }

      if (data && data.status) {
        setDonations((prev) => prev.filter((item) => item._id !== deleteTargetId));
      } else {
        alert(data.message || t.deleteError);
      }
    } catch (err) {
      console.error(err);
      alert(t.deleteError);
    } finally {
      setIsModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  // --- DATA PROCESSING ---
  const filteredData = useMemo(() => {
    return donations.filter((item) => {
      const value = search.toLowerCase();
      return (
        item.email?.toLowerCase().includes(value) ||
        item.phone?.toLowerCase().includes(value) ||
        item.message?.toLowerCase().includes(value)
      );
    });
  }, [donations, search]);

  const totalRequests = donations.length;
  const emailRequests = donations.filter((d) => d.email && d.email !== "").length;
  const phoneRequests = donations.filter((d) => d.phone && d.phone !== "").length;

  const exportCSV = () => {
    const rows = [
      [t.thEmail, t.thPhone, t.thMessage, t.thDate],
    ];

    filteredData.forEach((d) => {
      rows.push([
        d.email || "-",
        d.phone || "-",
        `"${(d.message || "-").replace(/"/g, '""')}"`,
        new Date(d.created_at).toLocaleString(),
      ]);
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "DonationRequests.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>


      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, sans-serif;
          background: #f8fafc;
        }

        .page {
          padding: 30px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          padding: 25px;
          border-radius: 16px;
          color: white;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header h2 { margin: 0; font-size: 28px; }
        .header p { margin-top: 8px; opacity: 0.9; }

        .actions { display: flex; gap: 12px; flex-wrap: wrap; }

        .btn {
          border: none;
          padding: 11px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: 0.3s;
          font-size: 15px;
        }

        .refresh { background: white; color: #2563eb; }
        .export { background: #16a34a; color: white; }
        .btn:hover { transform: translateY(-2px); }
        .btn:active { transform: scale(0.98); }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .card {
          background: white;
          padding: 22px;
          border-radius: 14px;
          box-shadow: 0 5px 18px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: 0.3s;
        }

        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }

        .cardIcon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .blue { background: #2563eb; }
        .green { background: #16a34a; }
        .orange { background: #f59e0b; }

        .card h3 { margin: 0; font-size: 30px; }
        .card span { color: #666; }

        .searchBox {
          background: white;
          padding: 18px;
          border-radius: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
        }

        .searchBox input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
        }
        .searchBox input::placeholder { color: #9ca3af; }

        .tableCard {
          background: white;
          border-radius: 14px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          overflow: auto;
        }

        .tableCard::-webkit-scrollbar { height: 8px; }
        .tableCard::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .tableCard::-webkit-scrollbar-track { background: #f3f4f6; }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 950px;
        }

        thead {
          background: #2563eb;
          color: white;
          position: sticky;
          top: 0;
        }

        thead th { font-weight: 600; letter-spacing: 0.3px; }
        th, td { padding: 16px; text-align: left; }
        tbody tr { border-bottom: 1px solid #eee; transition: 0.25s; }
        tbody tr:hover { background: #f3f7ff; }
        tbody td { vertical-align: top; }

        .message {
          max-width: 350px;
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.5;
        }

        .email { color: #2563eb; font-weight: 600; }
        .phone { font-weight: 600; }

        .deleteBtn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }

        .deleteBtn:hover { background: #ef4444; color: white; }

        /* --- MODAL STYLES --- */
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
          font-size: 24px;
          margin: 0 auto 20px auto;
        }

        .modal-content h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 22px;
        }

        .modal-content p {
          color: #6b7280;
          margin: 0 0 25px 0;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .modal-actions .btn {
          flex: 1;
          justify-content: center;
          padding: 12px;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #4b5563;
        }
        .cancel-btn:hover { background: #e5e7eb; }

        .confirm-btn {
          background: #ef4444;
          color: white;
        }
        .confirm-btn:hover { background: #dc2626; }

        /* --- EMPTY & LOADING STATES --- */
        .empty { padding: 70px; text-align: center; }
        .empty svg { font-size: 60px; color: #bbb; margin-bottom: 15px; }
        .empty h3 { margin: 10px 0; color: #333; }
        .empty p { color: #777; margin: 0; }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 70px;
          font-size: 20px;
          gap: 12px;
          color: #2563eb;
        }

        .loading svg { font-size: 26px; }
        .spin { animation: spin 1s linear infinite; }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          padding: 18px;
          background: #fee2e2;
          border-radius: 12px;
          color: #dc2626;
          margin-bottom: 20px;
          font-weight: 600;
        }

        @media(max-width: 768px) {
          .page { padding: 15px; }
          .header { flex-direction: column; align-items: flex-start; }
          .card { padding: 18px; }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>

          <div className="actions">
            <button className="btn refresh" onClick={fetchDonations}>
              <FaSyncAlt />
              {t.refresh}
            </button>

            <button className="btn export" onClick={exportCSV}>
              <FaDownload />
              {t.exportCSV}
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="card">
            <div>
              <span>{t.totalRequests}</span>
              <h3>{totalRequests}</h3>
            </div>
            <div className="cardIcon blue">
              <FaCommentDots />
            </div>
          </div>

          <div className="card">
            <div>
              <span>{t.emailRequests}</span>
              <h3>{emailRequests}</h3>
            </div>
            <div className="cardIcon green">
              <FaEnvelope />
            </div>
          </div>

          <div className="card">
            <div>
              <span>{t.phoneRequests}</span>
              <h3>{phoneRequests}</h3>
            </div>
            <div className="cardIcon orange">
              <FaPhone />
            </div>
          </div>
        </div>

        <div className="searchBox">
          <FaSearch color="#2563eb" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">
            <FaSpinner className="spin" />
            <span>{t.loadingText}</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty">
            <FaInbox />
            <h3>{t.emptyTitle}</h3>
            <p>{t.emptySub}</p>
          </div>
        ) : (
          <div className="tableCard">
            <table>
              <thead>
                <tr>
                  <th>{t.thHash}</th>
                  <th>{t.thEmail}</th>
                  <th>{t.thPhone}</th>
                  <th>{t.thMessage}</th>
                  <th>{t.thDate}</th>
                  <th>{t.thAction}</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{index + 1}</td>
                    <td className="email">{item.email || "—"}</td>
                    <td className="phone">{item.phone || "—"}</td>
                    <td className="message">{item.message}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <button
                        className="deleteBtn"
                        onClick={() => triggerDelete(item._id)}
                        title="Delete Request"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <FaTrash />
            </div>
            <h3>{t.modalTitle}</h3>
            <p>{t.deleteConfirm}</p>

            <div className="modal-actions">
              <button className="btn cancel-btn" onClick={cancelDelete}>
                {t.btnCancel}
              </button>
              <button className="btn confirm-btn" onClick={confirmDelete}>
                {t.btnConfirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
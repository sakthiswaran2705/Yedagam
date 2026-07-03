import React, { useEffect, useState } from "react";
import { authenticatedFetch } from "./authFetch";
import {
  FaSearch,
  FaSync,
  FaEye,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaSpinner,
  FaTimes
} from "react-icons/fa";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// --- TRANSLATIONS ---
const translations = {
  en: {
    // Header & Controls
    title: "Book Orders",
    total: "Total",
    searchPlaceholder: "Search Name, Email, Phone...",
    loading: "Loading orders...",

    // Empty State
    emptyTitle: "No Book Orders Found",
    emptyDesc: "We couldn't find any orders matching your criteria.",

    // Table Headers
    colOrderId: "Order ID",
    colCustomer: "Customer",
    colEmail: "Email",
    colPhone: "Phone",
    colQty: "Qty",
    colTotal: "Total",
    colPayment: "Payment",
    colStatus: "Status",
    colDate: "Date",
    colActions: "Actions",

    // Modals
    viewTitle: "Order Details",
    customerDetails: "Customer Details",
    name: "Name",
    orderInfo: "Order Info",
    amount: "Amount",
    booksPurchased: "Books Purchased",
    editTitle: "Edit Order Status",
    paymentStatus: "Payment Status",
    orderStatus: "Order Status",
    btnCancel: "Cancel",
    btnSave: "Save Changes",
    deleteTitle: "Delete Order",
    deleteDesc: "Are you sure you want to delete this order? This action cannot be undone.",
    btnDelete: "Yes, Delete",
    failedLoad: "Failed to load details.",

    // Messages
    msgUpdateSuccess: "Order updated successfully!",
    msgUpdateFail: "Failed to update order.",
    msgDeleteSuccess: "Order deleted successfully!",
    msgDeleteFail: "Failed to delete order.",

    // Status Display
    statusPending: "Pending",
    statusPaid: "Paid",
    statusConfirmed: "Confirmed",
    statusShipped: "Shipped",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled"
  },
  ta: {
    // Header & Controls
    title: "புத்தக ஆர்டர்கள்",
    total: "மொத்தம்",
    searchPlaceholder: "பெயர், மின்னஞ்சல், தொலைபேசி மூலம் தேடுக...",
    loading: "ஆர்டர்கள் ஏற்றப்படுகின்றன...",

    // Empty State
    emptyTitle: "புத்தக ஆர்டர்கள் எதுவும் காணப்படவில்லை",
    emptyDesc: "உங்கள் அளவுகோல்களுடன் பொருந்தும் ஆர்டர்கள் எதுவும் காணப்படவில்லை.",

    // Table Headers
    colOrderId: "ஆர்டர் ஐடி",
    colCustomer: "வாடிக்கையாளர்",
    colEmail: "மின்னஞ்சல்",
    colPhone: "தொலைபேசி",
    colQty: "அளவு",
    colTotal: "மொத்தம்",
    colPayment: "கட்டணம்",
    colStatus: "நிலை",
    colDate: "தேதி",
    colActions: "செயல்கள்",

    // Modals
    viewTitle: "ஆர்டர் விவரங்கள்",
    customerDetails: "வாடிக்கையாளர் விவரங்கள்",
    name: "பெயர்",
    orderInfo: "ஆர்டர் தகவல்",
    amount: "தொகை",
    booksPurchased: "வாங்கிய புத்தகங்கள்",
    editTitle: "ஆர்டர் நிலையை மாற்று",
    paymentStatus: "கட்டண நிலை",
    orderStatus: "ஆர்டர் நிலை",
    btnCancel: "ரத்து செய்",
    btnSave: "மாற்றங்களைச் சேமி",
    deleteTitle: "ஆர்டரை நீக்கு",
    deleteDesc: "இந்த ஆர்டரை உறுதியாக நீக்க விரும்புகிறீர்களா? இந்த செயலை செயல்தவிர்க்க முடியாது.",
    btnDelete: "ஆம், நீக்கு",
    failedLoad: "விவரங்களை ஏற்ற முடியவில்லை.",

    // Messages
    msgUpdateSuccess: "ஆர்டர் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
    msgUpdateFail: "ஆர்டரை புதுப்பிக்க முடியவில்லை.",
    msgDeleteSuccess: "ஆர்டர் வெற்றிகரமாக நீக்கப்பட்டது!",
    msgDeleteFail: "ஆர்டரை நீக்க முடியவில்லை.",

    // Status Display
    statusPending: "நிலுவையில்",
    statusPaid: "செலுத்தப்பட்டது",
    statusConfirmed: "உறுதி செய்யப்பட்டது",
    statusShipped: "அனுப்பப்பட்டது",
    statusDelivered: "வழங்கப்பட்டது",
    statusCancelled: "ரத்து செய்யப்பட்டது"
  }
};

export default function BookOrder() {
  // Language State
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang] || translations['en'];

  useEffect(() => {
    const handleStorageChange = () => {
      const storedLang = localStorage.getItem('app_lang');
      if (storedLang && storedLang !== lang) setLang(storedLang);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [lang]);

  // Main State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Selected Data state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrderDetails, setViewOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    order_status: "",
    payment_status: ""
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
  setLoading(true);

  try {
    const response = await authenticatedFetch("/admin/book/orders/");
    const data = await response.json(); // <-- parse response

    setOrders(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = (order.customer_name || order.user_name || "").toLowerCase().includes(searchLower);
    const emailMatch = (order.email || "").toLowerCase().includes(searchLower);
    const phoneMatch = (order.phone || "").toLowerCase().includes(searchLower);
    return nameMatch || emailMatch || phoneMatch;
  });

  // ---- ACTIONS ----
  const openViewModal = async (order) => {
  setViewModalOpen(true);
  setLoadingDetails(true);

  try {
    const response = await authenticatedFetch(`/admin/book/order/${order._id}/`);
    const data = await response.json(); // <-- parse response

    setViewOrderDetails(data);
  } catch (error) {
    console.error("Error fetching single order:", error);
  } finally {
    setLoadingDetails(false);
  }
};

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setEditForm({
      order_status: order.order_status,
      payment_status: order.payment_status
    });
    setEditModalOpen(true);
  };

  const submitEdit = async (e) => {
  e.preventDefault();

  try {
    await authenticatedFetch(`/admin/book/order/${selectedOrder._id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editForm),
    });

    setEditModalOpen(false);
    fetchOrders();
    alert(t.msgUpdateSuccess);
  } catch (error) {
    console.error(error);
    alert(t.msgUpdateFail);
  }
};

  const openDeleteModal = (order) => {
    setSelectedOrder(order);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
  try {
    await authenticatedFetch(`/admin/book/order/${selectedOrder._id}/`, {
      method: "DELETE",
    });

    setDeleteModalOpen(false);
    fetchOrders();
    alert(t.msgDeleteSuccess);
  } catch (error) {
    console.error(error);
    alert(t.msgDeleteFail);
  }
};

  // ---- UTILS & TRANSLATION HELPERS ----
  const translateStatus = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "pending") return t.statusPending;
    if (s === "paid") return t.statusPaid;
    if (s === "confirmed") return t.statusConfirmed;
    if (s === "shipped") return t.statusShipped;
    if (s === "delivered") return t.statusDelivered;
    if (s === "cancelled") return t.statusCancelled;
    return status;
  };

  const getPaymentBadge = (status) => {
    const s = status?.toLowerCase() || "";
    return s === "paid" ? "badge-green" : "badge-orange";
  };

  const getOrderBadge = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "confirmed") return "badge-blue";
    if (s === "shipped") return "badge-purple";
    if (s === "delivered") return "badge-green";
    if (s === "cancelled") return "badge-red";
    return "badge-orange";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  return (
    <div className="book-orders-container">
      {/* Header Area */}
      <div className="dashboard-header">
        <div className="header-title">
          <h2>{t.title}</h2>
          <span className="total-badge">{t.total}: {orders.length}</span>
        </div>

        <div className="header-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <button className="btn-refresh" onClick={fetchOrders} title="Refresh">
            <FaSync className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-card">
        {loading ? (
          <div className="loading-state">
            <FaSpinner className="spin spinner-icon" />
            <p>{t.loading}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <FaBoxOpen className="empty-icon" />
            <h3>{t.emptyTitle}</h3>
            <p>{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>{t.colOrderId}</th>
                  <th>{t.colCustomer}</th>
                  <th>{t.colEmail}</th>
                  <th>{t.colPhone}</th>
                  <th>{t.colQty}</th>
                  <th>{t.colTotal}</th>
                  <th>{t.colPayment}</th>
                  <th>{t.colStatus}</th>
                  <th>{t.colDate}</th>
                  <th>{t.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td data-label={t.colOrderId}>#{order._id.substring(0, 6)}</td>
                    <td data-label={t.colCustomer}>{order.customer_name || order.user_name}</td>
                    <td data-label={t.colEmail}>{order.email}</td>
                    <td data-label={t.colPhone}>{order.phone}</td>
                    <td data-label={t.colQty}>{order.total_books}</td>
                    <td data-label={t.colTotal}>₹{order.total_amount}</td>
                    <td data-label={t.colPayment}>
                      <span className={`badge ${getPaymentBadge(order.payment_status)}`}>
                        {translateStatus(order.payment_status)}
                      </span>
                    </td>
                    <td data-label={t.colStatus}>
                      <span className={`badge ${getOrderBadge(order.order_status)}`}>
                        {translateStatus(order.order_status)}
                      </span>
                    </td>
                    <td data-label={t.colDate}>{formatDate(order.created_at)}</td>
                    <td data-label={t.colActions} className="actions-cell">
                      <button className="action-btn view" onClick={() => openViewModal(order)} title="View"><FaEye /></button>
                      <button className="action-btn edit" onClick={() => openEditModal(order)} title="Edit"><FaEdit /></button>
                      <button className="action-btn delete" onClick={() => openDeleteModal(order)} title="Delete"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h3>{t.viewTitle}</h3>
              <button className="close-btn" onClick={() => setViewModalOpen(false)}><FaTimes /></button>
            </div>

            <div className="modal-body">
              {loadingDetails ? (
                <div className="loading-state"><FaSpinner className="spin spinner-icon" /></div>
              ) : viewOrderDetails ? (
                <div className="view-grid">
                  <div className="detail-card">
                    <h4>{t.customerDetails}</h4>
                    <p><strong>{t.name}:</strong> {viewOrderDetails.customer_name || viewOrderDetails.user_name}</p>
                    <p><strong>{t.colEmail}:</strong> {viewOrderDetails.email}</p>
                    <p><strong>{t.colPhone}:</strong> {viewOrderDetails.phone}</p>
                  </div>

                  <div className="detail-card">
                    <h4>{t.orderInfo}</h4>
                    <p><strong>{t.colDate}:</strong> {formatDate(viewOrderDetails.created_at)}</p>
                    <p><strong>{t.total} {t.booksPurchased}:</strong> {viewOrderDetails.total_books}</p>
                    <p><strong>{t.amount}:</strong> ₹{viewOrderDetails.total_amount}</p>
                    <p>
                      <strong>{t.colPayment}:</strong>
                      <span className={`badge ${getPaymentBadge(viewOrderDetails.payment_status)}`}>
                        {translateStatus(viewOrderDetails.payment_status)}
                      </span>
                    </p>
                    <p>
                      <strong>{t.colStatus}:</strong>
                      <span className={`badge ${getOrderBadge(viewOrderDetails.order_status)}`}>
                        {translateStatus(viewOrderDetails.order_status)}
                      </span>
                    </p>
                  </div>

                  <div className="books-list-card">
                    <h4>{t.booksPurchased}</h4>
                    <div className="books-grid">
                      {viewOrderDetails.books?.map((book, idx) => (
                        <div className="book-item" key={idx}>


                            <img
                              src={
                                book.image_url
                                  ? `${BACKEND_URL}/${book.image_url}`
                                  : "https://via.placeholder.com/60"
                              }
                              alt={book.title}
                              className="book-img"
                            />
                          <div className="book-info">
                            <h5>{book.title}</h5>
                            <small className="text-muted">{book.author}</small>
                            <div className="book-price-row">
                              <span>{t.colQty}: {book.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p>{t.failedLoad}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>{t.editTitle}</h3>
              <button className="close-btn" onClick={() => setEditModalOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={submitEdit} className="modal-body">
              <div className="form-group">
                <label>{t.paymentStatus}</label>
                <select
                  value={editForm.payment_status}
                  onChange={(e) => setEditForm({...editForm, payment_status: e.target.value})}
                  required
                >
                  <option value="Pending">{t.statusPending}</option>
                  <option value="Paid">{t.statusPaid}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t.orderStatus}</label>
                <select
                  value={editForm.order_status}
                  onChange={(e) => setEditForm({...editForm, order_status: e.target.value})}
                  required
                >
                  <option value="Pending">{t.statusPending}</option>
                  <option value="Confirmed">{t.statusConfirmed}</option>
                  <option value="Shipped">{t.statusShipped}</option>
                  <option value="Delivered">{t.statusDelivered}</option>
                  <option value="Cancelled">{t.statusCancelled}</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditModalOpen(false)}>{t.btnCancel}</button>
                <button type="submit" className="btn-primary">{t.btnSave}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>{t.deleteTitle}</h3>
              <button className="close-btn" onClick={() => setDeleteModalOpen(false)}><FaTimes /></button>
            </div>
            <div className="modal-body text-center">
              <FaTrash className="warning-icon" />
              <p>{t.deleteDesc}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>{t.btnCancel}</button>
              <button className="btn-danger" onClick={confirmDelete}>{t.btnDelete}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- INLINE STYLES --- */}
      <style>{`
        :root {
          --bg-color: #f4f7fe;
          --card-bg: #ffffff;
          --text-main: #2b3674;
          --text-muted: #a3aed1;
          --border-color: #e2e8f0;
          
          --primary-color: #4318FF;
          --primary-hover: #3311db;
          --danger-color: #ee5d50;
          
          --badge-orange: #ffb547;
          --badge-orange-bg: #fff5e6;
          --badge-green: #05cd99;
          --badge-green-bg: #e6fcf5;
          --badge-blue: #3965ff;
          --badge-blue-bg: #ebf0ff;
          --badge-purple: #8758ff;
          --badge-purple-bg: #f3efff;
          --badge-red: #ee5d50;
          --badge-red-bg: #ffeded;
        }

        .book-orders-container {
          padding: 24px;
          background-color: var(--bg-color);
          min-height: 100vh;
          font-family: ui-sans-serif, system-ui, sans-serif;
          color: var(--text-main);
        }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-title h2 { margin: 0; font-size: 24px; font-weight: 700; }

        .total-badge {
          background-color: var(--primary-color);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
          display: inline-block;
        }

        .header-controls { display: flex; gap: 12px; align-items: center; }

        .search-wrapper { position: relative; }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding: 10px 10px 10px 36px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          width: 260px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
        }

        .search-input:focus { border-color: var(--primary-color); }

        .btn-refresh {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          color: var(--primary-color);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-refresh:hover { background: var(--primary-color); color: white; }

        /* Main Content Card */
        .content-card {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Table Styles */
        .table-responsive { overflow-x: auto; }

        .orders-table { width: 100%; border-collapse: collapse; text-align: left; }

        .orders-table th {
          padding: 16px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 13px;
          border-bottom: 2px solid var(--border-color);
          position: sticky;
          top: 0;
          background: var(--card-bg);
          white-space: nowrap;
        }

        .orders-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          font-size: 14px;
          vertical-align: middle;
        }

        .orders-table tbody tr { transition: background-color 0.2s; }
        .orders-table tbody tr:hover { background-color: #f8fafc; }

        /* Badges */
        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        .badge-orange { background: var(--badge-orange-bg); color: var(--badge-orange); }
        .badge-green { background: var(--badge-green-bg); color: var(--badge-green); }
        .badge-blue { background: var(--badge-blue-bg); color: var(--badge-blue); }
        .badge-purple { background: var(--badge-purple-bg); color: var(--badge-purple); }
        .badge-red { background: var(--badge-red-bg); color: var(--badge-red); }

        /* Actions */
        .actions-cell { display: flex; gap: 8px; }

        .action-btn {
          border: none;
          background: transparent;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .action-btn.view { color: var(--badge-blue); background: var(--badge-blue-bg); }
        .action-btn.view:hover { background: var(--badge-blue); color: white; }
        .action-btn.edit { color: var(--badge-purple); background: var(--badge-purple-bg); }
        .action-btn.edit:hover { background: var(--badge-purple); color: white; }
        .action-btn.delete { color: var(--badge-red); background: var(--badge-red-bg); }
        .action-btn.delete:hover { background: var(--badge-red); color: white; }

        /* States */
        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: var(--text-muted);
        }

        .spinner-icon { font-size: 32px; color: var(--primary-color); margin-bottom: 16px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .empty-icon { font-size: 64px; color: var(--border-color); margin-bottom: 16px; }

        /* Modals */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; backdrop-filter: blur(4px); padding: 16px;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 16px; width: 100%; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); animation: slideUp 0.3s ease-out;
        }

        .small-modal { max-width: 400px; }
        .view-modal { max-width: 800px; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 24px; border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 { margin: 0; font-size: 18px; }

        .close-btn {
          background: transparent; border: none; font-size: 18px;
          color: var(--text-muted); cursor: pointer; transition: color 0.2s;
        }
        .close-btn:hover { color: var(--danger-color); }

        .modal-body { padding: 24px; }
        .text-center { text-align: center; }
        .warning-icon { font-size: 48px; color: var(--danger-color); margin-bottom: 16px; }

        /* View Modal Specifics */
        .view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .detail-card, .books-list-card {
          background: var(--bg-color); padding: 16px; border-radius: 12px;
        }

        .detail-card h4, .books-list-card h4 {
          margin-top: 0; margin-bottom: 12px; font-size: 15px;
          color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;
        }

        .detail-card p { margin: 8px 0; font-size: 14px; }

        .books-list-card { grid-column: span 2; }

        .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

        .book-item {
          display: flex; gap: 12px; background: var(--card-bg);
          padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);
        }

        .book-img { width: 60px; height: 80px; object-fit: cover; border-radius: 4px; }

        .book-info { flex: 1; }
        .book-info h5 { margin: 0 0 4px 0; font-size: 14px; }
        .book-info .text-muted { font-size: 12px; color: var(--text-muted); }

        .book-price-row {
          display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px;
        }

        /* Forms */
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; }
        .form-group select {
          width: 100%; padding: 10px; border: 1px solid var(--border-color);
          border-radius: 8px; font-size: 14px; outline: none;
        }
        .form-group select:focus { border-color: var(--primary-color); }

        .modal-footer {
          display: flex; justify-content: flex-end; gap: 12px;
          padding: 16px 24px; border-top: 1px solid var(--border-color);
        }

        .btn-primary, .btn-secondary, .btn-danger {
          padding: 10px 16px; border-radius: 8px; font-size: 14px;
          font-weight: 500; cursor: pointer; border: none; transition: opacity 0.2s;
        }
        .btn-primary { background: var(--primary-color); color: white; }
        .btn-danger { background: var(--danger-color); color: white; }
        .btn-secondary { background: var(--bg-color); color: var(--text-main); }
        .btn-primary:hover, .btn-danger:hover { opacity: 0.9; }
        .btn-secondary:hover { background: #e2e8f0; }

        /* Responsive Mobile Cards for Table */
        @media (max-width: 768px) {
          .dashboard-header { flex-direction: column; align-items: flex-start; }
          .search-input { width: 100%; }
          .header-controls { width: 100%; justify-content: space-between; }
          
          .orders-table thead { display: none; }
          
          .orders-table, .orders-table tbody, .orders-table tr, .orders-table td {
            display: block; width: 100%;
          }
          
          .orders-table tr {
            margin-bottom: 16px; border: 1px solid var(--border-color);
            border-radius: 12px; padding: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          }
          
          .orders-table td {
            text-align: right; padding: 10px 0; border-bottom: 1px solid #f1f5f9;
            position: relative; padding-left: 50%;
          }
          
          .orders-table td::before {
            content: attr(data-label); position: absolute; left: 0; width: 45%;
            text-align: left; font-weight: 600; color: var(--text-muted);
          }
          
          .orders-table td:last-child { border-bottom: 0; }
          .actions-cell { justify-content: flex-end; }
          
          .view-grid { grid-template-columns: 1fr; }
          .books-list-card { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
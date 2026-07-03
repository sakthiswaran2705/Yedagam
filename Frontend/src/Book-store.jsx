import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  BookOpen, CheckCircle, Clock, Search, Trash2, Edit, X, Image as ImageIcon,
  AlertCircle, Loader2, ToggleLeft, ToggleRight, DollarSign, FileText
} from 'lucide-react';
import { authenticatedFetch } from './authFetch';
import Footer from "./Footer.jsx";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// --- TRANSLATIONS ---
const translations = {
  en: {
    title: "📚 Book Inventory",
    subtitle: "Manage library books, pricing, and availability with auto-translation",
    totalBooks: "Total Books",
    published: "Published",
    pending: "Pending",
    createBook: "Add New Book",
    updateBook: "Update Book",
    bookTitle: "Book Title ",
    author: "Author Name",
    price: "Price (₹)",
    offer: "Discount Offer (%)",
    pages: "Total Pages",
    description: "Description ",
    coverImage: "Drag & Drop Cover Image",
    publishBtn: "Save Book",
    updateBtn: "Update Book",
    search: "Search books...",
    allStatus: "All Status",
    noBooks: "No Books Found",
    noBooksSub: "Add your first book using the form on the left.",
    editingBanner: "You are currently updating an existing book.",
    processing: "Please Wait...",
    uploadingMedia: "Uploading Cover Image...",
    translating: "Translating to Tamil & Saving...",
    deleteConfirm: "Delete Book? This action cannot be undone."
  },
  ta: {
    title: "📚 புத்தக இருப்பு",
    subtitle: "நூலக புத்தகங்கள், விலை மற்றும் இருப்பை நிர்வகிக்கவும்",
    totalBooks: "மொத்த புத்தகங்கள்",
    published: "வெளியிடப்பட்டது",
    pending: "நிலுவையில் உள்ளது",
    createBook: "புதிய புத்தகம் சேர்",
    updateBook: "புத்தகத்தை புதுப்பி",
    bookTitle: "புத்தகத்தின் தலைப்பு",
    author: "ஆசிரியர் பெயர்",
    price: "விலை (₹)",
    offer: "தள்ளுபடி (%)",
    pages: "மொத்த பக்கங்கள்",
    description: "விளக்கம்",
    coverImage: "முகப்புப் படத்தை பதிவேற்றவும்",
    publishBtn: "புத்தகத்தை சேமி",
    updateBtn: "புதுப்பிக்கவும்",
    search: "தேடு...",
    allStatus: "அனைத்தும்",
    noBooks: "புத்தகங்கள் எதுவும் இல்லை",
    noBooksSub: "படிவத்தைப் பயன்படுத்தி முதல் புத்தகத்தை சேர்க்கவும்.",
    editingBanner: "நீங்கள் தற்போது ஒரு புத்தகத்தைப் புதுப்பிக்கிறீர்கள்.",
    processing: "காத்திருக்கவும்...",
    uploadingMedia: "படம் பதிவேற்றப்படுகிறது...",
    translating: "தமிழில் மொழிபெயர்க்கப்படுகிறது...",
    deleteConfirm: "புத்தகத்தை நீக்க வேண்டுமா? இந்தச் செயலை செயல்தவிர்க்க முடியாது."
  }
};

const BookStore = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang] || translations['en'];

  // --- STATES ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form & Processing States
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');

  const [form, setForm] = useState({
    title: '', author: '', price: '', offer: '', pages: '', description: ''
  });
  const [coverFile, setCoverFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { 'Authorization': `Bearer ${token}` };
  };

  // --- API CALLS ---
  const fetchBooks = async () => {
  setLoading(true);
  try {
    const response = await authenticatedFetch(
      `/get/all/?lang=${lang}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) throw new Error("Failed to fetch books");

    const data = await response.json();
    setBooks(data);
  } catch (err) {
    toast.error("Failed to load books");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleStatusToggle = async (bookId) => {
      const loadingToast = toast.loading("Updating status...");

      try {
        const response = await authenticatedFetch(
          `/status/replacer/${bookId}/`,
          {
            method: "POST",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) throw new Error("Failed to update status");

        const data = await response.json();

        setBooks(
          books.map((b) =>
            b.id === bookId ? { ...b, status: data.status } : b
          )
        );

        toast.success("Status updated successfully", { id: loadingToast });
      } catch (err) {
        toast.error(err.message, { id: loadingToast });
      }
    };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    const loadingToast = toast.loading("Deleting book...");
    try {
      const response = await authenticatedFetch(
          `/delete/${id}/`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
        );
      if (!response.ok) throw new Error('Failed to delete book');

      setBooks(books.filter(b => b.id !== id));
      toast.success("Book deleted successfully", { id: loadingToast });
      if (editId === id) resetForm();
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  // --- FORM HANDLERS ---
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'description') {
      e.target.style.height = 'inherit';
      e.target.style.height = `${Math.max(e.target.scrollHeight, 120)}px`;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({ title: '', author: '', price: '', offer: '', pages: '', description: '' });
    setCoverFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (book) => {
    setIsEditing(true);
    setEditId(book.id);
    setForm({
      title: book.title || '',
      author: book.author || '',
      price: book.price || '',
      offer: book.offer || '',
      pages: book.pages || '',
      description: book.description || ''
    });
    setImagePreview(book.image_url ? `${API_BASE_URL}/${book.image_url.replace(/^\//, '')}` : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate Workflow Steps visually
    setProcessStep(t.uploadingMedia);

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('author', form.author);
    payload.append('price', form.price);
    payload.append('offer', form.offer);
    payload.append('pages', form.pages);
    payload.append('description', form.description);

    if (coverFile) {
      payload.append('image_file', coverFile);
    }

    // After brief delay, switch to Translation message (Auto-Translation handled by backend)
    setTimeout(() => setProcessStep(t.translating), 800);

    const url = isEditing
    ? `/update/${editId}/`
    : `/create/`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await authenticatedFetch(url, {
            method,
            headers: getAuthHeaders(),
            body: payload
        });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Something went wrong');

      toast.success(isEditing ? "Book Updated Successfully" : "Book Saved Successfully");
      fetchBooks();
      resetForm();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- FILTERS & STATS ---
  const filteredBooks = books.filter(book => {
    const searchMatch = (book.title || "").toLowerCase().includes(searchFilter.toLowerCase());
    const currentStatus = (book.status || "pending").toLowerCase().trim();
    const selectedStatus = (statusFilter || "All").toLowerCase().trim();
    const statusMatch = selectedStatus === "all" || currentStatus === selectedStatus;
    return searchMatch && statusMatch;
  });

  const stats = {
    total: books.length,
    published: books.filter(b => (b.status || "").toLowerCase().trim() === "published").length,
    pending: books.filter(b => (b.status || "pending").toLowerCase().trim() === "pending").length,
  };

  return (
    <>
      <Toaster position="top-right" />
      <style>{cssStyles}</style>

      {/* --- WORKFLOW PROCESSING OVERLAY --- */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="processing-overlay">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="processing-modal">
              <Loader2 className="spinner modal-spinner" size={48} />
              <h3>{isEditing ? t.updateBtn : t.publishBtn}</h3>
              <p>{t.processing}</p>
              <div className="process-step">{processStep}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-layout">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
        </header>

        {/* Stats row */}
        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card gradient-blue">
            <BookOpen size={24} /><div><h3>{stats.total}</h3><p>{t.totalBooks}</p></div>
          </div>
          <div className="stat-card gradient-green">
            <CheckCircle size={24} /><div><h3>{stats.published}</h3><p>{t.published}</p></div>
          </div>
          <div className="stat-card gradient-amber">
            <Clock size={24} /><div><h3>{stats.pending}</h3><p>{t.pending}</p></div>
          </div>
        </div>

        <div className="main-grid">

          {/* --- LEFT FORM SECTION --- */}
          <section className="form-section">
            <div className="glass-panel sticky-form">
              <AnimatePresence>
                {isEditing && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="edit-banner">
                    <Edit size={18} /><span><strong>{t.editingBanner}</strong></span>
                    <button type="button" onClick={resetForm}><X size={16} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <h2 className="section-title">{isEditing ? t.updateBook : t.createBook}</h2>

              <form onSubmit={handleSubmit} className="book-form">

                <div className="form-row">
                  <div className="input-group">
                    <input type="text" name="title" className="floating-input" placeholder=" " value={form.title} onChange={handleTextChange} required />
                    <label className="floating-label">{t.bookTitle}</label>
                  </div>
                  <div className="input-group">
                    <input type="text" name="author" className="floating-input" placeholder=" " value={form.author} onChange={handleTextChange} required />
                    <label className="floating-label">{t.author}</label>
                  </div>
                </div>

                <div className="form-row three-cols">
                  <div className="input-group">
                    <input type="number" step="0.01" name="price" className="floating-input" placeholder=" " value={form.price} onChange={handleTextChange} required />
                    <label className="floating-label">{t.price}</label>
                  </div>
                  <div className="input-group">
                    <input type="number" name="offer" className="floating-input" placeholder=" " value={form.offer} onChange={handleTextChange} />
                    <label className="floating-label">{t.offer}</label>
                  </div>
                  <div className="input-group">
                    <input type="number" name="pages" className="floating-input" placeholder=" " value={form.pages} onChange={handleTextChange} required />
                    <label className="floating-label" style={{fontSize: "0.6rem"}}>{t.pages}</label>


                  </div>
                </div>

                <div className="input-group">
                  <textarea name="description" className="floating-input textarea" placeholder=" " value={form.description} onChange={handleTextChange} required />
                  <label className="floating-label">{t.description}</label>
                </div>

                <div className="media-uploads">
                  <div className={`upload-zone full-width ${imagePreview ? 'has-image' : ''}`}>
                    <input type="file" accept="image/*" onChange={handleFileChange} required={!isEditing && !coverFile} />
                    {imagePreview ? (
                      <div className="preview-container">
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                        <div className="preview-overlay">
                          <ImageIcon size={24} /><span>Change Cover Image</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="icon-circle"><ImageIcon size={28} className="text-primary" /></div>
                        <p style={{ fontWeight: '600' }}>{t.coverImage}</p>
                        <p style={{ fontSize: '0.75rem' }}>PNG, JPG or WEBP (Max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="spinner" /> : (isEditing ? t.updateBtn : t.publishBtn)}
                </button>
              </form>
            </div>
          </section>

          {/* --- RIGHT LIST SECTION --- */}
          <section className="list-section">
            <div className="list-toolbar">
              <div className="search-bar">
                <Search size={18} className="text-muted" />
                <input type="text" placeholder={t.search} value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} />
              </div>
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">{t.allStatus}</option>
                <option value="published">{t.published}</option>
                <option value="pending">{t.pending}</option>
              </select>
            </div>

            <div className="books-grid">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <motion.div key={`skel-${i}`} exit={{ opacity: 0 }} className="book-card skeleton">
                      <div className="skel-img pulse"></div>
                      <div className="skel-content">
                        <div className="skel-line pulse w-80"></div>
                        <div className="skel-line pulse w-50"></div>
                      </div>
                    </motion.div>
                  ))
                ) : filteredBooks.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state full-span">
                    <div className="empty-icon"><BookOpen size={48} /></div>
                    <h3>{t.noBooks}</h3>
                    <p>{t.noBooksSub}</p>
                  </motion.div>
                ) : (
                  filteredBooks.map((book, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      key={book.id} className="book-card"
                    >
                      <div className="book-image-container">
                        {book.image_url ? (
                         <img
                              src={`${API_BASE_URL}${book.image_url.startsWith("/") ? "" : "/"}${book.image_url}`}
                              alt={book.title}
                              loading="lazy"
                            />
                        ) : (
                          <div className="image-placeholder"><ImageIcon size={32} /></div>
                        )}
                        <span className={`status-badge ${(book.status || 'pending').toLowerCase()}`}>
                          {(book.status || 'pending').toLowerCase() === "published" ? t.published : t.pending}
                        </span>
                      </div>

                      <div className="book-info">
                        <h3 className="book-title" title={book.title}>{book.title}</h3>
                        <p className="book-author">By {book.author}</p>

                        <div className="book-meta-grid">
                          <span className="book-price">₹{book.price}</span>
                          {book.offer && <span className="book-offer">{book.offer}% OFF</span>}
                          <span className="book-pages"><FileText size={14}/> {book.pages} Pages</span>
                        </div>

                        <div className="card-actions">
                          <button
                            className={`icon-btn toggle-btn ${(book.status || 'pending').toLowerCase() === "published" ? "active" : ""}`}
                            title="Toggle Status"
                            onClick={() => handleStatusToggle(book.id)}
                          >
                            {(book.status || 'pending').toLowerCase() === 'published' ? <ToggleRight size={20} className="text-success" /> : <ToggleLeft size={20} className="text-muted" />}
                          </button>
                          <button className="icon-btn edit-btn" onClick={() => handleEdit(book)} title="Edit Book">
                            <Edit size={16} />
                          </button>
                          <button className="icon-btn delete-btn" onClick={() => handleDelete(book.id)} title="Delete Book">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

// --- CSS STYLES ---
const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --bg-color: #F8FAFC;
    --card-bg: #FFFFFF;
    --text-main: #0F172A;
    --text-muted: #64748B;
    --border: #E2E8F0;
    --primary: #3B82F6;
    --primary-hover: #2563EB;
    --danger: #EF4444;
    --success: #10B981;
    --amber: #F59E0B;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --radius-lg: 16px;
    --radius-xl: 24px;
    font-family: 'Inter', sans-serif;
  }

  body { background-color: var(--bg-color); color: var(--text-main); margin: 0; }
  * { box-sizing: border-box; }

  .admin-layout { max-width: 1600px; margin: 0 auto; padding: 2rem; }

  .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
  .header-title h1 { margin: 0 0 0.5rem; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; }
  .header-title p { margin: 0; color: var(--text-muted); font-size: 1.1rem; }
  
  .stats-grid { display: flex; flex-wrap: wrap; gap: 1rem; }
  .stat-card { flex: 1; display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 1.75rem; border-radius: var(--radius-lg); color: white; min-width: 180px; box-shadow: var(--shadow-md); transition: transform 0.2s; }
  .stat-card:hover { transform: translateY(-4px); }
  .stat-card h3 { margin: 0; font-size: 1.8rem; font-weight: 800; }
  .stat-card p { margin: 0; font-size: 0.9rem; opacity: 0.9; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
  
  .gradient-blue { background: linear-gradient(135deg, #2563EB, #3B82F6); }
  .gradient-green { background: linear-gradient(135deg, #059669, #10B981); }
  .gradient-amber { background: linear-gradient(135deg, #D97706, #F59E0B); }

  /* SIDE-BY-SIDE MAIN LAYOUT */
  .main-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2.5rem; align-items: start; }

  .glass-panel { background: var(--card-bg); border-radius: var(--radius-xl); padding: 2rem; box-shadow: var(--shadow-lg); border: 1px solid var(--border); }
  .sticky-form { position: sticky; top: 2rem; }
  .section-title { margin: 0 0 2rem 0; font-size: 1.5rem; font-weight: 700; }

  .edit-banner { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; padding: 1rem 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; font-size: 0.95rem; }
  .edit-banner button { margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; padding: 0.25rem; }

  .book-form { display: flex; flex-direction: column; gap: 1.5rem; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  .three-cols { grid-template-columns: 1fr 1fr 1fr; }

  .input-group { position: relative; width: 100%; }
  .floating-input { width: 100%; padding: 1.25rem 1rem 0.75rem; border-radius: 12px; border: 1px solid var(--border); font-size: 1rem; background: var(--bg-color); outline: none; color: var(--text-main); transition: all 0.2s; font-family: inherit; }
  .floating-input:focus { border-color: var(--primary); background: var(--card-bg); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
  .floating-label { position: absolute; left: 1rem; top: 1rem; color: var(--text-muted); font-size: 0.9rem; transition: all 0.2s ease-out; pointer-events: none; }
  .floating-input:focus ~ .floating-label, .floating-input:not(:placeholder-shown) ~ .floating-label { top: 0.4rem; font-size: 0.75rem; color: var(--primary); font-weight: 600; }
  
  textarea.floating-input { resize: none; min-height: 120px; overflow: hidden; }

  /* Media Upload */
  .media-uploads { display: flex; gap: 1rem; }
  .upload-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 1.5rem; text-align: center; position: relative; background: var(--bg-color); transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; overflow: hidden; min-height: 150px; }
  .upload-zone:hover { border-color: var(--primary); background: #EFF6FF; }
  .upload-zone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; z-index: 10; }
  .full-width { width: 100%; }
  
  .upload-zone.has-image { padding: 0; border-style: solid; }
  .preview-container { width: 100%; height: 200px; position: relative; }
  .image-preview { width: 100%; height: 100%; object-fit: cover; }
  .preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: white; font-weight: 600; opacity: 0; transition: opacity 0.2s; z-index: 5; pointer-events: none; }
  .upload-zone:hover .preview-overlay { opacity: 1; }

  .icon-circle { width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .text-primary { color: var(--primary); }

  .btn-submit { background: var(--primary); color: white; border: none; padding: 1.25rem; border-radius: 12px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3); display: flex; justify-content: center; align-items: center; width: 100%; }
  .btn-submit:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-2px); }
  .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  /* Right Side List */
  .list-toolbar { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .search-bar { flex: 1; min-width: 200px; display: flex; align-items: center; background: var(--card-bg); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); gap: 0.75rem; transition: border-color 0.2s; }
  .search-bar:focus-within { border-color: var(--primary); }
  .search-bar input { border: none; outline: none; width: 100%; font-size: 0.95rem; background: transparent; }
  .filter-select { padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border); background: var(--card-bg); font-weight: 500; outline: none; cursor: pointer; min-width: 140px; }

  .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
  
  .book-card { background: var(--card-bg); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.3s ease, box-shadow 0.3s ease; border: 1px solid var(--border); display: flex; flex-direction: column; }
  .book-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }

  .book-image-container { height: 180px; background: #F1F5F9; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;}
  .book-image-container img { width: 100%; height: 100%; object-fit: cover; }
  .image-placeholder { color: #CBD5E1; }

  .status-badge { position: absolute; top: 1rem; right: 1rem; padding: 0.25rem 0.6rem; border-radius: 99px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; backdrop-filter: blur(4px); }
  .status-badge.published { background: rgba(209, 250, 229, 0.9); color: #065F46; }
  .status-badge.pending { background: rgba(254, 243, 199, 0.9); color: #92400E; }

  .book-info { padding: 1.25rem; display: flex; flex-direction: column; flex: 1;}
  .book-title { font-size: 1.15rem; font-weight: 700; margin: 0 0 0.25rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-main); }
  .book-author { color: var(--text-muted); font-size: 0.85rem; margin: 0 0 1rem 0; }
  
  .book-meta-grid { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; }
  .book-price { font-size: 1.1rem; font-weight: 800; color: var(--text-main); }
  .book-offer { background: #FEE2E2; color: #DC2626; padding: 0.15rem 0.4rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
  .book-pages { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; font-weight: 500; margin-left: auto;}

  .card-actions { display: flex; gap: 0.5rem; border-top: 1px dashed var(--border); padding-top: 1rem; margin-top: auto; }
  .icon-btn { flex: 1; padding: 0.5rem; border-radius: 8px; background: var(--bg-color); color: var(--text-muted); border: 1px solid transparent; cursor: pointer; transition: all 0.2s; display: flex; justify-content: center; align-items: center; }
  .icon-btn:hover { background: #E2E8F0; color: var(--text-main); }
  .edit-btn:hover { color: var(--primary); background: #EFF6FF; border-color: #BFDBFE; }
  .delete-btn:hover { color: var(--danger); background: #FEF2F2; border-color: #FECACA; }
  .toggle-btn.active { background: #DCFCE7; color: #15803D; border-color: #BBF7D0;}
  .text-success { color: var(--success); }

  /* Processing Overlay */
  .processing-overlay { position: fixed; inset: 0; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
  .processing-modal { background: var(--card-bg); padding: 3rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); border: 1px solid var(--border); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; width: 90%; max-width: 400px; }
  .modal-spinner { color: var(--primary); animation: spin 1s linear infinite; }
  .processing-modal h3 { margin: 0; font-size: 1.5rem; }
  .processing-modal p { margin: 0; color: var(--text-muted); }
  .process-step { margin-top: 1rem; padding: 0.5rem 1.2rem; background: #EEF2FF; border-radius: 99px; font-size: 0.85rem; font-weight: 700; color: var(--primary); letter-spacing: 0.02em; }
  
  .empty-state { text-align: center; padding: 4rem 2rem; background: var(--card-bg); border-radius: 16px; border: 2px dashed var(--border); grid-column: 1 / -1; }
  .empty-icon { width: 64px; height: 64px; background: var(--bg-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--text-muted); }
  .empty-state h3 { margin: 0 0 0.5rem; } .empty-state p { margin: 0; color: var(--text-muted); }

  .skeleton .skel-img { height: 180px; width: 100%; background: var(--border); border-radius: 16px 16px 0 0; }
  .skeleton .skel-content { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .skel-line { height: 16px; border-radius: 4px; background: var(--border); }
  .w-80 { width: 80%; } .w-50 { width: 50%; }
  .pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  @media (max-width: 1200px) {
    .main-grid { grid-template-columns: 1fr; }
    .sticky-form { position: relative; top: 0; }
    .list-section { order: -1; } /* Put list above form on smaller screens if you want, or leave as is */
  }

  @media (max-width: 768px) {
    .admin-layout { padding: 1rem; }
    .glass-panel { padding: 1.5rem; }
    .form-row, .three-cols { grid-template-columns: 1fr; }
    .list-toolbar { flex-direction: column; }
    .filter-select { width: 100%; }
  }
`;

export default BookStore;

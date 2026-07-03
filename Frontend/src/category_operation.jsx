import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authenticatedFetch } from "./authFetch";
import {
  ArrowLeft, Plus, Trash2, Image as ImageIcon, UploadCloud,
  FolderOpen, Search, Loader2, Edit, CheckCircle2, ChevronUp,
  X, AlertTriangle, Info, Check
} from 'lucide-react';
import Footer from "./Footer.jsx";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const translations = {
  en: {
    back: 'Back to Dashboard',
    title: 'Category Management',
    subtitle: 'Manage your product categories and subcategories',
    addCategory: 'Create New Category',
    catName: 'Category Name',
    subName: 'Subcategory Name',
    catImage: 'Drop Category Image here',
    subImage: 'Drop Subcategory Image here',
    save: 'Create Category',
    loading: 'Loading categories...',
    noData: 'No categories found',
    noDataSub: 'Get started by creating your first category above.',
    searchPlaceholder: 'Search categories & subcategories...',
    noSearchResults: 'No matching results found.',
    updateImage: 'Update Image',
    successMsg: 'Operation completed successfully!',
    deleteConfirm: 'Are you sure you want to delete this category? This action cannot be undone.',
    deleteSubConfirm: 'Are you sure you want to delete this subcategory? This action cannot be undone.',
    totalCategories: 'Total Categories',
    totalSubcategories: 'Total Subcategories',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  ta: {
    back: 'டாஷ்போர்டுக்கு திரும்பு',
    title: 'வகை மேலாண்மை',
    subtitle: 'உங்கள் தயாரிப்பு வகைகள் மற்றும் துணை வகைகளை நிர்வகிக்கவும்',
    addCategory: 'புதிய வகையை உருவாக்கு',
    catName: 'வகை பெயர்',
    subName: 'துணை வகை பெயர்',
    catImage: 'வகை படத்தை இங்கே விடவும்',
    subImage: 'துணை வகை படத்தை இங்கே விடவும்',
    save: 'உருவாக்கு',
    loading: 'ஏற்றப்படுகிறது...',
    noData: 'வகைகள் எதுவும் கிடைக்கவில்லை',
    noDataSub: 'புதிய வகையை உருவாக்கித் தொடங்கவும்.',
    searchPlaceholder: 'வகைகளைத் தேடுங்கள்...',
    noSearchResults: 'பொருத்தமான முடிவுகள் இல்லை.',
    updateImage: 'படத்தை புதுப்பி',
    successMsg: 'வெற்றிகரமாக முடிந்தது!',
    deleteConfirm: 'இந்த வகையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?',
    deleteSubConfirm: 'இந்த துணை வகையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?',
    totalCategories: 'மொத்த வகைகள்',
    totalSubcategories: 'மொத்த துணை வகைகள்',
    cancel: 'ரத்துசெய்',
    confirm: 'உறுதிப்படுத்து'
  }
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- UTILS ---
const getImageUrl = (path) => {
  if (!path) return null;
  const cleanPath = path.replace(/\\/g, '/').replace(/^\//, '');
  return `${API_BASE_URL}/${cleanPath}`;
};

// --- REUSABLE UI COMPONENTS ---
const Modal = ({ isOpen, onClose, title, children, icon: Icon, type = 'default' }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="modal-backdrop" onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-content"
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className={`modal-icon-wrapper ${type}`}>
              {Icon && <Icon size={24} />}
            </div>
            <h3>{title}</h3>
            <button className="btn-close" onClick={onClose}><X size={20} /></button>
          </div>
          <div className="modal-body">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const FileUploadZone = memo(({ label, icon: Icon, onChange, accept, file }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          onChange({ target: { files: e.dataTransfer.files } });
        }
      }}
    >
      {file ? (
        <div className="upload-preview">
          <img src={URL.createObjectURL(file)} alt="Preview" className="preview-img" />
          <div className="preview-overlay">
            <CheckCircle2 className="success-icon" size={24} />
            <span className="file-name">{file.name}</span>
          </div>
        </div>
      ) : (
        <>
          <Icon className="upload-icon" size={28} />
          <p className="upload-label">{label}</p>
          <span className="upload-subtext">Drag & drop or click to browse</span>
        </>
      )}
      <input type="file" accept={accept} onChange={onChange} className="upload-input" />
    </div>
  );
});

const SkeletonLoader = () => (
  <div className="skeleton-card glass-card">
    <div className="skeleton-header">
      <div className="skeleton-avatar shimmer" />
      <div className="skeleton-title shimmer" />
    </div>
    <div className="skeleton-grid">
      {[1, 2, 3].map(i => <div key={i} className="skeleton-sub shimmer" />)}
    </div>
  </div>
);

// --- MAIN APPLICATION ---
const CategoryOp = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang];

  // Global State
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  // Form & File State
  const [formData, setFormData] = useState({ category_name: '', subcategory_name: '' });
  const [files, setFiles] = useState({ category_image: null, subcategory_image: null });
  const fileUpdateRef = useRef(null);
  const [updateTarget, setUpdateTarget] = useState({ categoryId: null, subcategoryId: null });

  // Modal & Toast State
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, title: '', message: '', onConfirm: null });

  // --- TOAST SYSTEM ---
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Language Event Sync callback
  const handleLanguageUpdate = (selectedLang) => {
    setLang(selectedLang);
  };

  // --- API OPERATIONS ---
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`/category-all/?lang=${lang}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      setAllCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      showToast(err.message, 'error');
      setAllCategories([]);
    } finally {
      setLoading(false);
    }
  }, [lang, showToast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const response = await authenticatedFetch(`/category/search/?category=${debouncedSearch}&lang=${lang}`);
        const data = await response.json();

        if (data?.status === "success") {
          setSearchResults(data.data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedSearch, lang]);

  const handleKeyDown = (e) => {
    if (!searchResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      setSearchQuery('');
      setSearchResults([]);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setSearchResults([]);
      setFocusedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- CRUD OPERATIONS ---
  const handleTextChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e, field) => {
    if (e.target.files?.[0]) setFiles(prev => ({ ...prev, [field]: e.target.files[0] }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append('category_name', formData.category_name);
    payload.append('subcategory_name', formData.subcategory_name);
    if (files.category_image) payload.append('category_image', files.category_image);
    if (files.subcategory_image) payload.append('subcategory_image', files.subcategory_image);

    try {
      const res = await authenticatedFetch('/category-add/', { method: 'POST', body: payload });
      if (!res.ok) throw new Error("Failed to create");
      setFormData({ category_name: '', subcategory_name: '' });
      setFiles({ category_image: null, subcategory_image: null });
      showToast(t.successMsg, 'success');
      fetchCategories();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (type, id, subId = null) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: type === 'category' ? t.deleteConfirm : t.deleteSubConfirm,
      message: 'This action cannot be undone and will permanently remove the data.',
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        try {
          const url = type === 'category' ? `/remove/${id}/` : `/remove/${id}/`;
          const options = { method: 'DELETE' };
          if (type === 'subcategory') {
            const payload = new FormData();
            payload.append('target_subcategory_id', subId);
            options.body = payload;
          }
          const res = await authenticatedFetch(url, options);
          if (!res.ok) throw new Error("Delete failed");
          showToast(t.successMsg, 'success');
          fetchCategories();
        } catch (error) {
          showToast(error.message, 'error');
        }
      }
    });
  };

  const triggerImageUpdate = (categoryId, subcategoryId = null) => {
    setUpdateTarget({ categoryId, subcategoryId });
    if (fileUpdateRef.current) {
      fileUpdateRef.current.click();
    }
  };

  const handleProcessImageUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file || !updateTarget.categoryId) return;

    const payload = new FormData();
    if (updateTarget.subcategoryId) {
      payload.append('target_subcategory_id', updateTarget.subcategoryId);
      payload.append('subcategory_image', file);
    } else {
      payload.append('category_image', file);
    }
    payload.append('lang_preference', lang);

    try {
      const res = await authenticatedFetch(`/update-category/${updateTarget.categoryId}/`, {
        method: 'PUT',
        body: payload
      });
      if (!res.ok) throw new Error("Update failed");
      showToast(t.successMsg, 'success');
      fetchCategories();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      e.target.value = null;
      setUpdateTarget({ categoryId: null, subcategoryId: null });
    }
  };

  const totalSubcategories = allCategories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);

  return (
    <>
      <style>{styles}</style>
      <div className="layout-wrapper">
        <input type="file" ref={fileUpdateRef} onChange={handleProcessImageUpdate} style={{ display: 'none' }} accept="image/*" />


        <main className="main-content">
          <div className="container">
            {/* Header */}
            <header className="page-header">
              <div className="header-left">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft size={18} /> {t.back}
                </button>
                <div className="title-wrapper">
                  <div className="title-icon"><FolderOpen size={28} /></div>
                  <div>
                    <h1>{t.title}</h1>
                    <p className="subtitle">{t.subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="header-stats">
                <div className="stat-card glass-card">
                  <span className="stat-value">{allCategories.length}</span>
                  <span className="stat-label">{t.totalCategories}</span>
                </div>
                <div className="stat-card glass-card">
                  <span className="stat-value">{totalSubcategories}</span>
                  <span className="stat-label">{t.totalSubcategories}</span>
                </div>
              </div>
            </header>

            {/* Search Component */}
            <section className="search-section" ref={searchContainerRef}>
              <div className={`search-bar ${isSearching || searchResults.length > 0 ? 'active' : ''}`}>
                <Search className="search-icon" size={22} />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="search-input"
                />
                {isSearching && <Loader2 className="spinner" size={20} />}
                {searchQuery && !isSearching && (
                  <button className="btn-clear" onClick={() => setSearchQuery('')}><X size={18}/></button>
                )}
              </div>

              <AnimatePresence>
                {searchQuery.trim() && (searchResults.length > 0 || !isSearching) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="search-dropdown glass-card"
                  >
                    {searchResults.length > 0 ? (
                      <div className="search-results-list">
                        {searchResults.map((result, index) => {
                          const displayName = result.name || result.category_name || result.subcategory_name || 'Unnamed';
                          const isFocused = index === focusedIndex;

                          return (
                            <div
                              key={result._id || index}
                              className={`search-result-item ${isFocused ? 'focused' : ''}`}
                              onMouseEnter={() => setFocusedIndex(index)}
                            >
                              <div className="search-result-img">
                                {result.image_path ? (
                                  <img src={getImageUrl(result.image_path)} alt={displayName} />
                                ) : (
                                  <ImageIcon size={20} className="text-muted" />
                                )}
                              </div>
                              <div className="search-result-info">
                                <span className="search-result-name">{displayName}</span>
                                <span className={`badge ${result.type === 'category' ? 'badge-blue' : 'badge-purple'}`}>
                                  {result.type || 'Item'}
                                </span>
                              </div>
                              <div className="search-result-action">
                                <ArrowLeft size={16} className="enter-icon" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="no-results">
                        <Search size={32} className="text-muted mb-2" />
                        <p>{t.noSearchResults}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Form Section */}
            <section className="form-section glass-card">
              <h3>{t.addCategory}</h3>
              <form onSubmit={handleCreateCategory}>
                <div className="form-grid">
                  <div className="input-group">
                    <input type="text" name="category_name" id="category_name" className="floating-input" placeholder=" " value={formData.category_name} onChange={handleTextChange} required />
                    <label htmlFor="category_name" className="floating-label">{t.catName}</label>
                  </div>
                  <div className="input-group">
                    <input type="text" name="subcategory_name" id="subcategory_name" className="floating-input" placeholder=" " value={formData.subcategory_name} onChange={handleTextChange} required />
                    <label htmlFor="subcategory_name" className="floating-label">{t.subName}</label>
                  </div>
                </div>

                <div className="form-grid upload-grid">
                  <FileUploadZone label={t.catImage} icon={ImageIcon} accept="image/*" file={files.category_image} onChange={(e) => handleFileChange(e, 'category_image')} />
                  <FileUploadZone label={t.subImage} icon={UploadCloud} accept="image/*" file={files.subcategory_image} onChange={(e) => handleFileChange(e, 'subcategory_image')} />
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? <Loader2 className="spinner" size={18} /> : <><Plus size={18} /> {t.save}</>}
                  </button>
                </div>
              </form>
            </section>

            {/* Category Display Section */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="skeletons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {[1, 2].map(i => <SkeletonLoader key={i} />)}
                </motion.div>
              ) : allCategories.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="empty-state glass-card">
                  <div className="empty-icon-wrapper"><FolderOpen size={48} /></div>
                  <h3>{t.noData}</h3>
                  <p>{t.noDataSub}</p>
                </motion.div>
              ) : (
                <motion.div key="grid" className="category-list">
                  {allCategories.map((cat, index) => (
                    <motion.div
                      key={cat.id || index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.1, 0.5) }}
                      className="category-card glass-card"
                    >
                      <div className="category-header">
                        <div className="category-info">
                          <div className="category-avatar">
                             {cat.image_path ? <img src={getImageUrl(cat.image_path)} alt={cat.category_name} loading="lazy" /> : <ImageIcon size={28} className="text-muted" />}
                          </div>
                          <div>
                            <h2>{cat.category_name}</h2>
                            <span className="badge badge-blue">{cat.subcategories?.length || 0} Subcategories</span>
                          </div>
                        </div>
                        <div className="action-buttons">
                          <button onClick={() => triggerImageUpdate(cat.id)} className="btn-icon btn-edit" title={t.updateImage}><Edit size={18} /></button>
                          <button onClick={() => confirmDelete('category', cat.id)} className="btn-icon btn-delete" title="Delete Category"><Trash2 size={18} /></button>
                        </div>
                      </div>

                      <div className="subcategory-grid">
                        {cat.subcategories?.map((sub, idx) => (
                          <motion.div
                            key={sub.id || idx}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="subcategory-card"
                          >
                            <div className="sub-actions">
                              <button onClick={() => triggerImageUpdate(cat.id, sub.id)} className="btn-icon-small edit"><Edit size={14} /></button>
                              <button onClick={() => confirmDelete('subcategory', cat.id, sub.id)} className="btn-icon-small delete"><Trash2 size={14} /></button>
                            </div>
                            <div className="sub-avatar">
                              {sub.image_path ? <img src={getImageUrl(sub.image_path)} alt={sub.name} loading="lazy" /> : <ImageIcon size={24} className="text-muted" />}
                            </div>
                            <span className="sub-name">{sub.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Modals */}
        <Modal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
          title={modalConfig.title}
          type={modalConfig.type}
          icon={modalConfig.type === 'danger' ? AlertTriangle : Info}
        >
          <p className="modal-text">{modalConfig.message}</p>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}>{t.cancel}</button>
            <button className={`btn-primary ${modalConfig.type === 'danger' ? 'btn-danger' : ''}`} onClick={modalConfig.onConfirm}>{t.confirm}</button>
          </div>
        </Modal>

        {/* Toasts */}
        <div className="toast-container">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`toast-item ${toast.type}`}
              >
                {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                <span className="toast-msg">{toast.message}</span>
                <button className="toast-close" onClick={() => removeToast(toast.id)}><X size={14}/></button>
                <motion.div
                  className="toast-progress"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Scroll to Top */}
        <button className="btn-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ChevronUp size={24} />
        </button>

      </div>
      <Footer />
    </>
  );
};

// --- INJECTED CSS ---
const styles = `
  :root {
    --primary: #dc2626;
    --primary-hover: #b91c1c;
    --success: #10B981;
    --danger: #EF4444;
    --danger-bg: #FEF2F2;
    --bg-color: #F8FAFC;
    --card-bg: rgba(255, 255, 255, 0.7);
    --card-border: rgba(255, 255, 255, 0.5);
    --text-main: #0F172A;
    --text-muted: #64748B;
    --border: #E2E8F0;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    --shadow-lg: 0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 10px -4px rgb(0 0 0 / 0.05);
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --glass-blur: blur(12px);
  }

  .layout-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: linear-gradient(140deg, #F8FAFC 0%, #EEF2FF 100%);
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--text-main);
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    scroll-behavior: smooth;
  }

  .container { max-width: 1200px; margin: 0 auto; width: 100%; }

  .glass-card {
    background: var(--card-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--card-border);
    box-shadow: var(--shadow-md);
  }

  .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1.5rem; }
  .header-left { display: flex; flex-direction: column; gap: 1.5rem; }
  
  .btn-back { display: inline-flex; align-items: center; gap: 0.5rem; background: #fff; border: 1px solid var(--border); padding: 0.5rem 1rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s; width: fit-content; box-shadow: var(--shadow-sm); }
  .btn-back:hover { background: #f1f5f9; transform: translateX(-4px); }

  .title-wrapper { display: flex; align-items: center; gap: 1.25rem; }
  .title-icon { background: linear-gradient(135deg, var(--primary), #f87171); color: white; padding: 0.8rem; border-radius: var(--radius-md); box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3); }
  
  /* FIXED: Scoped the h1 so it does not destroy Navbar styling */
  .title-wrapper h1 { font-size: 2.2rem; font-weight: 800; margin: 0 0 0.25rem 0; letter-spacing: -0.02em; background: linear-gradient(to right, #0F172A, #334155); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .subtitle { color: var(--text-muted); margin: 0; font-size: 1rem; }

  .header-stats { display: flex; gap: 1rem; }
  .stat-card { padding: 1.25rem 1.5rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; min-width: 150px; border-top: 2px solid var(--primary); }
  .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--primary); }
  .stat-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.25rem; }

  .search-section { position: relative; margin-bottom: 3rem; z-index: 50; }
  .search-bar { display: flex; align-items: center; background: #fff; border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; border: 1px solid var(--border); box-shadow: var(--shadow-md); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .search-bar.active, .search-bar:focus-within { box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15), var(--shadow-lg); border-color: var(--primary); transform: translateY(-2px); }
  .search-icon { color: var(--text-muted); margin-right: 1rem; transition: color 0.3s; }
  .search-bar:focus-within .search-icon { color: var(--primary); }
  .search-input { border: none; outline: none; width: 100%; font-size: 1.1rem; color: var(--text-main); background: transparent; }
  .btn-clear { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; border-radius: 50%; display: flex; }
  .btn-clear:hover { background: #f1f5f9; color: var(--text-main); }

  .search-dropdown { position: absolute; top: calc(100% + 0.75rem); left: 0; right: 0; border-radius: var(--radius-lg); padding: 0.5rem; max-height: 400px; overflow-y: auto; z-index: 100; }
  .search-results-list { display: flex; flex-direction: column; gap: 0.25rem; }
  .search-result-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: var(--radius-md); transition: all 0.2s; cursor: pointer; position: relative; }
  .search-result-item:hover, .search-result-item.focused { background: rgba(220, 38, 38, 0.08); }
  
  .search-result-img { width: 50px; height: 50px; border-radius: 12px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
  .search-result-img img { width: 100%; height: 100%; object-fit: cover; }
  .search-result-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
  .search-result-name { font-weight: 600; font-size: 1.05rem; }
  .search-result-action { opacity: 0; transform: translateX(-10px); transition: all 0.2s; color: var(--primary); }
  .search-result-item:hover .search-result-action, .search-result-item.focused .search-result-action { opacity: 1; transform: translateX(0); }
  
  .no-results { padding: 3rem; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; }

  .form-section { padding: 2.5rem; border-radius: var(--radius-xl); margin-bottom: 3rem; }
  /* FIXED: Scoped the h3 */
  .form-section h3 { margin-top: 0; margin-bottom: 2rem; font-size: 1.25rem; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
  
  .input-group { position: relative; }
  .floating-input { width: 100%; padding: 1.25rem 1rem 0.75rem; border-radius: var(--radius-md); border: 2px solid var(--border); font-size: 1rem; background: rgba(255,255,255,0.8); outline: none; transition: all 0.2s; box-sizing: border-box; }
  .floating-input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1); }
  .floating-label { position: absolute; left: 1rem; top: 1rem; color: var(--text-muted); font-size: 1rem; transition: all 0.2s ease-out; pointer-events: none; background: transparent; padding: 0 0.25rem; }
  .floating-input:focus ~ .floating-label, .floating-input:not(:placeholder-shown) ~ .floating-label { top: -0.6rem; left: 0.8rem; font-size: 0.8rem; color: var(--primary); font-weight: 600; background: #fff; border-radius: 4px; }

  .upload-zone { border: 2px dashed var(--border); padding: 2rem; text-align: center; border-radius: var(--radius-md); background: rgba(255,255,255,0.5); position: relative; overflow: hidden; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 140px; }
  .upload-zone.dragging { border-color: var(--primary); background: rgba(220, 38, 38, 0.05); transform: scale(1.02); }
  .upload-zone:hover:not(.has-file) { border-color: var(--primary); background: #fff; }
  .upload-icon { color: var(--text-muted); margin-bottom: 0.75rem; transition: transform 0.3s; }
  .upload-zone:hover .upload-icon { transform: translateY(-5px); color: var(--primary); }
  .upload-label { font-weight: 600; margin: 0 0 0.25rem 0; }
  .upload-subtext { font-size: 0.8rem; color: var(--text-muted); }
  .upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  
  .upload-preview { position: absolute; inset: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  .preview-img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.4); }
  .preview-overlay { position: absolute; z-index: 10; display: flex; flex-direction: column; align-items: center; color: white; }
  .file-name { margin-top: 0.5rem; font-size: 0.9rem; font-weight: 600; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }

  .form-actions { display: flex; justify-content: flex-end; margin-top: 2.5rem; }
  .btn-primary { background: linear-gradient(135deg, var(--primary), #f87171); color: white; border: none; padding: 0.875rem 2rem; border-radius: var(--radius-md); font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .btn-danger { background: linear-gradient(135deg, var(--danger), #F87171); box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4); }
  .btn-danger:hover { box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3); }
  .btn-secondary { background: #f1f5f9; color: var(--text-main); border: 1px solid var(--border); padding: 0.875rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-secondary:hover { background: #e2e8f0; }

  .category-list { display: flex; flex-direction: column; gap: 2rem; }
  .category-card { border-radius: var(--radius-xl); padding: 2rem; }
  .category-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
  .category-info { display: flex; align-items: center; gap: 1.25rem; }
  .category-avatar { width: 72px; height: 72px; border-radius: var(--radius-md); background: #fff; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
  .category-avatar img { width: 100%; height: 100%; object-fit: cover; }
  /* FIXED: Scoped the h2 */
  .category-info h2 { margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 700; text-transform: capitalize; }
  
  .badge { font-size: 0.75rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-weight: 700; display: inline-block; }
  .badge-blue { background: #EFF6FF; color: #3B82F6; border: 1px solid #DBEAFE; }
  .badge-purple { background: #F5F3FF; color: #8B5CF6; border: 1px solid #EDE9FE; }

  .action-buttons { display: flex; gap: 0.75rem; }
  .btn-icon { border: none; padding: 0.75rem; border-radius: var(--radius-md); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: var(--shadow-sm); }
  .btn-edit { background: #fff; color: #3B82F6; border: 1px solid #DBEAFE; }
  .btn-edit:hover { background: #EFF6FF; transform: translateY(-2px); }
  .btn-delete { background: #fff; color: var(--danger); border: 1px solid #FEE2E2; }
  .btn-delete:hover { background: var(--danger-bg); transform: translateY(-2px); }

  .subcategory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem; }
  .subcategory-card { background: #fff; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; box-shadow: var(--shadow-sm); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .subcategory-card:hover { box-shadow: var(--shadow-lg); border-color: #DBEAFE; }
  
  .sub-actions { position: absolute; top: 0.75rem; right: 0.75rem; display: flex; gap: 0.5rem; opacity: 0; transform: translateY(-5px); transition: all 0.2s; }
  .subcategory-card:hover .sub-actions { opacity: 1; transform: translateY(0); }
  .btn-icon-small { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 0.4rem; cursor: pointer; display: flex; box-shadow: var(--shadow-sm); transition: all 0.2s; }
  .btn-icon-small:hover { transform: scale(1.1); }
  .btn-icon-small.edit { color: #3B82F6; }
  .btn-icon-small.delete { color: var(--danger); }

  .sub-avatar { width: 80px; height: 80px; border-radius: 50%; background: #f8fafc; overflow: hidden; margin-bottom: 1rem; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; transition: transform 0.3s; }
  .subcategory-card:hover .sub-avatar { transform: scale(1.05); }
  .sub-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .sub-name { font-weight: 600; color: var(--text-main); font-size: 1rem; text-transform: capitalize; }

  .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
  .modal-content { background: #fff; width: 100%; max-width: 450px; border-radius: var(--radius-xl); padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); position: relative; }
  .modal-header { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 1rem; position: relative; }
  .modal-icon-wrapper { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
  .modal-icon-wrapper.danger { background: #FEE2E2; color: var(--danger); }
  .modal-icon-wrapper.default { background: #EFF6FF; color: var(--primary); }
  
  /* FIXED: Scoped the h3 */
  .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; }
  .btn-close { position: absolute; top: -1rem; right: -1rem; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background 0.2s; }
  .btn-close:hover { background: #f1f5f9; color: var(--text-main); }
  .modal-body { text-align: center; }
  .modal-text { color: var(--text-muted); margin-bottom: 2rem; line-height: 1.5; }
  .modal-actions { display: flex; gap: 1rem; justify-content: center; }
  .modal-actions button { flex: 1; justify-content: center; }

  .toast-container { position: fixed; bottom: 2rem; right: 2rem; display: flex; flex-direction: column; gap: 0.75rem; z-index: 9999; pointer-events: none; }
  .toast-item { pointer-events: auto; background: #fff; padding: 1rem 1.25rem; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-left: 4px solid; position: relative; overflow: hidden; min-width: 300px; }
  .toast-item.success { border-color: var(--success); color: var(--text-main); }
  .toast-item.success svg { color: var(--success); }
  .toast-item.error { border-color: var(--danger); color: var(--text-main); }
  .toast-item.error svg { color: var(--danger); }
  .toast-msg { font-weight: 600; font-size: 0.95rem; flex: 1; }
  .toast-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.2rem; border-radius: 4px; }
  .toast-close:hover { background: #f1f5f9; }
  .toast-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: rgba(0,0,0,0.1); }

  .spinner { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .shimmer { background: #f6f7f8; background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%); background-repeat: no-repeat; background-size: 800px 100%; animation-duration: 1.5s; animation-fill-mode: forwards; animation-iteration-count: infinite; animation-name: placeholderShimmer; animation-timing-function: linear; }
  @keyframes placeholderShimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }

  .skeleton-card { padding: 2rem; border-radius: var(--radius-xl); margin-bottom: 2rem; }
  .skeleton-header { display: flex; align-items: center; gap: 1.25rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
  .skeleton-avatar { width: 72px; height: 72px; border-radius: var(--radius-md); }
  .skeleton-title { width: 250px; height: 32px; border-radius: 8px; }
  .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem; }
  .skeleton-sub { height: 180px; border-radius: var(--radius-lg); }

  .empty-state { text-align: center; padding: 5rem 2rem; border-radius: var(--radius-xl); border: 2px dashed var(--border); }
  .empty-icon-wrapper { width: 96px; height: 96px; background: #EEF2FF; color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: inset 0 0 0 8px rgba(255,255,255,0.5); }
  
  /* FIXED: Scoped these as well */
  .empty-state h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  .empty-state p { color: var(--text-muted); font-size: 1.1rem; }

  .btn-scroll-top { position: fixed; bottom: 2rem; right: 2rem; background: var(--text-main); color: white; width: 48px; height: 48px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-lg); transition: all 0.2s; z-index: 90; }
  .btn-scroll-top:hover { transform: translateY(-5px); background: var(--primary); }

  @media (max-width: 1024px) {
    .subcategory-grid, .skeleton-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 768px) {
    .main-content { padding: 1.5rem 1rem; }
    .form-grid { grid-template-columns: 1fr; gap: 1rem; }
    .header-stats { display: none; }
    .subcategory-grid, .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
    .glass-card { padding: 1.5rem; }
    .title-wrapper h1 { font-size: 1.75rem; }
    .category-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
    .action-buttons { width: 100%; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--border); }
  }
  @media (max-width: 480px) {
    .subcategory-grid, .skeleton-grid { grid-template-columns: 1fr; }
    .toast-container { right: 1rem; left: 1rem; bottom: 1rem; }
    .toast-item { min-width: auto; width: 100%; }
    .modal-actions { flex-direction: column; }
  }
`;

export default CategoryOp;
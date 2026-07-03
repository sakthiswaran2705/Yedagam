import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  FileText, CheckCircle, Clock, Search, Plus, Trash2, Edit, X, Image as ImageIcon,
  UploadCloud, Film, Tag, AlertCircle, Loader2, RefreshCw, Bell, Trash, XCircle, CheckCircle2
} from 'lucide-react';
import Footer from "./Footer.jsx";
import { authenticatedFetch } from './authFetch';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// --- TRANSLATIONS ---
const translations = {
  en: {
    title: "🚀 Blog Management",
    subtitle: "Create, review, and manage your enterprise blog content",
    totalBlogs: "Total Blogs",
    published: "Published",
    pending: "Pending",
    drafts: "Drafts",
    createBlog: "Create New Blog Post",
    updateBlog: "Update Blog Post",
    blogTitle: "Blog Title",
    content: "Content ",
    author: "Author Name",
    category: "Category",
    subcategory: "Subcategory",
    keywords: "Keywords",
    coverImage: "Drag & Drop Cover Image",
    featuredVideo: "Upload Featured Video (Optional)",
    unifiedMedia: "Drag & Drop Multi-Media (Images & Videos together)",
    existingMediaLabel: "Previously Uploaded Media",
    publishBtn: "Publish Blog Post",
    updateBtn: "Update Blog Post",
    search: "Search blogs...",
    allStatus: "All Status",
    noBlogs: "No Blog Posts Found",
    noBlogsSub: "Create your first blog post using the form.",
    editingBanner: "You are currently updating an existing post.",
    processing: "Please Wait...",
    uploadingMedia: "Uploading Media...",
    translating: "Translating & Saving...",
    deleteConfirm: "Delete Blog? This action cannot be undone.",
    notifications: "Notifications",
    noNotifications: "No new notifications",
    loadingMore: "Loading more blogs...",
    success: "Success!",
    error: "Error!",
    closeBtn: "Close"
  },
  ta: {
    title: "🚀 வலைப்பதிவு மேலாண்மை",
    subtitle: "வலைப்பதிவு உள்ளடக்கத்தை உருவாக்கவும், மதிப்பாய்வு செய்யவும் மற்றும் நிர்வகிக்கவும்",
    totalBlogs: "மொத்த வலைப்பதிவுகள்",
    published: "வெளியிடப்பட்டது",
    pending: "நிலுவையில் உள்ளது",
    drafts: "வரைவுகள்",
    createBlog: "புதிய வலைப்பதிவு இடுகையை உருவாக்கு",
    updateBlog: "வலைப்பதிவு இடுகையை புதுப்பி",
    blogTitle: "தலைப்பு",
    content: "உள்ளடக்கம்",
    author: "ஆசிரியரின் பெயர்",
    category: "வகை",
    subcategory: "துணை வகை",
    keywords: "முக்கிய வார்த்தைகள்",
    coverImage: "முகப்புப் படத்தை பதிவேற்றவும்",
    featuredVideo: "சிறப்பு வீடியோ (விரும்பினால்)",
    unifiedMedia: "மல்டி-மீடியாவை பதிவேற்றவும் (படங்கள் & வீடியோக்கள்)",
    existingMediaLabel: "முன்பு பதிவேற்றிய மீடியா",
    publishBtn: "இடுகையை வெளியிடு",
    updateBtn: "புதுப்பிக்கவும்",
    search: "தேடு...",
    allStatus: "அனைத்தும்",
    noBlogs: "வலைப்பதிவு இடுகைகள் எதுவும் இல்லை",
    noBlogsSub: "படிவத்தைப் பயன்படுத்தி முதல் இடுகையை உருவாக்கவும்.",
    editingBanner: "நீங்கள் தற்போது ஒரு இடுகையைப் புதுப்பிக்கிறீர்கள்.",
    processing: "காத்திருக்கவும்...",
    uploadingMedia: "மீடியா பதிவேற்றப்படுகிறது...",
    translating: "மொழிபெயர்க்கப்படுகிறது...",
    deleteConfirm: "வலைப்பதிவை நீக்க வேண்டுமா? இந்தச் செயலை செயல்தவிர்க்க முடியாது.",
    notifications: "அறிவிப்புகள்",
    noNotifications: "புதிய அறிவிப்புகள் இல்லை",
    loadingMore: "மேலும் வலைப்பதிவுகளை ஏற்றுகிறது...",
    success: "வெற்றி!",
    error: "பிழை!",
    closeBtn: "மூடு"
  }
};

// --- UTILITIES ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const getImageUrl = (path) => {
  if (!path) return null;
  const cleanPath = path.replace(/\\/g, '/').replace(/^\//, '');
  return `${API_BASE_URL}/${cleanPath}`;
};

// --- COMPONENTS ---

// 1. Tag Input Component
const TagInput = ({ tags, setTags, placeholder }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = input.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

  return (
    <div className="tag-input-container">
      <div className="tags-wrapper">
        <AnimatePresence>
          {tags.map(tag => (
            <motion.span key={tag} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="tag-pill">
              <Tag size={12} /> {tag}
              <button type="button" onClick={() => removeTag(tag)}><X size={14} /></button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={tags.length === 0 ? "Type & press Enter" : ""} className="tag-input-field" />
      </div>
    </div>
  );
};

// 2. Autocomplete Input Component
const Autocomplete = ({ label, value, onChange, disabled, lang, type = 'category', parentCategory = '' }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const wrapperRef = useRef(null);

  useEffect(() => { if (value !== query) setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!isOpen || !debouncedQuery || disabled || debouncedQuery.trim().length < 1) { setResults([]); return; }

    const fetchItems = async () => {
      setLoading(true);
      try {
        const endpoint = type === 'subcategory'
          ? `/subcategory/search/?subcategory=${encodeURIComponent(debouncedQuery.trim())}&lang=${lang}`
          : `/category/search/?category=${encodeURIComponent(debouncedQuery.trim())}&lang=${lang}`;

        const res = await authenticatedFetch(endpoint);
        if (isMounted) {
          let fetchedData = [];
          if (res && typeof res.json === 'function') {
             const parsed = await res.json();
             fetchedData = parsed.data || parsed || [];
          } else if (res && Array.isArray(res.data)) { fetchedData = res.data; }
          else if (Array.isArray(res)) { fetchedData = res; }

          if (type === 'subcategory' && parentCategory) {
            fetchedData = fetchedData.filter(item => {
              const itemParent = (item.parent_category || '').trim().toLowerCase();
              const selectedParent = (parentCategory || '').trim().toLowerCase();
              return itemParent === selectedParent;
            });
          }
          setResults(fetchedData);
        }
      } catch (error) {
        console.error(`[Autocomplete] Error fetching ${type}:`, error);
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();
    return () => { isMounted = false; };
  }, [debouncedQuery, disabled, lang, type, parentCategory, isOpen]);

  return (
    <div className={`input-group ${disabled ? 'disabled' : ''}`} ref={wrapperRef}>
      <input type="text" className="floating-input" placeholder=" " value={query} disabled={disabled}
        onChange={(e) => { const val = e.target.value; setQuery(val); onChange(val); setIsOpen(true); }}
        onFocus={() => { if (query && query.trim().length > 0) setIsOpen(true); }}
      />
      <label className="floating-label">{label}</label>
      <AnimatePresence>
        {isOpen && query && query.trim().length > 0 && !disabled && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="autocomplete-dropdown">
            {loading ? <div className="dropdown-loading"><Loader2 className="spinner" size={18} /></div> : results.length > 0 ? (
              results.map((r, i) => {
                const displayName = type === 'subcategory' ? r.subcategory_name : r.category_name;
                return (
                  <div key={i} className="dropdown-item" onClick={() => { onChange(displayName); setQuery(displayName); setIsOpen(false); }}>
                    <div className="dropdown-item-content">
                      {r.image_path && <img src={getImageUrl(r.image_path)} alt="" className="dropdown-img" />}
                      <span>{displayName}</span>
                    </div>
                    {type === 'subcategory' && r.parent_category && <span className="dropdown-parent-badge">{r.parent_category}</span>}
                  </div>
                );
              })
            ) : <div className="dropdown-empty">No results</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 3. Main Dashboard Component
const BlogAdminPanel = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang] || translations['en'];

  // --- BLOG INFINITE SCROLL STATES ---
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  // --- NOTIFICATION STATES ---
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [form, setForm] = useState({ title: '', content: '', author: '', category: '', subcategory: '' });
  const [keywords, setKeywords] = useState([]);
  const [files, setFiles] = useState({ cover: null, video: null, media: [] });
  const [previewUrls, setPreviewUrls] = useState({ cover: null, video: null }); // Added for Image/Video Preview
  const [existingMedia, setExistingMedia] = useState([]);
  const [deletedMedia, setDeletedMedia] = useState([]);

  // --- CUSTOM POPUP MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState({ isSuccess: true, title: '', message: '' });

  // --- FETCH NOTIFICATIONS ---
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await authenticatedFetch(`/notification/?lang=${lang}`);
      let fetchedNotifs = [];
      if (res && typeof res.json === 'function') {
        const parsed = await res.json();
        fetchedNotifs = parsed.data || parsed || [];
      } else if (res && Array.isArray(res.data)) { fetchedNotifs = res.data; }
      else if (Array.isArray(res)) { fetchedNotifs = res; }
      setNotifications(fetchedNotifs);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [lang]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- DELETE NOTIFICATION ---
  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation(); // Prevent dropdown from closing
    try {
      const res = await authenticatedFetch(`/notification/${id}/`, { method: 'DELETE' });
      if (res) {
        setNotifications(prev => prev.filter(n => (n.notification_id || n._id || n.id) !== id));
        toast.success(lang === 'ta' ? "அறிவிப்பு நீக்கப்பட்டது" : "Notification deleted");
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  // --- FETCH BLOGS WITH PAGINATION ---
  const fetchBlogs = useCallback(async (pageNum = 1, isReset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await authenticatedFetch(`/blog/all/?lang=${lang}&page=${pageNum}&limit=10`);

      let fetchedBlogs = [];
      if (res && typeof res.json === 'function') {
         const parsed = await res.json();
         fetchedBlogs = parsed.data || parsed || [];
      } else if (res && Array.isArray(res.data)) { fetchedBlogs = res.data; }
      else if (Array.isArray(res)) { fetchedBlogs = res; }

      if (fetchedBlogs.length === 0 || fetchedBlogs.length < 10) setHasMore(false);

      setBlogs(prev => isReset ? fetchedBlogs : [...prev, ...fetchedBlogs]);
    } catch (error) {
      console.error("[Dashboard] Failed to fetch blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lang]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchBlogs(1, true);
  }, [fetchBlogs, lang]);

  // --- INFINITE SCROLL OBSERVER ---
  const lastBlogElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPg = page + 1;
        setPage(nextPg);
        fetchBlogs(nextPg, false);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, page, fetchBlogs]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'content') {
      e.target.style.height = 'inherit';
      e.target.style.height = `${Math.max(e.target.scrollHeight, 120)}px`;
    }
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles.length) return;
    if (type === 'media') {
      setFiles(prev => ({ ...prev, media: [...prev.media, ...Array.from(selectedFiles)] }));
    } else {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, [type]: file }));
      setPreviewUrls(prev => ({ ...prev, [type]: URL.createObjectURL(file) })); // Set preview URL
    }
  };

  const resetForm = () => {
    setForm({ title: '', content: '', author: '', category: '', subcategory: '' });
    setKeywords([]);
    setFiles({ cover: null, video: null, media: [] });
    setPreviewUrls({ cover: null, video: null }); // Reset Previews
    setExistingMedia([]);
    setDeletedMedia([]);
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (blog) => {
    setIsEditing(true);
    setEditId(blog.id || blog._id);
    setForm({
      title: blog.title || '',
      content: blog.content || '',
      author: blog.author || '',
      category: blog.category?.name || blog.category || '',
      subcategory: blog.subcategory?.name || blog.subcategory || ''
    });
    setKeywords(blog.keywords || []);
    setExistingMedia(blog.media || []);
    setDeletedMedia([]);
    setPreviewUrls({ cover: null, video: null }); // Clear local previews on edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteExistingMedia = (mediaPath, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExistingMedia(prev => prev.filter(item => item.path !== mediaPath));
    setDeletedMedia(prev => [...prev, mediaPath]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    const loadingToast = toast.loading("Deleting blog...");
    try {
      await authenticatedFetch(`/remove_blog/${id}`, { method: 'DELETE' });
      toast.success("Blog Deleted Successfully", { id: loadingToast });
      setBlogs(prev => prev.filter(b => (b.id || b._id) !== id));
      if (editId === id) resetForm();
    } catch (error) {
      toast.error("Failed to delete blog", { id: loadingToast });
    }
  };

  const handleStatusChange = async (id) => {
    if (!id) return;
    const loadingToast = toast.loading("Updating status...");
    try {
      const res = await authenticatedFetch(`/status/changer/${id}/`, { method: "POST" });
      let parsedRes = res;
      if (res && typeof res.json === 'function') parsedRes = await res.json();

      const newStatus = parsedRes?.status || "pending";
      const successMessage = newStatus === "published"
        ? (lang === "ta" ? "வலைப்பதிவு வெற்றிகரமாக வெளியிடப்பட்டது" : "Blog published successfully")
        : (lang === "ta" ? "வலைப்பதிவு நிலுவை நிலைக்கு மாற்றப்பட்டது" : "Blog moved to pending status");

      toast.success(successMessage, { id: loadingToast });
      setBlogs(prev => prev.map(b => (b.id || b._id) === id ? { ...b, status: newStatus } : b));
    } catch (error) {
      toast.error(lang === "ta" ? "நிலைமாற்றம் தோல்வி அடைந்தது" : "Failed to update status", { id: loadingToast });
    }
  };

  // --- SUBMIT HANDLER WITH MODAL POPUP ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessStep(t.uploadingMedia);

    try {
      const payload = new FormData();
      if (isEditing) {
        payload.append('title_en', form.title);
        payload.append('content_en', form.content);
        payload.append('lang_preference', lang);
        if (deletedMedia.length > 0) payload.append("deleted_media", JSON.stringify(deletedMedia));
      } else {
        payload.append('title', form.title);
        payload.append('content', form.content);
      }

      payload.append('author', form.author);
      if (form.category) payload.append('category', form.category);
      if (form.subcategory) payload.append('subcategory', form.subcategory);
      if (keywords.length) payload.append('keywords', keywords.join(','));
      if (files.cover) payload.append('image_file', files.cover);
      if (files.video) payload.append('video_file', files.video);
      if (files.media && files.media.length > 0) {
        files.media.forEach(file => payload.append('media', file));
      }

      setProcessStep(t.translating);
      const url = isEditing ? `/replace_blog/${editId}/` : '/blog/post/';

      const response = await authenticatedFetch(url, { method: isEditing ? 'PUT' : 'POST', body: payload });

      // Assume error if fetch threw or response had bad status (handled by fetch wrapper usually)

      // SHOW SUCCESS MODAL
      setModalStatus({
        isSuccess: true,
        title: t.success,
        message: isEditing
            ? (lang === 'ta' ? "வலைப்பதிவு வெற்றிகரமாக புதுப்பிக்கப்பட்டது" : "Blog Post Updated Successfully")
            : (lang === 'ta' ? "வலைப்பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது" : "Blog Post Submitted Successfully")
      });
      setIsModalOpen(true);

      resetForm();
      setPage(1); // Reset page to refresh from top
      fetchBlogs(1, true);

    } catch (error) {
      // SHOW ERROR MODAL
      setModalStatus({
        isSuccess: false,
        title: t.error,
        message: error.message || "Failed to submit blog post. Please check the network and try again."
      });
      setIsModalOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- FILTER LOGIC ---
  const filteredBlogs = blogs.filter(blog => {
    const searchMatch = (blog.title || "").toLowerCase().includes(searchFilter.toLowerCase());
    const currentStatus = (blog.status || "pending").toLowerCase().trim();
    const selectedStatus = (statusFilter || "All").toLowerCase().trim();
    const statusMatch = selectedStatus === "all" || currentStatus === selectedStatus;
    return searchMatch && statusMatch;
  });

  // --- STATS CALCULATION ---
  const stats = {
    total: blogs.length,
    published: blogs.filter(b => (b.status || "").toLowerCase().trim() === "published").length,
    pending: blogs.filter(b => (b.status || "pending").toLowerCase().trim() === "pending").length,
  };

  return (
    <>
      <Toaster position="top-right" />
      <style>{cssStyles}</style>

      {/* --- CUSTOM POPUP MODAL START --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="custom-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="custom-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>

              <div className={`modal-icon-container ${modalStatus.isSuccess ? 'success' : 'error'}`}>
                {modalStatus.isSuccess ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
              </div>

              <h2 className="modal-title">
                {modalStatus.title}
              </h2>

              <p className="modal-desc">
                {modalStatus.message}
              </p>

              <button
                className={`modal-action-btn ${modalStatus.isSuccess ? 'success' : 'error'}`}
                onClick={() => setIsModalOpen(false)}
              >
                {t.closeBtn}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* --- CUSTOM POPUP MODAL END --- */}

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

          <div className="header-actions">
            {/* NOTIFICATION COMPONENT */}
            <div className="notification-wrapper" ref={notifRef}>
              <button
                className="btn-icon bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title={t.notifications}
              >
                <Bell size={22} className={notifications.length > 0 ? 'text-primary' : 'text-muted'} />
                {notifications.length > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="notif-badge">
                    {notifications.length}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="notif-dropdown glass-panel"
                  >
                    <div className="notif-header">
                      <h3>{t.notifications}</h3>
                      {notifications.length > 0 && <span className="notif-count">{notifications.length}</span>}
                    </div>

                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">
                          <Bell size={32} className="text-muted" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                          <p>{t.noNotifications}</p>
                        </div>
                      ) : (
                        notifications.map((n, i) => {
                          const notifId = n.notification_id || n._id || n.id;
                          return (
                            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 20 }} key={notifId || i} className="notif-item">
                              <div className="notif-icon-wrap">
                                {n.notif_type === 'alert' ? <AlertCircle size={16} className="text-amber" /> : <CheckCircle size={16} className="text-green" />}
                              </div>
                              <div className="notif-content">
                                <strong>{n.title || 'Notification'}</strong>
                                <p>{n.message}</p>
                                <span className="notif-time">{n.created_at ? new Date(n.created_at).toLocaleString() : 'Just now'}</span>
                              </div>
                              <button className="notif-delete-btn" onClick={(e) => handleDeleteNotification(notifId, e)} title="Delete">
                                <Trash size={14} />
                              </button>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Stats row */}
        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card gradient-blue">
            <FileText size={24} /><div><h3>{stats.total}</h3><p>{t.totalBlogs}</p></div>
          </div>
          <div className="stat-card gradient-green">
            <CheckCircle size={24} /><div><h3>{stats.published}</h3><p>{t.published}</p></div>
          </div>
          <div className="stat-card gradient-amber">
            <Clock size={24} /><div><h3>{stats.pending}</h3><p>{t.pending}</p></div>
          </div>
        </div>

        <div className="main-grid">
          <section className="form-section">
            <div className="glass-panel">
              <AnimatePresence>
                {isEditing && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="edit-banner">
                    <Edit size={18} /><span><strong>{t.editingBanner}</strong></span>
                    <button type="button" onClick={resetForm}><X size={16} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <h2 className="section-title">{isEditing ? t.updateBlog : t.createBlog}</h2>

              <form onSubmit={handleSubmit} className="blog-form">
                <div className="input-group">
                  <input type="text" name="title" className="floating-input" placeholder=" " value={form.title} onChange={handleTextChange} required maxLength={120} />
                  <label className="floating-label">{t.blogTitle}</label>
                  <span className="char-count">{form.title.length}/120</span>
                </div>

                <div className="input-group">
                  <textarea name="content" className="floating-input textarea" placeholder=" " value={form.content} onChange={handleTextChange} required />
                  <label className="floating-label">{t.content}</label>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <input type="text" name="author" className="floating-input" placeholder=" " value={form.author} onChange={handleTextChange} required />
                    <label className="floating-label">{t.author}</label>
                  </div>
                </div>

                <div className="form-row">
                  <Autocomplete label={t.category} lang={lang} value={form.category} type="category" onChange={(val) => setForm(p => ({ ...p, category: val, subcategory: '' }))} />
                  <Autocomplete label={t.subcategory} lang={lang} value={form.subcategory} disabled={!form.category} type="subcategory" parentCategory={form.category} onChange={(val) => setForm(p => ({ ...p, subcategory: val }))} />
                </div>

                <div className="form-group">
                  <label className="group-label">{t.keywords}</label>
                  <TagInput tags={keywords} setTags={setKeywords} />
                </div>

                <div className="media-uploads">
                  <div className="upload-zone">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                    {previewUrls.cover ? (
                      <>
                        <img src={previewUrls.cover} alt="Cover Preview" className="image-preview" />
                        <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>{files.cover?.name}</p>
                      </>
                    ) : files.cover ? (
                      <div className="upload-preview"><CheckCircle className="text-green" /> {files.cover.name}</div>
                    ) : (
                      <><ImageIcon size={28} className="text-muted" /><p>{t.coverImage}</p></>
                    )}
                  </div>

                  <div className="upload-zone">
                    <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                    {previewUrls.video ? (
                      <>
                        <video src={previewUrls.video} className="video-preview" controls />
                        <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>{files.video?.name}</p>
                      </>
                    ) : files.video ? (
                      <div className="upload-preview"><CheckCircle className="text-green" /> {files.video.name}</div>
                    ) : (
                      <><Film size={28} className="text-muted" /><p>{t.featuredVideo}</p></>
                    )}
                  </div>

                  <div className="upload-zone full-width unified-media-zone">
                    <input type="file" accept="image/*,video/*" multiple onChange={(e) => handleFileChange(e, 'media')} />
                    <UploadCloud size={28} style={{ color: '#4F46E5' }} />
                    <p style={{ fontWeight: '600' }}>{t.unifiedMedia}</p>
                    {files.media && files.media.length > 0 && (
                      <div className="gallery-preview">
                        {files.media.map((f, i) => (
                          <span key={i} className="gallery-pill" style={{ borderColor: '#4F46E5' }}>
                            {f.type.startsWith('video/') ? <Film size={12} /> : <ImageIcon size={12} />}
                            {f.name}
                            <X size={12} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFiles(p => ({ ...p, media: p.media.filter((_, idx) => idx !== i) })) }} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && existingMedia.length > 0 && (
                  <div className="form-group full-width existing-media-section">
                    <label className="group-label">{t.existingMediaLabel}</label>
                    <div className="existing-media-gallery">
                      <AnimatePresence>
                        {existingMedia.map((m, i) => (
                          <motion.div key={m.path || i} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="existing-media-item">
                            {m.type === 'video' ? <div className="media-placeholder video"><Film size={28} /><span>Video</span></div> : <img src={getImageUrl(m.path)} alt="Preview" />}
                            <button type="button" className="delete-media-btn" onClick={(e) => handleDeleteExistingMedia(m.path, e)} title="Remove media"><X size={14} strokeWidth={3} /></button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-submit" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="spinner" /> : (isEditing ? t.updateBtn : t.publishBtn)}
                </button>
              </form>
            </div>
          </section>

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

            <div className="blog-list">
              <AnimatePresence mode="popLayout">
                {loading && page === 1 ? (
                  [1, 2, 3].map(i => (
                    <motion.div key={`skel-${i}`} exit={{ opacity: 0 }} className="blog-card skeleton">
                      <div className="skel-img pulse"></div>
                      <div className="skel-content">
                        <div className="skel-line pulse w-80"></div>
                        <div className="skel-line pulse w-50"></div>
                      </div>
                    </motion.div>
                  ))
                ) : filteredBlogs.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                    <div className="empty-icon"><FileText size={48} /></div>
                    <h3>{t.noBlogs}</h3>
                    <p>{t.noBlogsSub}</p>
                  </motion.div>
                ) : (
                  filteredBlogs.map((blog, idx) => {
                    const isLastItem = filteredBlogs.length === idx + 1;
                    return (
                      <motion.div
                        ref={isLastItem ? lastBlogElementRef : null}
                        layout
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        key={blog.id || blog._id || idx} className="blog-card"
                      >
                        <div className="blog-card-img">
                          {blog.image_url ? <img src={getImageUrl(blog.image_url)} alt={blog.title || 'Blog Image'} loading="lazy" /> : <ImageIcon className="text-muted" />}
                        </div>
                        <div className="blog-card-content">
                          <div className="blog-meta">
                            <span className={`status-badge ${(blog.status || "pending").toLowerCase()}`}>
                              {(blog.status || "pending").toLowerCase() === "published" ? t.published : t.pending}
                            </span>
                            <span className="blog-date">{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'New'}</span>
                          </div>
                          <h3 className="blog-title">{blog.title || 'Untitled Blog'}</h3>
                          <p className="blog-author">{blog.author || 'Unknown Author'} • {blog.category?.name || blog.category || 'Uncategorized'}</p>

                          {(blog.video_url || (blog.media && blog.media.length > 0)) && (
                            <div className="blog-saved-media">
                              {blog.video_url && <span className="saved-media-badge video"><Film size={12}/> Featured Video</span>}
                              {blog.media && blog.media.map((m, i) => (
                                <span key={i} className="saved-media-badge media-item" title={m.path}>
                                  {m.type === 'video' ? <Film size={12}/> : <ImageIcon size={12}/>} Media {i + 1}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="blog-actions">
                            <button onClick={() => handleStatusChange(blog.id || blog._id)} className={`btn-icon ${(blog.status || 'pending').toLowerCase() === "published" ? "btn-pending" : "btn-publish"}`}>
                              {(blog.status || 'pending').toLowerCase() === "published" ? <Clock size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button onClick={() => handleEdit(blog)} className="btn-icon btn-edit" title="Edit Blog"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(blog.id || blog._id)} className="btn-icon btn-delete" title="Delete Blog"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>

              {/* Infinite Scroll Loading Indicator */}
              {loadingMore && (
                <div className="scroll-loader">
                  <Loader2 className="spinner" size={24} /> <span>{t.loadingMore}</span>
                </div>
              )}
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
    --primary: #000000;
    --primary-hover: #333333;
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
 
  .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 2rem; }
  .header-title h1 { margin: 0 0 0.5rem; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; }
  .header-title p { margin: 0; color: var(--text-muted); font-size: 1.1rem; }
  
  /* --- NOTIFICATIONS STYLES --- */
  .header-actions { display: flex; align-items: center; }
  .notification-wrapper { position: relative; display: flex; align-items: center; justify-content: center; }
  .bell-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow-sm); position: relative; transition: all 0.2s; }
  .bell-btn:hover { background: #F1F5F9; border-color: #CBD5E1; }
  .notif-badge { position: absolute; top: -2px; right: -2px; background: var(--danger); color: white; font-size: 0.65rem; font-weight: 800; min-width: 20px; height: 20px; border-radius: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--card-bg); padding: 0 4px; }
  .notif-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 360px; padding: 0; z-index: 100; border-radius: 16px; overflow: hidden; transform-origin: top right; }
  .notif-header { padding: 1.25rem; border-bottom: 1px solid var(--border); background: #F8FAFC; display: flex; justify-content: space-between; align-items: center; }
  .notif-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
  .notif-count { background: var(--primary); color: white; font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; font-weight: 600; }
  .notif-list { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; }
  .notif-empty { padding: 3rem 1.5rem; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; }
  .notif-empty p { margin: 0; font-weight: 500; }
  .notif-item { display: flex; padding: 1.25rem; border-bottom: 1px solid var(--border); transition: background 0.2s; gap: 1rem; align-items: flex-start; position: relative; }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: #F8FAFC; }
  .notif-icon-wrap { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid var(--border); flex-shrink: 0; }
  .notif-content { flex: 1; min-width: 0; padding-right: 1.5rem; }
  .notif-content strong { display: block; font-size: 0.95rem; margin-bottom: 0.25rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .notif-content p { margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .notif-time { font-size: 0.75rem; color: #94A3B8; font-weight: 500; }
  .notif-delete-btn { position: absolute; right: 1.25rem; top: 1.25rem; background: none; border: none; color: #CBD5E1; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .notif-delete-btn:hover { background: #FEE2E2; color: var(--danger); }
  .text-primary { color: var(--primary); }
  .text-amber { color: var(--amber); }
 
  .stats-grid { display: flex; flex-wrap: wrap; gap: 1rem; }
  .stat-card { flex: 1; display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 1.75rem; border-radius: var(--radius-lg); color: white; min-width: 180px; box-shadow: var(--shadow-md); transition: transform 0.2s; }
  .stat-card:hover { transform: translateY(-4px); }
  .stat-card h3 { margin: 0; font-size: 1.8rem; font-weight: 800; }
  .stat-card p { margin: 0; font-size: 0.9rem; opacity: 0.9; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
  
  .gradient-blue { background: linear-gradient(135deg, #2563EB, #3B82F6); }
  .gradient-green { background: linear-gradient(135deg, #059669, #10B981); }
  .gradient-amber { background: linear-gradient(135deg, #D97706, #F59E0B); }
 
  .main-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2.5rem; align-items: start; }
 
  .glass-panel { background: var(--card-bg); border-radius: var(--radius-xl); padding: 2.5rem; box-shadow: var(--shadow-lg); border: 1px solid var(--border); }
  .section-title { margin: 0 0 2rem 0; font-size: 1.5rem; font-weight: 700; }
 
  .edit-banner { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; padding: 1rem 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; font-size: 0.95rem; flex-wrap: wrap; }
  .edit-banner button { margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; padding: 0.25rem; }
 
  .blog-form { display: flex; flex-direction: column; gap: 1.5rem; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
 
  .input-group { position: relative; width: 100%; }
  .floating-input { width: 100%; padding: 1.25rem 1rem 0.75rem; border-radius: 12px; border: 1px solid var(--border); font-size: 1rem; background: var(--bg-color); outline: none; color: var(--text-main); transition: all 0.2s; font-family: inherit; }
  .floating-input:focus { border-color: var(--primary); background: var(--card-bg); box-shadow: 0 0 0 4px rgba(0,0,0,0.05); }
  .floating-input:disabled { opacity: 0.6; cursor: not-allowed; }
  .floating-label { position: absolute; left: 1rem; top: 1rem; color: var(--text-muted); font-size: 1rem; transition: all 0.2s ease-out; pointer-events: none; }
  .floating-input:focus ~ .floating-label, .floating-input:not(:placeholder-shown) ~ .floating-label { top: 0.4rem; font-size: 0.75rem; color: var(--primary); font-weight: 600; }
  .char-count { position: absolute; right: 1rem; top: 1rem; font-size: 0.75rem; color: var(--text-muted); }
  
  textarea.floating-input { resize: none; min-height: 120px; overflow: hidden; }
 
  .autocomplete-dropdown { position: absolute; top: calc(100% + 0.5rem); left: 0; right: 0; background: var(--card-bg); border-radius: 12px; box-shadow: var(--shadow-lg); border: 1px solid var(--border); z-index: 50; max-height: 300px; overflow-y: auto; }
  .dropdown-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; cursor: pointer; transition: background 0.2s; font-weight: 500; border-bottom: 1px solid var(--border); }
  .dropdown-item:last-child { border-bottom: none; }
  .dropdown-item:hover { background: var(--bg-color); color: var(--primary); }
  .dropdown-item-content { display: flex; align-items: center; gap: 0.75rem; }
  .dropdown-img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border); }
  .dropdown-parent-badge { font-size: 0.65rem; background: var(--bg-color); border: 1px solid var(--border); padding: 0.2rem 0.5rem; border-radius: 6px; color: var(--text-muted); white-space: nowrap; font-weight: 600;}
  .dropdown-loading, .dropdown-empty { padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
 
  .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .group-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .tag-input-container { border: 1px solid var(--border); border-radius: 12px; padding: 0.5rem; background: var(--bg-color); transition: border-color 0.2s; }
  .tag-input-container:focus-within { border-color: var(--primary); background: var(--card-bg); }
  .tags-wrapper { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  .tag-pill { background: #F1F5F9; border: 1px solid var(--border); padding: 0.35rem 0.75rem; border-radius: 99px; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
  .tag-pill button { background: none; border: none; padding: 0; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; }
  .tag-pill button:hover { color: var(--danger); }
  .tag-input-field { border: none; background: transparent; outline: none; padding: 0.5rem; font-size: 0.95rem; flex: 1; min-width: 150px; }
 
  .media-uploads { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .upload-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 1.5rem; text-align: center; position: relative; background: var(--bg-color); transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; overflow: hidden; }
  .upload-zone:hover { border-color: var(--primary); background: #F8FAFC; }
  .upload-zone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; z-index: 10; }
  .upload-zone p { margin: 0; font-size: 0.85rem; font-weight: 500; color: var(--text-muted); }
  .full-width { grid-column: 1 / -1; }
  .unified-media-zone { border-color: #A5B4FC; background: #EEF2FF; }
  .unified-media-zone:hover { border-color: #4F46E5; background: #E0E7FF; }
  .upload-preview { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
  .text-green { color: var(--success); }
  .gallery-preview { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; justify-content: center; position: relative; z-index: 20; }
  .gallery-pill { background: var(--card-bg); border: 1px solid var(--border); padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-sm); }
  .gallery-pill svg { cursor: pointer; color: var(--text-muted); }
  .gallery-pill svg:hover { color: var(--danger); }
 
  /* --- NEW IMAGE/VIDEO PREVIEW STYLING --- */
  .image-preview, .video-preview { width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem; border: 1px solid var(--border); box-shadow: var(--shadow-sm); z-index: 5; }

  .existing-media-section { margin-top: 1rem; }
  .existing-media-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 1rem; margin-top: 0.75rem; }
  .existing-media-item { position: relative; width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); box-shadow: var(--shadow-sm); background: var(--bg-color); display: flex; align-items: center; justify-content: center; }
  .existing-media-item img { width: 100%; height: 100%; object-fit: cover; }
  .media-placeholder.video { display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-muted); align-items: center; justify-content: center; width: 100%; height: 100%; background: #F1F5F9; }
  .delete-media-btn { position: absolute; top: 6px; right: 6px; background: rgba(255,255,255,0.95); border: none; color: var(--danger); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.15); transition: all 0.2s; z-index: 10; }
  .delete-media-btn:hover { background: var(--danger); color: white; transform: scale(1.1); }
 
  .btn-submit { background: var(--primary); color: white; border: none; padding: 1.25rem; border-radius: 12px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px 0 rgba(0,0,0,0.2); display: flex; justify-content: center; align-items: center; width: 100%; }
  .btn-submit:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
  .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
 
  .list-toolbar { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .search-bar { flex: 1; min-width: 200px; display: flex; align-items: center; background: var(--card-bg); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); gap: 0.75rem; transition: border-color 0.2s; }
  .search-bar:focus-within { border-color: var(--primary); }
  .search-bar input { border: none; outline: none; width: 100%; font-size: 0.95rem; background: transparent; }
  .filter-select { padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border); background: var(--card-bg); font-weight: 500; outline: none; cursor: pointer; min-width: 140px; }
 
  .blog-list { display: flex; flex-direction: column; gap: 1rem; }
  .blog-card { display: flex; background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 1rem; gap: 1.5rem; box-shadow: var(--shadow-sm); transition: box-shadow 0.2s, transform 0.2s; align-items: center; }
  .blog-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  
  .blog-card-img { width: 120px; height: 100px; border-radius: 10px; background: var(--bg-color); flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .blog-card-img img { width: 100%; height: 100%; object-fit: cover; }
  
  .blog-card-content { flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
  .blog-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem; }
  .blog-date { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
  
  .status-badge { font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 99px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .status-badge.published { background: #D1FAE5; color: #065F46; }
  .status-badge.pending { background: #FEF3C7; color: #92400E; }
  .status-badge.draft { background: #F1F5F9; color: #475569; }
 
  .blog-title { margin: 0 0 0.25rem 0; font-size: 1.1rem; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .blog-author { margin: 0 0 0.5rem 0; font-size: 0.85rem; color: var(--text-muted); }
  
  .blog-saved-media { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  .saved-media-badge { font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600; }
  .saved-media-badge.video { background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA; }
  .saved-media-badge.media-item { background: #EEF2FF; color: #3730A3; border: 1px solid #C7D2FE; }
 
  .blog-actions { display: flex; gap: 0.5rem; }
  .btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
  .btn-edit { background: var(--bg-color); color: var(--text-main); border-color: var(--border); }
  .btn-edit:hover { background: #F1F5F9; border-color: #CBD5E1; }
  .btn-delete { background: #FEF2F2; color: var(--danger); border-color: #FEE2E2; }
  .btn-delete:hover { background: #FEE2E2; }
 
  .btn-publish { background: #DCFCE7; color: #15803D; border: 1px solid #BBF7D0; }
  .btn-publish:hover { background: #BBF7D0; }
  .btn-pending { background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
  .btn-pending:hover { background: #FDE68A; }
 
  .pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  .skel-img { width: 120px; height: 100px; border-radius: 10px; background: var(--border); }
  .skel-content { flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
  .skel-line { height: 16px; border-radius: 4px; background: var(--border); }
  .w-80 { width: 80%; } .w-50 { width: 50%; }
  
  .empty-state { text-align: center; padding: 4rem 2rem; background: var(--card-bg); border-radius: 16px; border: 2px dashed var(--border); }
  .empty-icon { width: 64px; height: 64px; background: var(--bg-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--text-muted); }
  .empty-state h3 { margin: 0 0 0.5rem; } .empty-state p { margin: 0; color: var(--text-muted); }
  
  .scroll-loader { display: flex; justify-content: center; align-items: center; padding: 1.5rem; gap: 0.75rem; color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }
 
  .processing-overlay { position: fixed; inset: 0; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
  .processing-modal { background: var(--card-bg); padding: 3rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); border: 1px solid var(--border); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; width: 90%; max-width: 400px; }
  .modal-spinner { color: var(--primary); animation: spin 1s linear infinite; }
  .processing-modal h3 { margin: 0; font-size: 1.5rem; }
  .processing-modal p { margin: 0; color: var(--text-muted); }
  .process-step { margin-top: 1rem; padding: 0.5rem 1rem; background: var(--bg-color); border-radius: 99px; font-size: 0.85rem; font-weight: 600; color: var(--primary); }
  
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* --- POPUP MODAL (From Donate.jsx) --- */
  .custom-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
  }

  .custom-modal-content {
    background: var(--card-bg);
    width: 100%;
    max-width: 400px;
    border-radius: 32px;
    padding: 2.5rem 2rem;
    position: relative;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  }

  .close-btn {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    background: var(--bg-color);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #F1F5F9;
    color: var(--text-main);
  }

  .modal-icon-container {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem auto;
  }

  .modal-icon-container.success {
    background: #D1FAE5;
    color: var(--success);
  }

  .modal-icon-container.error {
    background: #FEE2E2;
    color: var(--danger);
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-main);
    margin: 0 0 0.75rem 0;
  }

  .modal-desc {
    font-size: 0.95rem;
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0 0 2rem 0;
  }

  .modal-action-btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 700;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .modal-action-btn.success {
    background: var(--text-main);
  }
  .modal-action-btn.success:hover {
    background: #000000;
  }

  .modal-action-btn.error {
    background: var(--danger);
  }
  .modal-action-btn.error:hover {
    background: #DC2626;
  }
 
  @media (max-width: 1200px) {
    .main-grid { grid-template-columns: 1fr; }
    .list-section { order: -1; } 
  }
 
  @media (max-width: 768px) {
    .admin-layout { padding: 1rem; }
    .glass-panel { padding: 1.5rem; }
    .dashboard-header { flex-direction: column; align-items: flex-start; }
    .header-actions { width: 100%; justify-content: flex-end; }
    .header-title h1 { font-size: 1.8rem; }
    .stats-grid { flex-direction: column; width: 100%; }
    .form-row { grid-template-columns: 1fr; }
    .media-uploads { grid-template-columns: 1fr; }
    .list-toolbar { flex-direction: column; }
    .filter-select { width: 100%; }
    .blog-card { flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem; }
    .blog-card-img { width: 100%; height: 180px; }
    .blog-title { white-space: normal; }
    .notif-dropdown { width: 100%; position: fixed; top: 70px; left: 0; right: 0; border-radius: 0; z-index: 1000; }
  }
 
  @media (max-width: 480px) {
    .dashboard-header { gap: 1.5rem; margin-bottom: 1.5rem; }
    .glass-panel { padding: 1.25rem; border-radius: 16px; }
    .btn-submit { padding: 1rem; font-size: 1rem; }
    .tag-input-field { min-width: 100px; }
  }
`;

export default BlogAdminPanel;
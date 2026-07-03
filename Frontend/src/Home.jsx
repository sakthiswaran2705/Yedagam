import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ChevronRight, Image as ImageIcon, PlayCircle, AlertCircle, Loader2, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// --- TRANSLATIONS ---
const translations = {
  en: {
    pageTitle: "Latest Updates",
    pageSubtitle: "Stay informed with our latest news, articles, and announcements.",
    readMore: "Read Article",
    by: "By",
    noBlogs: "No articles found at the moment. Please check back later.",
    noSearchResults: "No articles found matching your search.",
    searchPlaceholder: "Search articles...",
    loading: "Fetching the latest news...",
    uncategorized: "Uncategorized",
    endOfResults: "You've reached the end."
  },
  ta: {
    pageSubtitle: "சமீபத்திய செய்திகள் மற்றும் கட்டுரைகளைத் தெரிந்துகொள்ளுங்கள்.",
    readMore: "கட்டுரையை படிக்க",
    by: "எழுதியவர்",
    noBlogs: "தற்போது கட்டுரைகள் எதுவும் இல்லை. பின்னர் மீண்டும் சரிபார்க்கவும்.",
    noSearchResults: "உங்கள் தேடலுக்குப் பொருத்தமான கட்டுரைகள் எதுவும் கிடைக்கவில்லை.",
    searchPlaceholder: "கட்டுரைகளைத் தேடுங்கள்...",
    loading: "செய்திகள் ஏற்றப்படுகின்றன...",
    uncategorized: "வகைப்படுத்தப்படாதவை",
    endOfResults: "அனைத்து செய்திகளும் ஏற்றப்பட்டன."
  }
};

// --- UTILS ---
const formatDate = (dateString, lang) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', options);
};

const getFirstImage = (blog) => {
  if (blog.image_url) return `${API_BASE_URL}/${blog.image_url.replace(/^\//, '')}`;
  if (blog.image_urls && blog.image_urls.length > 0) return `${API_BASE_URL}/${blog.image_urls[0].replace(/^\//, '')}`;
  return null;
};

// --- MAIN COMPONENT ---
const Home = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ta');
  const t = translations[lang] || translations.ta;
  const navigate = useNavigate();

  // Data & Pagination State
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const ITEMS_PER_PAGE = 6;
  const loaderRef = useRef(null);

  // 1. Fetch Logic connecting to backend skip/limit + search
  const fetchBlogs = async (currentPage, currentLang, query = "", isReset = false) => {
    if (isReset) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;

      // FIX: Changed "search=" to "title=" for title-wise searching in the API
      const searchParam = query ? `&title=${encodeURIComponent(query)}` : '';

      const response = await fetch(
        `${API_BASE_URL}/All/blogs/yedagam/?lang=${currentLang}&skip=${skip}&limit=${ITEMS_PER_PAGE}${searchParam}`
      );

      if (!response.ok) throw new Error("Failed to fetch blogs. Please try again later.");

      const data = await response.json();

      if (isReset) {
        setBlogs(data);
      } else {
        setBlogs((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 2. Handle Search Submit
  const handleSearch = (e) => {
    e?.preventDefault();
    setActiveSearch(searchTerm);
    setPage(1);
    setHasMore(true);
    fetchBlogs(1, lang, searchTerm, true);
  };

  // 3. Clear Search
  const clearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setPage(1);
    setHasMore(true);
    fetchBlogs(1, lang, "", true);
  };

  // 4. Handle Language Change / Initial Load
  useEffect(() => {
    setBlogs([]);
    setPage(1);
    setHasMore(true);
    fetchBlogs(1, lang, activeSearch, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // 5. Handle Page Increment (Infinite Scroll Trigger)
  useEffect(() => {
    if (page > 1) {
      fetchBlogs(page, lang, activeSearch, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 6. Infinite Scroll Observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, isLoading, isLoadingMore]);

  useEffect(() => {
    const option = { root: null, rootMargin: "100px", threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  return (
    <>
      <style>{styles}</style>
      <div className="news-home-wrapper">
        <Navbar onLanguageChange={setLang} />

        <main className="main-content">
          <div className="container">

            {/* Editorial Header & Search */}
            <header className="editorial-header"> 
              <h1>{t.pageTitle}</h1>
              <p>{t.pageSubtitle}</p>
              <div className="header-divider"></div>

              <form className="search-form" onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button type="button" className="clear-btn" onClick={clearSearch}>
                      <X size={18} />
                    </button>
                  )}
                </div>
                <button type="submit" className="search-submit-btn">
                  <Search size={18} />
                </button>
              </form>
            </header>

            {/* Content States */}
            {isLoading ? (
              <div className="state-container">
                <Loader2 size={48} className="spinner icon-primary" />
                <p>{t.loading}</p>
              </div>
            ) : error && blogs.length === 0 ? (
              <div className="state-container error-box">
                <AlertCircle size={48} className="icon-danger" />
                <h3>Oops! Something went wrong.</h3>
                <p>{error}</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="state-container empty-box">
                <ImageIcon size={56} className="icon-muted" />
                <h3>{activeSearch ? t.noSearchResults : t.noBlogs}</h3>
                {activeSearch && (
                  <button onClick={clearSearch} className="reset-search-btn">
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Flat, Grounded Grid Layout */}
                <div className="editorial-grid">
                  <AnimatePresence>
                    {blogs.map((blog) => {
                      const coverImage = getFirstImage(blog);
                      const categoryName = blog.category?.name || blog.category?.category_name || t.uncategorized;

                      return (
                        <motion.article
                          key={blog.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="editorial-card"
                          onClick={() => navigate(`/blog/${blog.id}`)}
                        >
                          <div className="card-image-box">
                            {coverImage ? (
                              <img src={coverImage} alt={blog.title} loading="lazy" />
                            ) : (
                              <div className="placeholder-img"><ImageIcon size={32} /></div>
                            )}
                            {blog.video_url && (
                              <div className="video-indicator">
                                <PlayCircle size={24} />
                              </div>
                            )}
                          </div>

                          <div className="card-content">
                            <div className="card-category">
                              <span className="category-dot"></span>
                              {categoryName}
                            </div>

                            <h2 className="card-title" title={blog.title}>
                              {blog.title}
                            </h2>

                            <p className="card-excerpt">
                              {blog.content.replace(/<[^>]*>?/gm, '')}
                            </p>

                            <div className="card-footer">
                              <div className="card-meta">
                                <span><User size={14} /> {blog.author || 'Admin'}</span>
                                <span><Calendar size={14} /> {formatDate(blog.created_at, lang)}</span>
                              </div>

                              <button className="read-btn" aria-label={`Read more about ${blog.title}`}>
                                {t.readMore} <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Scroll Sentinel & Loading Indicator */}
                <div className="infinite-scroll-trigger" ref={loaderRef}>
                  {isLoadingMore ? (
                    <div className="loading-more">
                      <Loader2 size={24} className="spinner" />
                      <span>{t.loading}</span>
                    </div>
                  ) : !hasMore && blogs.length > 0 ? (
                    <div className="end-of-results">
                      <div className="dot-divider"></div>
                      <p>{t.endOfResults}</p>
                    </div>
                  ) : null}
                </div>
              </>
            )}

          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

// --- STRICTLY SCOPED, FLAT EDITORIAL CSS ---
const styles = `
  :root {
    --news-primary: #dc2626;
    --news-primary-hover: #b91c1c;
    --news-bg: #F8FAFC;
    --news-surface: #FFFFFF;
    --news-border: #E2E8F0;
    --news-text-main: #0F172A;
    --news-text-muted: #64748B;
    --news-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
    --news-shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .news-home-wrapper {
    min-height: 100vh;
    background-color: var(--news-bg);
    font-family: 'Georgia', 'Merriweather', serif;
  }
  
  .news-home-wrapper h1, 
  .news-home-wrapper h2, 
  .news-home-wrapper h3, 
  .news-home-wrapper button,
  .news-home-wrapper input,
  .news-home-wrapper .card-meta,
  .news-home-wrapper .card-category,
  .news-home-wrapper p {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .news-home-wrapper .main-content {
    padding: 3rem 1.5rem 5rem 1.5rem;
  }

  .news-home-wrapper .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .news-home-wrapper .editorial-header {
    text-align: center;
    margin-bottom: 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .news-home-wrapper .editorial-header h1 {
    font-size: 2.75rem;
    font-weight: 900;
    color: var(--news-text-main);
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.02em;
  }

  .news-home-wrapper .editorial-header p {
    font-size: 1.1rem;
    color: var(--news-text-muted);
    max-width: 600px;
    margin: 0 auto 1.5rem auto;
    line-height: 1.6;
  }

  .news-home-wrapper .header-divider {
    width: 60px;
    height: 4px;
    background-color: var(--news-primary);
    margin: 0 auto 2.5rem auto;
    border-radius: 2px;
  }

  /* --- SEARCH BAR --- */
  .news-home-wrapper .search-form {
    display: flex;
    gap: 10px;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .news-home-wrapper .search-input-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .news-home-wrapper .search-icon {
    position: absolute;
    left: 16px;
    color: #94A3B8;
  }

  .news-home-wrapper .search-input {
    width: 100%;
    padding: 14px 44px 14px 48px;
    border: 1px solid var(--news-border);
    border-radius: 9999px;
    font-size: 1rem;
    color: var(--news-text-main);
    background: var(--news-surface);
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .news-home-wrapper .search-input:focus {
    outline: none;
    border-color: var(--news-primary);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
  }

  .news-home-wrapper .clear-btn {
    position: absolute;
    right: 12px;
    background: transparent;
    border: none;
    color: #94A3B8;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: color 0.2s ease, background 0.2s ease;
  }

  .news-home-wrapper .clear-btn:hover {
    color: var(--news-text-main);
    background: #F1F5F9;
  }

  .news-home-wrapper .search-submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--news-primary);
    color: white;
    border: none;
    border-radius: 9999px;
    padding: 0 24px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.1s ease;
  }

  .news-home-wrapper .search-submit-btn:hover {
    background: var(--news-primary-hover);
  }
  
  .news-home-wrapper .search-submit-btn:active {
    transform: scale(0.98);
  }

  /* --- EDITORIAL GRID --- */
  .news-home-wrapper .editorial-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2.5rem;
  }

  .news-home-wrapper .editorial-card {
    background: var(--news-surface);
    border: 1px solid var(--news-border);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    overflow: hidden;
    box-shadow: var(--news-shadow);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .news-home-wrapper .editorial-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--news-shadow-hover);
  }

  .news-home-wrapper .card-image-box {
    position: relative;
    width: 100%;
    height: 220px;
    background: #F1F5F9;
    border-bottom: 1px solid var(--news-border);
    overflow: hidden;
  }

  .news-home-wrapper .card-image-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .news-home-wrapper .editorial-card:hover .card-image-box img {
    transform: scale(1.08);
  }

  .news-home-wrapper .placeholder-img {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #CBD5E1;
  }

  .news-home-wrapper .video-indicator {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(15, 23, 42, 0.75);
    color: white;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    backdrop-filter: blur(4px);
  }

  .news-home-wrapper .card-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .news-home-wrapper .card-category {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--news-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
  }

  .news-home-wrapper .category-dot {
    width: 6px;
    height: 6px;
    background-color: var(--news-primary);
    border-radius: 50%;
  }

  .news-home-wrapper .card-title {
    font-family: 'Georgia', serif;
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.4;
    color: var(--news-text-main);
    margin: 0 0 1rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .news-home-wrapper .card-excerpt {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--news-text-muted);
    margin: 0 0 1.5rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  .news-home-wrapper .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.25rem;
    border-top: 1px solid var(--news-border);
  }

  .news-home-wrapper .card-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.8rem;
    color: var(--news-text-muted);
    font-weight: 500;
  }

  .news-home-wrapper .card-meta span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .news-home-wrapper .read-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    color: var(--news-text-main);
    font-weight: 700;
    font-size: 0.85rem;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .news-home-wrapper .editorial-card:hover .read-btn {
    color: var(--news-primary);
    background: #FEF2F2;
  }

  /* --- SYSTEM STATES --- */
  .news-home-wrapper .infinite-scroll-trigger {
    width: 100%;
    padding: 3rem 0;
    display: flex;
    justify-content: center;
    min-height: 80px;
  }

  .news-home-wrapper .loading-more {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--news-text-muted);
    font-weight: 600;
  }

  .news-home-wrapper .end-of-results {
    text-align: center;
    color: var(--news-text-muted);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .news-home-wrapper .dot-divider {
    width: 4px;
    height: 4px;
    background: #CBD5E1;
    border-radius: 50%;
    margin: 0 auto 12px auto;
    box-shadow: -15px 0 0 #CBD5E1, 15px 0 0 #CBD5E1;
  }

  .news-home-wrapper .state-container {
    padding: 5rem 2rem;
    text-align: center;
    background: var(--news-surface);
    border: 1px dashed var(--news-border);
    border-radius: 12px;
    max-width: 600px;
    margin: 0 auto;
  }

  .news-home-wrapper .state-container h3 {
    font-size: 1.25rem;
    color: var(--news-text-main);
    margin-bottom: 0.5rem;
  }

  .news-home-wrapper .reset-search-btn {
    margin-top: 1rem;
    padding: 8px 16px;
    background: white;
    border: 1px solid var(--news-border);
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .news-home-wrapper .reset-search-btn:hover {
    background: #F1F5F9;
  }

  .news-home-wrapper .icon-primary { color: var(--news-primary); margin-bottom: 1rem; }
  .news-home-wrapper .icon-danger { color: #EF4444; margin-bottom: 1rem; }
  .news-home-wrapper .icon-muted { color: #94A3B8; margin-bottom: 1rem; }
  
  .news-home-wrapper .spinner { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }

  /* --- RESPONSIVE --- */
  @media (max-width: 768px) {
    .news-home-wrapper .main-content { padding: 2rem 1rem; }
    .news-home-wrapper .editorial-header h1 { font-size: 2.25rem; }
    .news-home-wrapper .editorial-grid { grid-template-columns: 1fr; gap: 1.5rem; }
    .news-home-wrapper .search-form { padding: 0 1rem; }
  }
`;

export default Home;
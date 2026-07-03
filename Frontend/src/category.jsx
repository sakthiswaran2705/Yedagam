import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx"; // Navbar imported here
import Footer from "./Footer.jsx";
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// --- Icons (Inline SVGs for portability) ---
const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  )
};

export default function Category() {
  const navigate = useNavigate();
  const lang = localStorage.getItem("app_lang") || "ta";

  // State: Categories
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State: Selected Category & its Blogs
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [blogError, setBlogError] = useState(null);

  // --- Fetch Categories ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await axios.get(`${API_BASE}/category-all/?lang=${lang}`);
        setCategories(response.data || []);
      } catch (err) {
        setCategoryError("Failed to load categories.");
        console.error("Category fetch error:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [lang]);

  // --- Search Logic ---
  const filteredCategories = categories.filter((cat) => {
    const query = searchQuery.toLowerCase();
    const matchCat = cat.category_name?.toLowerCase().includes(query);
    const matchSub = cat.subcategories?.some((sub) =>
      sub.name?.toLowerCase().includes(query)
    );
    return matchCat || matchSub;
  });

  // --- Handlers ---
  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setIsLoadingBlogs(true);
    setBlogError(null);
    setSelectedBlogs([]);

    try {
      const response = await axios.get(`${API_BASE}/blog/category/${category.id}/?lang=${lang}`);
      setSelectedBlogs(response.data || []);
    } catch (err) {
      setBlogError("Failed to load blogs for this category.");
      console.error("Blog fetch error:", err);
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedBlogs([]);
  };

  // --- Utils ---
  const resolveImageUrl = (path) => {
    if (!path) return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=";
    if (path.startsWith("http")) return path;
    return `${API_BASE}/${path.replace(/^\//, "")}`;
  };

  const getBlogImage = (blog) => {
    if (blog.image_url) return resolveImageUrl(blog.image_url);
    if (blog.image_urls && blog.image_urls.length > 0) return resolveImageUrl(blog.image_urls[0]);
    return resolveImageUrl(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const opts = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateStr).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", opts);
  };

  return (
    <>
      <Navbar /> {/* Navbar implemented here */}
      <div className="cat-wrapper">
        <style>{styles}</style>

        {/* VIEW 1: CATEGORY LIST */}
        {!selectedCategory && (
          <div className="cat-container animation-fade-in">
            <header className="cat-header">
              <h1 className="cat-title">
                {lang === "ta" ? "பிரிவுகள்" : "Categories"}
              </h1>
              <p className="cat-subtitle">
                {lang === "ta"
                  ? "உங்களுக்கு பிடித்த தலைப்புகள் மற்றும் கட்டுரைகளை ஆராயுங்கள்"
                  : "Explore your favorite topics and articles"}
              </p>

              <div className="search-bar-wrapper">
                <Icons.Search />
                <input
                  type="text"
                  className="search-input"
                  placeholder={lang === "ta" ? "பிரிவுகளை தேட..." : "Search categories or subcategories..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </header>

            <main>
              {isLoadingCategories ? (
                <div className="cat-grid">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="glass-card skeleton">
                      <div className="skeleton-img shimmer" />
                      <div className="skeleton-content">
                        <div className="skeleton-title shimmer" />
                        <div className="skeleton-text shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : categoryError ? (
                <div className="empty-state error-state glass-card">
                  <h3>{categoryError}</h3>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="empty-state glass-card">
                  <h3>{lang === "ta" ? "பிரிவுகள் காணப்படவில்லை" : "No Categories Found"}</h3>
                </div>
              ) : (
                <div className="cat-grid">
                  {filteredCategories.map((cat) => (
                    <div key={cat.id} className="glass-card cat-card hover-lift" onClick={() => handleCategoryClick(cat)}>
                      <div className="card-img-wrapper">
                        <img src={resolveImageUrl(cat.image_path)} alt={cat.category_name} className="card-img" loading="lazy" />
                      </div>
                      <div className="card-body">
                        <h3 className="card-title">{cat.category_name}</h3>
                        <p className="card-meta">
                          {cat.subcategories?.length || 0} {lang === "ta" ? "உட்பிரிவுகள்" : "Subcategories"}
                        </p>
                        <button className="btn-primary mt-auto">
                          {lang === "ta" ? "வலைப்பதிவுகளைக் காண்க" : "View Blogs"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        )}

        {/* VIEW 2: CATEGORY DETAILS & BLOG LIST */}
        {selectedCategory && (
          <div className="cat-details-container animation-fade-in">
            <button className="btn-back" onClick={handleBack}>
              <Icons.ArrowLeft /> {lang === "ta" ? "பின்செல்க" : "Back to Categories"}
            </button>

            {/* Banner Section */}
            <div className="detail-banner glass-card">
              <div className="banner-bg" style={{ backgroundImage: `url(${resolveImageUrl(selectedCategory.image_path)})` }}>
                <div className="banner-overlay"></div>
              </div>
              <div className="banner-content">
                <h1 className="banner-title">{selectedCategory.category_name}</h1>
                <div className="banner-stats">
                  <span className="stat-badge">
                    {selectedCategory.subcategories?.length || 0} {lang === "ta" ? "உட்பிரிவுகள்" : "Subcategories"}
                  </span>
                  <span className="stat-badge">
                    {selectedBlogs.length} {lang === "ta" ? "வலைப்பதிவுகள்" : "Blogs"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subcategories Section */}
            {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
              <div className="section-block">
                <h2 className="section-title">{lang === "ta" ? "உட்பிரிவுகள்" : "Subcategories"}</h2>
                <div className="sub-grid">
                  {selectedCategory.subcategories.map((sub) => (
                    <div key={sub.id} className="glass-card sub-card">
                      <img src={resolveImageUrl(sub.image_path)} alt={sub.name} className="sub-img" loading="lazy" />
                      <span className="sub-name">{sub.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blogs Section */}
            <div className="section-block mt-4">
              <h2 className="section-title">
                {lang === "ta" ? "இந்த பிரிவின் கீழ் உள்ள வலைப்பதிவுகள்" : "Blogs Under This Category"}
              </h2>

              {isLoadingBlogs ? (
                <div className="blog-grid">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="glass-card skeleton">
                      <div className="skeleton-img shimmer" />
                      <div className="skeleton-content">
                        <div className="skeleton-title shimmer" />
                        <div className="skeleton-text shimmer" />
                        <div className="skeleton-text short shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : blogError ? (
                <div className="empty-state error-state glass-card">
                  <h3>{blogError}</h3>
                </div>
              ) : selectedBlogs.length === 0 ? (
                <div className="empty-state glass-card">
                  <h3>{lang === "ta" ? "வலைப்பதிவுகள் காணப்படவில்லை" : "No Blogs Found in this Category"}</h3>
                </div>
              ) : (
                <div className="blog-grid">
                  {selectedBlogs.map((blog) => (
                    <div key={blog.id} className="glass-card blog-card hover-lift">
                      <div className="card-img-wrapper">
                        <img src={getBlogImage(blog)} alt={blog.title} className="card-img" loading="lazy" />
                      </div>
                      <div className="card-body">
                        <h3 className="blog-title" title={blog.title}>{blog.title}</h3>
                        <div className="blog-meta">
                          <span><Icons.User /> {blog.author || "Admin"}</span>
                          <span><Icons.Calendar /> {formatDate(blog.created_at)}</span>
                        </div>
                        <button className="btn-text-primary" onClick={() => navigate(`/blog/${blog.id}`)}>
                          {lang === "ta" ? "மேலும் படிக்க" : "Read More"} <Icons.ArrowRight />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

// --- CSS STYLES ---
const styles = `
  /* (CSS remains exactly the same as provided) */
  :root {
    --brand-primary: #6366f1;
    --brand-secondary: #4f46e5;
    --bg-start: #f8fafc;
    --bg-end: #e2e8f0;
    --glass-bg: rgba(255, 255, 255, 0.75);
    --glass-border: rgba(255, 255, 255, 0.6);
    --text-main: #0f172a;
    --text-muted: #64748b;
    --radius-lg: 20px;
    --radius-md: 14px;
    --shadow-soft: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    --shadow-hover: 0 20px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 15px -5px rgba(0, 0, 0, 0.05);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .cat-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-start) 0%, var(--bg-end) 100%);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--text-main);
    padding: 3rem 1.5rem;
  }

  .cat-container, .cat-details-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .animation-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Typography & Header */
  .cat-header {
    text-align: center;
    margin-bottom: 3.5rem;
  }
  .cat-title {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--text-main), var(--brand-primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
  }
  .cat-subtitle {
    font-size: 1.1rem;
    color: var(--text-muted);
    margin-bottom: 2rem;
  }

  /* Search Bar */
  .search-bar-wrapper {
    max-width: 500px;
    margin: 0 auto;
    position: relative;
    display: flex;
    align-items: center;
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 99px;
    padding: 0.5rem 1.5rem;
    box-shadow: var(--shadow-soft);
    transition: all 0.3s ease;
  }
  .search-bar-wrapper:focus-within {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    border-color: var(--brand-primary);
  }
  .search-bar-wrapper svg {
    color: var(--text-muted);
    margin-right: 0.75rem;
  }
  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: var(--text-main);
    padding: 0.75rem 0;
    outline: none;
  }
  .search-input::placeholder { color: #94a3b8; }

  /* Glassmorphism Cards */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-soft);
    overflow: hidden;
  }
  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-hover);
  }

  /* Grid Layouts */
  .cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
  }
  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }
  .sub-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }

  /* Card Components */
  .card-img-wrapper {
    width: 100%;
    height: 180px;
    overflow: hidden;
    position: relative;
    background: #e2e8f0;
  }
  .card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  .hover-lift:hover .card-img {
    transform: scale(1.05);
  }
  .card-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: calc(100% - 180px);
  }
  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .card-meta {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
  }
  
  /* Buttons */
  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    border-radius: var(--radius-md);
    border: none;
    background: var(--brand-primary);
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.3s;
  }
  .btn-primary:hover { background: var(--brand-secondary); }

  .btn-text-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: var(--brand-primary);
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    padding: 0;
    margin-top: auto;
    transition: gap 0.2s;
  }
  .btn-text-primary:hover { gap: 0.75rem; color: var(--brand-secondary); }

  .btn-back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    padding: 0.6rem 1.2rem;
    border-radius: 99px;
    color: var(--text-main);
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 2rem;
    transition: all 0.2s;
    box-shadow: var(--shadow-soft);
  }
  .btn-back:hover {
    background: white;
    transform: translateX(-4px);
  }

  /* Details View */
  .detail-banner {
    position: relative;
    height: 300px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    padding: 2.5rem;
    margin-bottom: 3rem;
  }
  .banner-bg {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-size: cover;
    background-position: center;
    z-index: 1;
  }
  .banner-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.2) 100%);
    z-index: 2;
  }
  .banner-content {
    position: relative;
    z-index: 3;
    width: 100%;
  }
  .banner-title {
    color: white;
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .banner-stats {
    display: flex;
    gap: 1rem;
  }
  .stat-badge {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .section-block { margin-bottom: 4rem; }
  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--text-main);
  }
  .mt-4 { margin-top: 4rem; }

  /* Subcategory Cards */
  .sub-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: var(--radius-md);
    transition: transform 0.2s, background 0.2s;
  }
  .sub-card:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.9);
  }
  .sub-img {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    object-fit: cover;
  }
  .sub-name {
    font-weight: 600;
    font-size: 0.95rem;
  }

  /* Blog Cards */
  .blog-title {
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .blog-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
  }
  .blog-meta span { display: flex; align-items: center; gap: 0.3rem; }

  /* Empty / Error States */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-muted);
  }
  .error-state { color: #ef4444; background: rgba(254, 226, 226, 0.5); }

  /* Skeletons */
  .skeleton-content { padding: 1.5rem; }
  .skeleton-img { width: 100%; height: 180px; }
  .skeleton-title { width: 80%; height: 24px; border-radius: 6px; margin-bottom: 1rem; }
  .skeleton-text { width: 100%; height: 16px; border-radius: 4px; margin-bottom: 0.5rem; }
  .skeleton-text.short { width: 60%; }
  
  .shimmer {
    background: #e2e8f0;
    background-image: linear-gradient(to right, #e2e8f0 0%, #f1f5f9 20%, #e2e8f0 40%, #e2e8f0 100%);
    background-repeat: no-repeat;
    background-size: 800px 100%;
    animation: placeholderShimmer 1.5s linear infinite forwards;
  }
  @keyframes placeholderShimmer {
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .cat-wrapper { padding: 2rem 1rem; }
    .cat-title { font-size: 2rem; }
    .detail-banner { height: 240px; padding: 1.5rem; }
    .banner-title { font-size: 1.8rem; }
    .cat-grid, .blog-grid { grid-template-columns: 1fr; }
  }
`;
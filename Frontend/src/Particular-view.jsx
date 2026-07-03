import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// --- Inline SVGs for consistent UI ---
const Icons = {
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  ),
  Tag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
  ),
  WhatsApp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
  ),
  LinkedIn: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
  ),
  Twitter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
  ),
  Facebook: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
  ),
  // New Icons for Lightbox & Gallery
  ZoomIn: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
  ),
  PlayCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
  )
};

export default function BlogDetail() {
  const { blog_id } = useParams();
  const navigate = useNavigate();
  const lang = localStorage.getItem("app_lang") || "ta";

  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const currentUrl = window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(blog?.title || "");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE}/read_blog/${blog_id}/?lang=${lang}`);
        setBlog(response.data);
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(lang === "ta" ? "வலைப்பதிவை ஏற்றுவதில் பிழை." : "Failed to load the blog post.");
      } finally {
        setIsLoading(false);
      }
    };

    if (blog_id) fetchBlog();
  }, [blog_id, lang]);

  // Handle Lightbox Keyboard Navigation
  const handleKeyDown = useCallback((e) => {
    if (lightboxIndex === null || !blog?.media) return;
    if (e.key === 'Escape') setLightboxIndex(null);
    if (e.key === 'ArrowRight') nextMedia(e);
    if (e.key === 'ArrowLeft') prevMedia(e);
  }, [lightboxIndex, blog]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const resolveImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE}/${path.replace(/^\//, "")}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const opts = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", opts);
  };

  const openShareWindow = (url, width = 600, height = 500) => {
    window.open(url, 'shareWindow', `width=${width},height=${height},left=24,top=24,scrollbars,resizable`);
  };

  // Lightbox Controls
  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextMedia = (e) => {
    if(e) e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % blog.media.length);
  };

  const prevMedia = (e) => {
    if(e) e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + blog.media.length) % blog.media.length);
  };

  return (
    <>
      <Navbar />
      <div className="blog-wrapper">
        <style>{styles}</style>

        <div className="blog-container">
          {/* Top Navigation Bar */}
          <div className="nav-bar-top">
            <button className="btn-back" onClick={() => navigate('/')}>
              <Icons.ArrowLeft /> {lang === "ta" ? "முகப்பிற்கு செல்க" : "Back to Home"}
            </button>
          </div>

          {isLoading ? (
            <div className="article-layout animation-fade-in">
              <div className="skeleton skeleton-title shimmer"></div>
              <div className="skeleton skeleton-meta shimmer"></div>
              <div className="skeleton skeleton-hero shimmer"></div>
              <div className="skeleton skeleton-text shimmer"></div>
            </div>
          ) : error ? (
            <div className="empty-state error-state glass-card animation-fade-in">
              <h3>{error}</h3>
              <button className="btn-primary mt-3" onClick={() => window.location.reload()}>
                {lang === "ta" ? "மீண்டும் முயற்சிக்கவும்" : "Try Again"}
              </button>
            </div>
          ) : blog ? (
            <article className="article-layout animation-fade-in">
              {/* Header */}
              <header className="article-header">
                {blog.category && (
                  <div className="article-badges">
                    <span className="badge category-badge">{blog.category.name || blog.category.category_name}</span>
                  </div>
                )}

                <h1 className="article-title">{blog.title}</h1>

                <div className="article-meta">
                  <div className="meta-left">
                    <span className="meta-item"><Icons.User /> {blog.author || "Admin"}</span>
                    <span className="meta-item"><Icons.Calendar /> {formatDate(blog.created_at)}</span>
                  </div>

                  {/* Modern Share Row */}
                  <div className="share-row">
                    <span className="share-label">{lang === "ta" ? "பகிர்க:" : "Share:"}</span>
                    <button onClick={() => openShareWindow(`https://web.whatsapp.com/send?text=${encodedTitle} | ${encodedUrl}`)} className="social-icon whatsapp" aria-label="WhatsApp"><Icons.WhatsApp /></button>
                    <button onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)} className="social-icon facebook" aria-label="Facebook"><Icons.Facebook /></button>
                    <button onClick={() => openShareWindow(`https://twitter.com/share?url=${encodedUrl}&text=${encodedTitle}`)} className="social-icon twitter" aria-label="Twitter"><Icons.Twitter /></button>
                    <button onClick={() => openShareWindow(`https://www.linkedin.com/shareArticle?url=${encodedUrl}`)} className="social-icon linkedin" aria-label="LinkedIn"><Icons.LinkedIn /></button>
                  </div>
                </div>
              </header>

              {/* Main Cover / Featured Video */}
              {blog.video_url ? (
                <div className="article-media glass-card">
                  <video controls className="media-item" src={resolveImageUrl(blog.video_url)} poster={resolveImageUrl(blog.image_url)}></video>
                </div>
              ) : blog.image_url ? (
                <div className="article-media glass-card">
                  <img src={resolveImageUrl(blog.image_url)} alt={blog.title} className="media-item" />
                </div>
              ) : null}

              {/* Main Content */}
              <div className="article-body" dangerouslySetInnerHTML={{ __html: blog.content?.replace(/\n/g, '<br />') }} />

              {/* Unique Interactive Media Gallery */}
              {blog.media && blog.media.length > 0 && (
                <div className="article-gallery">
                  <div className="gallery-header">
                    <h3 className="gallery-title">{lang === "ta" ? "புகைப்படங்கள் & காணொளிகள்" : "Media Gallery"}</h3>
                    <span className="gallery-subtitle">Click to expand</span>
                  </div>

                  <div className={`gallery-bento ${blog.media.length < 3 ? 'few-items' : ''}`}>
                    {blog.media.map((item, idx) => (
                      <div
                        key={idx}
                        className={`gallery-item-wrapper hover-lift ${item.type === 'video' ? 'video-item' : ''}`}
                        onClick={() => openLightbox(idx)}
                      >
                        {item.type === "video" ? (
                          <>
                            <video preload="metadata" src={resolveImageUrl(item.path)} className="gallery-media" />
                            <div className="gallery-overlay play-overlay">
                              <Icons.PlayCircle />
                            </div>
                          </>
                        ) : (
                          <>
                            <img src={resolveImageUrl(item.path)} alt={`Media ${idx + 1}`} className="gallery-media" loading="lazy" />
                            <div className="gallery-overlay zoom-overlay">
                              <Icons.ZoomIn />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords / Tags */}
              {blog.keywords && blog.keywords.length > 0 && (
                <div className="article-footer">
                  <div className="tags-container">
                    {blog.keywords.map((keyword, idx) => (
                      <span key={idx} className="tag">
                        <Icons.Tag /> {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ) : null}

          {/* Related/Home Blogs Placeholder */}
          {!isLoading && blog && (
            <div className="related-blogs-section">
              <h3>{lang === "ta" ? "மேலும் படிக்க" : "Explore More Blogs"}</h3>
              <div className="related-action">
                 <button className="btn-primary" onClick={() => navigate('/')}>
                   {lang === "ta" ? "முகப்பு பக்கத்திற்கு செல்லுங்கள்" : "View All Blogs on Home Page"}
                 </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* LIGHTBOX FULLSCREEN OVERLAY */}
      {lightboxIndex !== null && blog?.media && (
        <div className="lightbox-overlay animation-fade-in" onClick={closeLightbox}>
          <button className="lightbox-btn close-btn" onClick={closeLightbox} aria-label="Close">
            <Icons.Close />
          </button>

          {blog.media.length > 1 && (
            <>
              <button className="lightbox-btn nav-btn prev-btn" onClick={prevMedia} aria-label="Previous">
                <Icons.ChevronLeft />
              </button>
              <button className="lightbox-btn nav-btn next-btn" onClick={nextMedia} aria-label="Next">
                <Icons.ChevronRight />
              </button>
            </>
          )}

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {blog.media[lightboxIndex].type === "video" ? (
              <video
                controls
                autoPlay
                src={resolveImageUrl(blog.media[lightboxIndex].path)}
                className="lightbox-media-item shadow-glow"
              />
            ) : (
              <img
                src={resolveImageUrl(blog.media[lightboxIndex].path)}
                alt="Expanded media"
                className="lightbox-media-item shadow-glow"
              />
            )}
            <div className="lightbox-counter">
              {lightboxIndex + 1} / {blog.media.length}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

// --- CSS STYLES ---
const styles = `
  :root {
    --brand-primary: #6366f1;
    --brand-secondary: #4f46e5;
    --bg-start: #f8fafc;
    --bg-end: #e2e8f0;
    --glass-bg: rgba(255, 255, 255, 0.85);
    --glass-border: rgba(255, 255, 255, 0.6);
    --text-main: #0f172a;
    --text-body: #334155;
    --text-muted: #64748b;
    --radius-xl: 32px;
    --radius-lg: 24px;
    --radius-md: 16px;
    --shadow-soft: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    --shadow-hover: 0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .blog-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-start) 0%, var(--bg-end) 100%);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--text-main);
    padding: 3rem 1.5rem;
  }

  .blog-container { max-width: 900px; margin: 0 auto; }

  .animation-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Buttons & Navigation */
  .nav-bar-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
  
  .btn-back {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--glass-bg); border: 1px solid var(--glass-border);
    padding: 0.6rem 1.2rem; border-radius: 99px;
    color: var(--text-main); font-weight: 600; cursor: pointer;
    transition: all 0.2s ease; box-shadow: var(--shadow-soft);
  }
  .btn-back:hover { background: white; transform: translateX(-4px); }

  .btn-primary {
    background: var(--brand-primary); color: white; border: none;
    padding: 0.8rem 1.5rem; border-radius: 99px;
    font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .btn-primary:hover { background: var(--brand-secondary); box-shadow: var(--shadow-hover); }

  /* Glassmorphism */
  .glass-card {
    background: var(--glass-bg); backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border); box-shadow: var(--shadow-soft);
  }

  /* Layout */
  .article-layout {
    background: var(--glass-bg); backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border); border-radius: var(--radius-xl);
    padding: 3.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.04);
  }

  /* Header */
  .article-header { margin-bottom: 2.5rem; }
  .article-title { font-size: 2.75rem; font-weight: 800; line-height: 1.2; margin-bottom: 1.5rem; color: #020617; letter-spacing: -0.02em; }
  
  .article-meta {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.08); flex-wrap: wrap; gap: 1rem;
  }
  .meta-left { display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .meta-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.95rem; color: var(--text-muted); font-weight: 500; }

  /* Social Share Links UI */
  .share-row { display: flex; align-items: center; gap: 0.75rem; }
  .share-label { font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }
  .social-icon {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
    color: white; transition: transform 0.2s, box-shadow 0.2s;
  }
  .social-icon:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.15); }
  .whatsapp { background: #25D366; }
  .facebook { background: #1877F2; }
  .twitter { background: #1DA1F2; }
  .linkedin { background: #0A66C2; }

  /* Media (Images/Video) */
  .article-media { border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 3rem; background: #e2e8f0; }
  .media-item { width: 100%; max-height: 550px; object-fit: cover; display: block; }

  /* Typography & Content */
  .article-body { font-size: 1.15rem; line-height: 1.8; color: var(--text-body); font-family: 'Merriweather', 'Georgia', serif; }
  .article-body p { margin-bottom: 1.5rem; }
  .article-body img { max-width: 100%; border-radius: var(--radius-md); margin: 1.5rem 0; box-shadow: var(--shadow-soft); }

  /* Unique Bento Box Gallery */
  .article-gallery { margin-top: 4rem; padding-top: 2.5rem; border-top: 1px solid rgba(0,0,0,0.08); }
  .gallery-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; }
  .gallery-title { font-size: 1.75rem; font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.01em; color: #020617; }
  .gallery-subtitle { font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }
  
  .gallery-bento {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    grid-auto-rows: 240px;
    gap: 1.25rem;
  }
  .gallery-bento.few-items { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); grid-auto-rows: 300px; }
  
  .gallery-item-wrapper {
    position: relative; width: 100%; height: 100%; border-radius: var(--radius-md); 
    overflow: hidden; cursor: pointer; background: #000;
  }
  
  /* Create spans to make layout look more organic */
  .gallery-item-wrapper:nth-child(4n+1) { grid-column: span 2; grid-row: span 2; }
  @media (max-width: 600px) { .gallery-item-wrapper:nth-child(4n+1) { grid-column: span 1; grid-row: span 1; } }

  .gallery-media {
    width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
    opacity: 0.9;
  }
  
  .gallery-overlay {
    position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: all 0.3s ease; backdrop-filter: blur(2px);
  }
  .play-overlay { opacity: 1; background: rgba(0,0,0,0.2); backdrop-filter: none; }
  
  .gallery-item-wrapper:hover .gallery-media { transform: scale(1.08); opacity: 0.6; }
  .gallery-item-wrapper:hover .gallery-overlay { opacity: 1; }
  
  .hover-lift { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s; }
  .hover-lift:hover { transform: translateY(-8px); box-shadow: var(--shadow-hover); z-index: 2; }

  /* Tags */
  .tags-container { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 3rem; }
  .tag {
    display: inline-flex; align-items: center; gap: 0.4rem; background: white;
    border: 1px solid var(--glass-border); padding: 0.5rem 1rem; border-radius: 99px;
    font-size: 0.85rem; font-weight: 500; color: var(--text-muted); box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  }

  /* Related Blogs Section */
  .related-blogs-section {
    margin-top: 3rem; text-align: center; padding: 3.5rem;
    background: var(--glass-bg); border-radius: var(--radius-xl); border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-soft);
  }
  .related-blogs-section h3 { margin-bottom: 1.5rem; font-size: 1.75rem; font-weight: 700; color: #020617; }

  /* =========================================
     LIGHTBOX STYLES
  ========================================= */
  .lightbox-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
  }
  
  .lightbox-content {
    position: relative; max-width: 90vw; max-height: 90vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  
  .lightbox-media-item {
    max-width: 100%; max-height: 85vh; border-radius: 8px; object-fit: contain;
    box-shadow: 0 0 40px rgba(0,0,0,0.5); user-select: none;
  }
  
  .lightbox-counter {
    position: absolute; bottom: -40px; color: rgba(255,255,255,0.7);
    font-family: 'Inter', sans-serif; font-size: 0.9rem; letter-spacing: 2px;
  }

  .lightbox-btn {
    position: absolute; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2);
    color: white; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s ease; z-index: 10000; backdrop-filter: blur(4px);
  }
  .lightbox-btn:hover { background: white; color: black; transform: scale(1.1); }
  
  .close-btn { top: 20px; right: 20px; width: 48px; height: 48px; }
  .nav-btn { top: 50%; transform: translateY(-50%); width: 56px; height: 56px; }
  .nav-btn:hover { transform: translateY(-50%) scale(1.1); }
  .prev-btn { left: 20px; }
  .next-btn { right: 20px; }

  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .article-layout { padding: 2rem 1.5rem; border-radius: var(--radius-lg); }
    .article-title { font-size: 2.2rem; }
    .article-meta { flex-direction: column; align-items: flex-start; }
    .share-row { margin-top: 1rem; width: 100%; justify-content: flex-start; }
    .gallery-bento { grid-template-columns: 1fr; grid-auto-rows: 250px; }
    .gallery-item-wrapper:nth-child(4n+1) { grid-column: span 1; grid-row: span 1; }
    .nav-btn { width: 40px; height: 40px; }
    .prev-btn { left: 10px; }
    .next-btn { right: 10px; }
  }
`;
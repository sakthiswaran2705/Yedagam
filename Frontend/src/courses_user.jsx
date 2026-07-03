import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Search, Calendar, Clock, IndianRupee, BookOpen,
  AlertCircle, Loader2, CalendarCheck, Clock8, Info, CalendarDays
} from 'lucide-react';
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// --- TRANSLATIONS ---
const translations = {
  en: {
    heroTitle: "Expand Your Knowledge",
    heroSubtitle: "Discover our expertly crafted courses designed to help you achieve your goals and master new skills.",
    searchPlaceholder: "Search for courses...",
    price: "Price",
    startsOn: "Start Date",
    endsOn: "End Date",
    startTime: "Start Time",
    endTime: "End Time",
    status: "Status",
    postedOn: "Posted On",
    noCourses: "No Courses Found",
    noCoursesSub: "We couldn't find any courses matching your search.",
    loading: "Loading amazing courses..."
  },
  ta: {
    heroTitle: "உங்கள் அறிவை விரிவுபடுத்துங்கள்",
    heroSubtitle: "உங்கள் இலக்குகளை அடையவும், புதிய திறன்களை வளர்க்கவும் வடிவமைக்கப்பட்ட சிறந்த பாடநெறிகளைக் கண்டறியவும்.",
    searchPlaceholder: "பாடநெறிகளைத் தேடுங்கள்...",
    price: "விலை",
    startsOn: "தொடக்க தேதி",
    endsOn: "முடிவு தேதி",
    startTime: "தொடக்க நேரம்",
    endTime: "முடிவு நேரம்",
    status: "நிலை",
    postedOn: "பதிவிடப்பட்ட தேதி",
    noCourses: "பாடநெறிகள் எதுவும் இல்லை",
    noCoursesSub: "உங்கள் தேடலுக்குப் பொருந்தக்கூடிய பாடநெறிகள் எதுவும் இல்லை.",
    loading: "பாடநெறிகளை ஏற்றுகிறது..."
  }
};

// --- UTILITIES ---
const getImageUrl = (path) => {
  if (!path) return null;
  const cleanPath = path.replace(/\\/g, '/').replace(/^\//, '');
  return `${API_BASE_URL}/${cleanPath}`;
};

const CourseUser = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang] || translations['en'];

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- FETCH PUBLISHED COURSES ---
  const fetchPublishedCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/published/all/courses/?lang=${lang}`);

      if (!response.ok) throw new Error("Failed to fetch courses");

      const resData = await response.json();

      let fetchedCourses = [];
      if (Array.isArray(resData)) {
        fetchedCourses = resData;
      } else if (resData && Array.isArray(resData.data)) {
        fetchedCourses = resData.data;
      }

      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(lang === 'ta' ? "தரவை ஏற்றுவதில் பிழை" : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    fetchPublishedCourses();
  }, [fetchPublishedCourses]);

  // --- ROBUST SEARCH FILTER LOGIC ---
  const safeSearch = searchQuery.trim().toLowerCase();
  const filteredCourses = courses.filter(course => {
    if (!safeSearch) return true; // If search is empty, show all

    const title = (course.title || "").toLowerCase();
    const desc = (course.description || "").toLowerCase();

    return title.includes(safeSearch) || desc.includes(safeSearch);
  });

  return (
    <div className="user-page-wrapper">
      <Navbar onLanguageChange={setLang} />
      <Toaster position="top-center" />
      <style>{cssStyles}</style>

      {/* --- HERO SECTION --- */}
      <section className="catalog-hero">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="hero-badge"><BookOpen size={16} /> Academy</span>
            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-subtitle">{t.heroSubtitle}</p>

            <div className="hero-search">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>

        <div className="hero-blob blob-1"></div>
        <div className="hero-blob blob-2"></div>
      </section>

      {/* --- COURSES SECTION --- */}
      <section className="courses-section">
        <div className="container">

          {loading ? (
            <div className="courses-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="course-card skeleton">
                  <div className="skel-img"></div>
                  <div className="skel-body">
                    <div className="skel-line title"></div>
                    <div className="skel-line desc"></div>
                    <div className="skel-line desc w-60"></div>
                    <div className="skel-grid">
                       <div className="skel-box"></div>
                       <div className="skel-box"></div>
                       <div className="skel-box"></div>
                       <div className="skel-box"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state"
            >
              <div className="empty-icon"><Search size={48} /></div>
              <h2>{t.noCourses}</h2>
              <p>{t.noCoursesSub}</p>
              <button className="btn-secondary" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            </motion.div>
          ) : (
            <div className="courses-grid">
              <AnimatePresence mode="popLayout">
                {filteredCourses.map((course, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    key={course.id || idx}
                    className="course-card"
                  >
                    <div className="course-image-wrapper">
                      <img
                        src={getImageUrl(course.image_url) || 'https://via.placeholder.com/600x400?text=Course+Image'}
                        alt={course.title}
                        className="course-image"
                        loading="lazy"
                      />
                      <div className="price-tag">
                        <IndianRupee size={16} strokeWidth={3} />
                        <span>{course.price > 0 ? course.price : 'Free'}</span>
                      </div>
                    </div>

                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>

                      {/* FULL Description (No line clamping) */}
                      <p className="course-description-full">
                        {course.description}
                      </p>

                      {/* Detailed Meta Grid showing ALL details */}
                      <div className="detailed-meta-grid">

                        <div className="meta-item">
                          <div className="meta-icon bg-blue"><Calendar size={16} /></div>
                          <div>
                            <span className="meta-label">{t.startsOn}</span>
                            <span className="meta-value">{course.start_date || 'TBA'}</span>
                          </div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-icon bg-red"><CalendarCheck size={16} /></div>
                          <div>
                            <span className="meta-label">{t.endsOn}</span>
                            <span className="meta-value">{course.end_date || 'TBA'}</span>
                          </div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-icon bg-amber"><Clock size={16} /></div>
                          <div>
                            <span className="meta-label">{t.startTime}</span>
                            <span className="meta-value">{course.start_time || 'TBA'}</span>
                          </div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-icon bg-purple"><Clock8 size={16} /></div>
                          <div>
                            <span className="meta-label">{t.endTime}</span>
                            <span className="meta-value">{course.end_time || 'TBA'}</span>
                          </div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-icon bg-green"><Info size={16} /></div>
                          <div>
                            <span className="meta-label">{t.status}</span>
                            <span className="meta-value status-text">{course.status || 'Active'}</span>
                          </div>
                        </div>

                      </div>

                      <div className="course-footer">
                        <div className="posted-date">
                          <CalendarDays size={14} />
                          {t.postedOn}: {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- CSS STYLES FOR USER INTERFACE ---
const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --bg-color: #F8FAFC;
    --text-main: #0F172A;
    --text-muted: #64748B;
    --primary: #4F46E5;
    --primary-hover: #4338CA;
    --accent: #06B6D4;
    --card-bg: #FFFFFF;
    --border: #E2E8F0;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
    --shadow-md: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);
    --shadow-hover: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  }

  .user-page-wrapper {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: var(--bg-color);
    min-height: 100vh;
    color: var(--text-main);
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  /* --- HERO SECTION --- */
  .catalog-hero {
    position: relative;
    background: #0F172A;
    padding: 6rem 1.5rem;
    overflow: hidden;
    text-align: center;
    color: white;
  }

  .hero-content {
    position: relative;
    z-index: 10;
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255,255,255,0.1);
    padding: 0.5rem 1rem;
    border-radius: 99px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.1);
  }

  .hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    line-height: 1.1;
    margin: 0 0 1.5rem;
    background: linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-subtitle {
    font-size: 1.125rem;
    color: #94A3B8;
    margin: 0 auto 2.5rem;
    max-width: 600px;
    line-height: 1.6;
  }

  .hero-search {
    position: relative;
    max-width: 500px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }

  .search-icon {
    position: absolute;
    left: 1.25rem;
    color: var(--text-muted);
  }

  .hero-search input {
    width: 100%;
    padding: 1rem 1rem 1rem 3.25rem;
    border: none;
    background: transparent;
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--text-main);
    outline: none;
    font-family: inherit;
  }

  .hero-search input::placeholder {
    color: #94A3B8;
  }

  .hero-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 1;
    opacity: 0.4;
  }
  .blob-1 { top: -100px; left: -10%; width: 400px; height: 400px; background: var(--primary); }
  .blob-2 { bottom: -150px; right: -5%; width: 500px; height: 500px; background: var(--accent); }

  /* --- COURSES SECTION --- */
  .courses-section {
    padding: 5rem 0;
  }

  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 2.5rem;
  }

  .course-card {
    background: var(--card-bg);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
  }

  .course-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-hover);
    border-color: #CBD5E1;
  }

  .course-image-wrapper {
    position: relative;
    height: 250px;
    width: 100%;
    overflow: hidden;
  }

  .course-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .course-card:hover .course-image {
    transform: scale(1.05);
  }

  .price-tag {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(4px);
    padding: 0.6rem 1.25rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 800;
    color: #166534;
    border: 1px solid #BBF7D0;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .course-content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .course-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
    color: var(--text-main);
    line-height: 1.3;
  }

  .course-description-full {
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.7;
    margin: 0 0 2rem 0;
    white-space: pre-wrap; /* Preserves line breaks if any */
  }

  .detailed-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    background: #F8FAFC;
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid #E2E8F0;
    margin-bottom: 2rem;
  }

  .meta-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .meta-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .bg-blue { background: #EFF6FF; color: #3B82F6; }
  .bg-red { background: #FEF2F2; color: #EF4444; }
  .bg-amber { background: #FFFBEB; color: #F59E0B; }
  .bg-purple { background: #FAF5FF; color: #A855F7; }
  .bg-green { background: #F0FDF4; color: #22C55E; }

  .meta-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .meta-value {
    display: block;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main);
  }
  
  .status-text {
    text-transform: capitalize;
    color: #059669;
  }

  .course-footer {
    margin-top: auto;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .posted-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #94A3B8;
  }

  /* --- EMPTY STATE & LOADING --- */
  .empty-state {
    text-align: center;
    padding: 6rem 2rem;
    background: white;
    border-radius: 24px;
    border: 1px solid var(--border);
    max-width: 600px;
    margin: 0 auto;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    background: #F1F5F9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: #94A3B8;
  }

  .empty-state h2 {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem;
  }

  .empty-state p {
    color: var(--text-muted);
    margin: 0 0 1.5rem;
  }

  .btn-secondary {
    background: var(--bg-color);
    color: var(--text-main);
    border: 1px solid var(--border);
    padding: 0.75rem 1.5rem;
    border-radius: 99px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    background: #E2E8F0;
  }

  /* --- SKELETONS --- */
  .skeleton {
    animation: pulse 1.5s infinite cubic-bezier(0.4, 0, 0.6, 1);
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .skel-img {
    height: 250px;
    background: #E2E8F0;
  }
  .skel-body {
    padding: 2rem;
  }
  .skel-line {
    height: 16px;
    background: #E2E8F0;
    border-radius: 8px;
    margin-bottom: 0.75rem;
  }
  .skel-line.title {
    height: 28px;
    width: 70%;
    margin-bottom: 1.5rem;
  }
  .skel-line.w-60 { width: 60%; margin-bottom: 2rem; }
  
  .skel-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .skel-box {
    height: 60px;
    background: #E2E8F0;
    border-radius: 12px;
  }

  /* --- RESPONSIVE --- */
  @media (max-width: 768px) {
    .catalog-hero { padding: 4rem 1rem; }
    .hero-title { font-size: 2rem; }
    .courses-grid { grid-template-columns: 1fr; }
    .hero-search input { font-size: 0.95rem; }
    .detailed-meta-grid { grid-template-columns: 1fr; gap: 1rem; }
  }
`;

export default CourseUser;
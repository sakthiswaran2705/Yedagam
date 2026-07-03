import React, { useState, useEffect, useRef } from 'react';
import Navbar from "./Navbar.jsx";
import Footer from './Footer.jsx'

// ==========================================
// DATA CONFIGURATION
// ==========================================

const NAV_ITEMS = [
  { id: 'about', en: 'About the Trust', ta: 'நம்பிக்கை பற்றியது' },
  { id: 'vision', en: 'Vision', ta: 'நோக்கம்' },
  { id: 'mission', en: 'Mission', ta: 'பணி' },
  { id: 'history', en: 'History', ta: 'வரலாறு' },
  { id: 'trustees', en: 'Board of Trustees', ta: 'அறங்காவலர் குழு' },
];

const VISION_DATA = [
  {
    icon: '📚',
    titleEn: 'Preserve Tamil Literature',
    titleTa: 'தமிழ் இலக்கியத்தை பாதுகாத்தல்',
    descEn: 'Safeguarding ancient manuscripts and modern literature.',
    descTa: 'பழங்கால ஓலைச்சுவடிகள் மற்றும் நவீன இலக்கியங்களை பாதுகாத்தல்.',
  },
  {
    icon: '🌐',
    titleEn: 'Digital Knowledge for Everyone',
    titleTa: 'அனைவருக்கும் டிஜிட்டல் அறிவு',
    descEn: 'Making resources accessible globally through modern technology.',
    descTa: 'நவீன தொழில்நுட்பத்தின் மூலம் வளங்களை உலகளவில் கிடைக்கச் செய்தல்.',
  },
  {
    icon: '🌱',
    titleEn: 'Inspire Lifelong Learning',
    titleTa: 'வாழ்நாள் முழுவதும் கற்றலை ஊக்குவித்தல்',
    descEn: 'Creating platforms for continuous education and research.',
    descTa: 'தொடர்ச்சியான கல்வி மற்றும் ஆராய்ச்சிக்கான தளங்களை உருவாக்குதல்.',
  },
  {
    icon: '🏛️',
    titleEn: 'Protect Cultural Heritage',
    titleTa: 'பண்பாட்டு பாரம்பரியத்தை பாதுகாத்தல்',
    descEn: 'Documenting and sharing the rich history of Tamil culture.',
    descTa: 'தமிழ் கலாச்சாரத்தின் வளமான வரலாற்றை ஆவணப்படுத்தி பகிர்தல்.',
  },
];



const MISSION_DATA = [
  {
    icon: '📖',
    titleEn: 'Digitize Rare Books',
    titleTa: 'அரிய நூல்களை டிஜிட்டல் வடிவமாக மாற்றுதல்',
    descEn: 'Scanning and archiving out-of-print Tamil books.',
    descTa: 'அச்சில் இல்லாத தமிழ் நூல்களை ஸ்கேன் செய்து ஆவணப்படுத்துதல்.',
  },
  {
    icon: '💡',
    titleEn: 'Encourage Reading',
    titleTa: 'வாசிப்பை ஊக்குவித்தல்',
    descEn: 'Promoting reading habits among the younger generation.',
    descTa: 'இளைய தலைமுறையினரிடையே வாசிப்பு பழக்கத்தை மேம்படுத்துதல்.',
  },
  {
    icon: '🎓',
    titleEn: 'Support Students',
    titleTa: 'மாணவர்களுக்கு ஆதரவு',
    descEn: 'Providing free access to educational materials.',
    descTa: 'கல்விப் பொருட்களை இலவசமாகப் பெற வழியமைத்தல்.',
  },
  {
    icon: '🤝',
    titleEn: 'Knowledge Sharing',
    titleTa: 'அறிவுப் பகிர்வு',
    descEn: 'Hosting seminars, workshops, and digital forums.',
    descTa: 'கருத்தரங்குகள், பயிலரங்குகள் மற்றும் டிஜிட்டல் மன்றங்களை நடத்துதல்.',
  },
  {
    icon: '👥',
    titleEn: 'Community Participation',
    titleTa: 'சமூக பங்களிப்பு',
    descEn: 'Building a network of volunteers and scholars.',
    descTa: 'தொண்டர்கள் மற்றும் அறிஞர்களின் வலையமைப்பை உருவாக்குதல்.',
  },
  {
    icon: '⏳',
    titleEn: 'Preserve History',
    titleTa: 'வரலாற்றைப் பாதுகாத்தல்',
    descEn: 'Archiving historical documents for future reference.',
    descTa: 'எதிர்கால குறிப்புக்காக வரலாற்று ஆவணங்களை சேகரித்தல்.',
  },
];

const HISTORY_DATA = [
  {
    year: 'Phase 1',
    titleEn: 'Foundation', titleTa: 'தொடக்கம்',
    descEn: 'Establishment of Yedagam Trust.', descTa: 'ஏடகம் அறக்கட்டளை நிறுவப்பட்டது.'
  },
  {
    year: 'Phase 2',
    titleEn: 'Digital Archive', titleTa: 'டிஜிட்டல் நூலகம்',
    descEn: 'Launch of the first digital repository.', descTa: 'முதல் டிஜிட்டல் களஞ்சியத்தின் வெளியீடு.'
  },
  {
    year: 'Phase 3',
    titleEn: 'Community Growth', titleTa: 'சமூக வளர்ச்சி',
    descEn: 'Expanding to global Tamil communities.', descTa: 'உலகளாவிய தமிழ் சமூகங்களுக்கு விரிவுபடுத்துதல்.'
  },
  {
    year: 'Phase 4',
    titleEn: 'Educational Outreach', titleTa: 'கல்விச் சேவை',
    descEn: 'Partnerships with educational institutions.', descTa: 'கல்வி நிறுவனங்களுடனான கூட்டாண்மை.'
  },
  {
    year: 'Phase 5',
    titleEn: 'Future Vision', titleTa: 'எதிர்கால இலக்கு',
    descEn: 'A comprehensive global Tamil knowledge hub.', descTa: 'ஒரு விரிவான உலகளாவிய தமிழ் அறிவு மையம்.'
  },
];

const TRUSTEES_DATA = [
  { roleEn: 'Founder', roleTa: 'நிறுவனர்', name: 'Dr. Mani Maran', descEn: 'Visionary behind Yedagam.', descTa: 'ஏடகத்தின் வழிகாட்டி.' },
  { roleEn: 'Treasurer', roleTa: 'பொருளாளர்', name: 'Jayalakshmi', descEn: 'Manages financial trust.', descTa: 'நிதி பொறுப்பாளர்.' },
  { roleEn: 'Secretary', roleTa: 'செயலாளர்', name: 'K. Rajan', descEn: 'Handles communications.', descTa: 'தொடர்புகளை கையாளுகிறார்.' },
  { roleEn: 'Treasurer', roleTa: 'பொருளாளர்', name: 'V. Karthik', descEn: 'Manages financial trust.', descTa: 'நிதி பொறுப்பாளர்.' },
  { roleEn: 'Trustee', roleTa: 'அறங்காவலர்', name: 'Dr. P. Saraswathi', descEn: 'Literature advisor.', descTa: 'இலக்கிய ஆலோசகர்.' },
  { roleEn: 'Vice Chairman', roleTa: 'துணைத் தலைவர்', name: 'M. Anbu', descEn: 'Strategic planning.', descTa: 'மூலோபாய திட்டமிடல்.' },
];

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

const InteractiveCard = ({ children, style, hoverStyle }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      style={{ ...style, ...(isHovered ? hoverStyle : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const About = () => {
  // 1. Manage the language state locally based on what's in localStorage
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });

  const [activeSection, setActiveSection] = useState('about');
  const [isScrolled, setIsScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const sectionRefs = useRef({});

  // 2. Handle language change coming from the Navbar
  const handleLanguageChange = (selectedLang) => {
    setLang(selectedLang);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const scrollPosition = window.scrollY + 200;
      let currentSection = 'about';

      for (const item of NAV_ITEMS) {
        const section = sectionRefs.current[item.id];
        if (section && section.offsetTop <= scrollPosition) {
          currentSection = item.id;
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const section = sectionRefs.current[id];
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  // ==========================================
  // INLINE STYLES (Footer Removed)
  // ==========================================
  const styles = {
    wrapper: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1E293B',
      backgroundColor: '#F8FAFC',
      lineHeight: 1.6,
      overflowX: 'hidden',
    },
    hero: {
      position: 'relative',
      minHeight: isMobile ? '70vh' : '85vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 20px',
      color: 'white',
      overflow: 'hidden',
    },
    heroContent: {
      position: 'relative',
      zIndex: 2,
      maxWidth: '800px',
      animation: 'fadeInUp 1s ease-out forwards',
    },
    heroTitle: {
      fontSize: isMobile ? '2.5rem' : '4rem',
      fontWeight: 800,
      margin: '0 0 20px 0',
      letterSpacing: '-1px',
    },
    heroDesc: {
      fontSize: isMobile ? '1.1rem' : '1.25rem',
      color: '#E2E8F0',
      marginBottom: '15px',
      lineHeight: 1.8,
    },
    navContainer: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      transition: 'all 0.3s ease',
    },
    navScrollArea: {
      display: 'flex',
      justifyContent: isMobile ? 'flex-start' : 'center',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      padding: '10px 20px',
      gap: isMobile ? '15px' : '30px',
    },
    navItem: (isActive) => ({
      cursor: 'pointer',
      padding: '10px 16px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      fontSize: lang === 'ta' ? '0.9rem' : '1rem',
      fontWeight: isActive ? 700 : 500,
      color: isActive ? '#FFFFFF' : '#475569',
      backgroundColor: isActive ? '#0F766E' : 'transparent',
    }),
    section: {
      padding: isMobile ? '60px 20px' : '100px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      textAlign: 'center',
      marginBottom: '60px',
      fontSize: isMobile ? '2rem' : '2.5rem',
      fontWeight: 800,
      color: '#0F172A',
    },
    aboutGrid: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '40px',
      alignItems: 'center',
    },
    aboutImageCard: {
      flex: 1,
      width: '100%',
      minHeight: '300px',
      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.5), 0 10px 30px rgba(0,0,0,0.05)',
      fontSize: '4rem',
    },
    aboutTextCard: {
      flex: 1,
      background: 'white',
      padding: isMobile ? '30px' : '40px',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
    },
    aboutPara: {
      fontSize: '1.1rem',
      color: '#334155',
      lineHeight: 1.8,
    },
    grid: (cols) => ({
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : `repeat(${cols}, 1fr)`,
      gap: '24px',
    }),
    card: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 1)',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease',
      cursor: 'default',
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 30px rgba(37, 99, 235, 0.1)',
      background: 'white',
      border: '1px solid rgba(226, 232, 240, 1)',
    },
    iconWrap: {
      fontSize: '2.5rem',
      marginBottom: '20px',
      display: 'inline-block',
      padding: '15px',
      background: '#EFF6FF',
      borderRadius: '16px',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#0F172A',
      margin: '0 0 10px 0',
    },
    cardDesc: {
      fontSize: '0.95rem',
      color: '#475569',
      margin: 0,
    },
    timelineWrap: {
      position: 'relative',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px 0',
    },
    timelineLine: {
      position: 'absolute',
      left: isMobile ? '20px' : '50%',
      top: 0,
      bottom: 0,
      width: '4px',
      background: 'linear-gradient(to bottom, #3B82F6, #93C5FD)',
      transform: isMobile ? 'none' : 'translateX(-50%)',
      borderRadius: '4px',
    },
    timelineItem: {
      display: 'flex',
      justifyContent: isMobile ? 'flex-start' : 'center',
      alignItems: 'center',
      width: '100%',
      marginBottom: '40px',
      position: 'relative',
    },
    timelineContent: (isEven) => ({
      width: isMobile ? 'calc(100% - 50px)' : '45%',
      marginLeft: isMobile ? '50px' : (isEven ? 'auto' : '0'),
      marginRight: isMobile ? '0' : (isEven ? '0' : 'auto'),
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      border: '1px solid #E2E8F0',
      position: 'relative',
      textAlign: isMobile ? 'left' : (isEven ? 'left' : 'right'),
    }),
    timelineDot: {
      position: 'absolute',
      left: isMobile ? '12px' : '50%',
      transform: isMobile ? 'none' : 'translateX(-50%)',
      width: '20px',
      height: '20px',
      background: '#2563EB',
      borderRadius: '50%',
      border: '4px solid #EFF6FF',
      boxShadow: '0 0 0 4px white',
      zIndex: 2,
    },
    timelineYear: {
      fontSize: '0.85rem',
      fontWeight: 700,
      color: '#3B82F6',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '8px',
    },
    profileAvatar: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #E2E8F0 0%, #F8FAFC 100%)',
      margin: '0 auto 20px auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.5rem',
      color: '#94A3B8',
      border: '4px solid #EFF6FF',
    },
    profileRole: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#2563EB',
      margin: '0 0 15px 0',
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* 3. Pass the callback to the Navbar */}
      <Navbar onLanguageChange={handleLanguageChange} />

      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .nav-scroll::-webkit-scrollbar { display: none; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .bg-circle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
          animation: float 8s ease-in-out infinite;
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section style={styles.hero}>
        <div className="bg-circle" style={{ width: '400px', height: '400px', top: '-100px', left: '-100px' }} />
        <div className="bg-circle" style={{ width: '600px', height: '600px', bottom: '-200px', right: '-150px', animationDelay: '2s' }} />

        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            {lang === 'ta' ? "ஏடகம் பற்றி" : "About Yedagam"}
          </h1>
          <p style={styles.heroDesc}>
            {lang === 'ta'
              ? "ஏடகம் என்பது தமிழ் இலக்கியம், அரிய நூல்கள், கல்வி வளங்கள் மற்றும் பண்பாட்டு பாரம்பரியத்தை பாதுகாக்க உருவாக்கப்பட்ட டிஜிட்டல் அறிவுக் களஞ்சியம்."
              : "Yedagam is a digital knowledge initiative dedicated to preserving Tamil literature, rare books, educational resources, and cultural heritage."}
          </p>
        </div>
      </section>

      {/* 2. STICKY NAVIGATION */}
      <nav style={styles.navContainer}>
        <div style={styles.navScrollArea} className="nav-scroll">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              style={styles.navItem(activeSection === item.id)}
              onClick={() => scrollToSection(item.id)}
            >
              {lang === 'ta' ? item.ta : item.en}
            </div>
          ))}
        </div>
      </nav>

      {/* SECTION 1: ABOUT THE TRUST */}
      <section ref={(el) => (sectionRefs.current['about'] = el)} style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {lang === 'ta' ? "அறக்கட்டளை பற்றி" : "About the Trust"}
        </h2>

        <div style={styles.aboutGrid}>
          <div style={styles.aboutImageCard}>🏛️</div>
          <div style={styles.aboutTextCard}>
            <p style={styles.aboutPara}>
              {lang === 'ta'
                ? "ஏடகம் என்பது தமிழ் நூல்கள், இலக்கியம், கல்வி வளங்கள், வரலாற்று ஆவணங்கள் மற்றும் பண்பாட்டு பாரம்பரியத்தை பாதுகாக்க உருவாக்கப்பட்ட டிஜிட்டல் அறிவுக் களஞ்சியம். நவீன தொழில்நுட்பத்தின் மூலம் அறிவை அனைவருக்கும் எளிதாக வழங்குவதே எங்களின் நோக்கமாகும்."
                : "Yedagam is a charitable digital initiative established to preserve Tamil books, literature, manuscripts, educational resources, and cultural heritage. The platform provides open access to knowledge through modern technology while encouraging education, research, and reading among future generations."}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: VISION */}
      <section ref={(el) => (sectionRefs.current['vision'] = el)} style={{ ...styles.section, backgroundColor: '#F1F5F9' }}>
        <h2 style={styles.sectionTitle}>
          {lang === 'ta' ? "எங்கள் நோக்கம்" : "Our Vision"}
        </h2>

        <div style={styles.grid(2)}>
          {VISION_DATA.map((item, index) => (
            <InteractiveCard key={index} style={styles.card} hoverStyle={styles.cardHover}>
              <div style={styles.iconWrap}>{item.icon}</div>
              <h4 style={styles.cardTitle}>{lang === 'ta' ? item.titleTa : item.titleEn}</h4>
              <p style={styles.cardDesc}>{lang === 'ta' ? item.descTa : item.descEn}</p>
            </InteractiveCard>
          ))}
        </div>
      </section>

      {/* SECTION 3: MISSION */}
      <section ref={(el) => (sectionRefs.current['mission'] = el)} style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {lang === 'ta' ? "எங்கள் பணி" : "Our Mission"}
        </h2>

        <div style={styles.grid(3)}>
          {MISSION_DATA.map((item, index) => (
            <InteractiveCard key={index} style={styles.card} hoverStyle={styles.cardHover}>
              <div style={styles.iconWrap}>{item.icon}</div>
              <h4 style={styles.cardTitle}>{lang === 'ta' ? item.titleTa : item.titleEn}</h4>
              <p style={styles.cardDesc}>{lang === 'ta' ? item.descTa : item.descEn}</p>
            </InteractiveCard>
          ))}
        </div>
      </section>

      {/* SECTION 4: HISTORY */}
      <section ref={(el) => (sectionRefs.current['history'] = el)} style={{ ...styles.section, backgroundColor: '#F1F5F9' }}>
        <h2 style={styles.sectionTitle}>
          {lang === 'ta' ? "வரலாறு" : "History & Milestones"}
        </h2>

        <div style={styles.timelineWrap}>
          <div style={styles.timelineLine} />
          {HISTORY_DATA.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={index} style={styles.timelineItem}>
                <div style={styles.timelineDot} />
                <div style={styles.timelineContent(isEven)}>
                  <div style={styles.timelineYear}>{item.year}</div>
                  <h4 style={styles.cardTitle}>{lang === 'ta' ? item.titleTa : item.titleEn}</h4>
                  <p style={styles.cardDesc}>{lang === 'ta' ? item.descTa : item.descEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: BOARD OF TRUSTEES */}
      <section ref={(el) => (sectionRefs.current['trustees'] = el)} style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {lang === 'ta' ? "அறங்காவலர் குழு" : "Board of Trustees"}
        </h2>

        <div style={styles.grid(3)}>
          {TRUSTEES_DATA.map((person, index) => (
            <InteractiveCard key={index} style={{...styles.card, textAlign: 'center'}} hoverStyle={styles.cardHover}>
              <div style={styles.profileAvatar}>👤</div>
              <h4 style={styles.cardTitle}>{person.name}</h4>
              <div style={styles.profileRole}>{lang === 'ta' ? person.roleTa : person.roleEn}</div>
              <p style={styles.cardDesc}>{lang === 'ta' ? person.descTa : person.descEn}</p>
            </InteractiveCard>
          ))}
        </div>
      </section>
        <Footer />
    </div>
  );
};

export default About;
import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from './authFetch';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const dashboardTranslations = {
  en: {
    title: 'Membership Applications',
    loadingText: 'Fetching membership records from database...',
    emptyText: 'No membership applications found.',
    errorText: 'Unable to load membership applications. Please try again.',
    searchPlaceholder: 'Search by applicant name or mobile number...',
    filterAll: 'All Teaching Courses',
    sortLatest: 'Newest Submissions First',
    sortOldest: 'Oldest Submissions First',
    refreshBtn: 'Refresh Data',

    // Table Headers
    thCourse: 'Teaching Course',
    thName: 'Name',
    thFather: 'Father/Husband Name',
    thDob: 'Date of Birth',
    thQual: 'Qualification',
    thAddress: 'Office/College Address',
    thMobile: 'Mobile Number',
    thExtra: 'Extra Qualification',
    thPhoto: 'Photo',
    thAadhaar: 'Aadhaar Card',
    thSubmitted: 'Submitted Date',
    thActions: 'Actions',

    viewFile: 'View Document',
    deleteConfirm: 'Are you sure you want to delete this application?',
    deleteError: 'Failed to delete the application. Please try again.',
    prevPage: 'Previous',
    nextPage: 'Next',
    pageIndicator: 'Page'
  },
  ta: {
    title: 'உறுப்பினர் சேர்க்கை விண்ணப்பங்கள்',
    loadingText: 'விண்ணப்ப விவரங்கள் ஏற்றப்படுகின்றன...',
    emptyText: 'உறுப்பினர் சேர்க்கை விண்ணப்பங்கள் எதுவும் இல்லை.',
    errorText: 'உறுப்பினர் விவரங்களை ஏற்றுவதில் தோல்வி ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
    searchPlaceholder: 'விண்ணப்பத்தாரர் பெயர் அல்லது கைப்பேசி மூலம் தேடவும்...',
    filterAll: 'அனைத்துப் பாடங்கள்',
    sortLatest: 'புதிய விண்ணப்பங்கள் முதலில்',
    sortOldest: 'பழைய விண்ணப்பங்கள் முதலில்',
    refreshBtn: 'புதுப்பி',

    // Table Headers
    thCourse: 'பாடம்',
    thName: 'பெயர்',
    thFather: 'தந்தை/கணவர் பெயர்',
    thDob: 'பிறந்த தேதி',
    thQual: 'கல்வித் தகுதி',
    thAddress: 'அலுவலகம்/கல்லூரி முகவரி',
    thMobile: 'கைப்பேசி எண்',
    thExtra: 'கூடுதல் தகுதி',
    thPhoto: 'புகைப்படம்',
    thAadhaar: 'ஆதார் அட்டை',
    thSubmitted: 'சமர்ப்பிக்கப்பட்ட தேதி',
    thActions: 'செயல்கள்',

    viewFile: 'ஆவணத்தைப் பார்',
    deleteConfirm: 'இந்த விண்ணப்பத்தை நீக்க விரும்புகிறீர்களா என்பதில் உறுதியாக இருக்கிறீர்களா?',
    deleteError: 'விண்ணப்பத்தை நீக்குவதில் தோல்வி ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
    prevPage: 'முந்தைய',
    nextPage: 'அடுத்த',
    pageIndicator: 'பக்கம்'
  }
};

const AdminMembershipDashboard = () => {
  const [lang] = useState(() => localStorage.getItem("app_lang") || "en");
  const text = dashboardTranslations[lang];

  // Core Lifecycle States
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering, Sorting & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [sortByDate, setSortByDate] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search query to prevent backend slowdowns
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Clean asset url utility
  const resolveAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.replace(/^\//, '');
    return `${API_BASE_URL}/${cleanPath}`;
  };

  // Fetch Logic
  const fetchMembershipApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedFetch('/membership/form/', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setMemberships(data);
      } else {
        setError(text.errorText);
      }
    } catch (err) {
      console.error("API connection failure:", err);
      setError(text.errorText);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on mount
  useEffect(() => {
    fetchMembershipApplications();
  }, []);

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm(text.deleteConfirm)) return;
    try {
      const response = await authenticatedFetch(`/membership/form/${id}/`, { method: 'DELETE' });
      if (response.ok) {
        setMemberships((prev) => prev.filter((member) => member.id !== id));
      } else {
        alert(text.deleteError);
      }
    } catch (err) {
      console.error("Delete pipeline error:", err);
      alert(text.deleteError);
    }
  };

  // Filter & Sort Computations
  const processedRecords = memberships
    .filter((member) => {
      const query = debouncedSearch.toLowerCase();
      const matchesSearch = !query || (member.name?.toLowerCase().includes(query)) || (member.mobile_no?.includes(query));
      const matchesCourse = !courseFilter || member.teaching_course === courseFilter;
      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => {
      const dateA = new Date(a.submitted_date || 0);
      const dateB = new Date(b.submitted_date || 0);
      return sortByDate === 'latest' ? dateB - dateA : dateA - dateB;
    });

  // Pagination Splitting Segment
  const totalPages = Math.ceil(processedRecords.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = processedRecords.slice(indexOfFirstItem, indexOfLastItem);

  const uniqueCourses = ['தமிழ்ச் சுவடியியல்', 'கல்வெட்டியல்', 'கிரந்த எழுத்துகள்', 'செப்பேடுகள்', 'சோதிடவியல்'];

  return (
    <div className="admin-dashboard-wrapper">
      <style>{`
        .admin-dashboard-wrapper { width: 100%; color: #334155; font-family: system-ui, -apple-system, sans-serif; }
        .dashboard-header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px; }
        .dashboard-header-bar h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
        .refresh-action-btn { background-color: #2563eb; color: #ffffff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: background 0.2s; }
        .refresh-action-btn:hover { background-color: #1d4ed8; }

        .dashboard-utilities-panel { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .dashboard-utilities-panel input, .dashboard-utilities-panel select { padding: 11px 14px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.92rem; color: #334155; background-color: #ffffff; width: 100%; box-sizing: border-box; outline: none; }
        .dashboard-utilities-panel input:focus, .dashboard-utilities-panel select:focus { border-color: #2563eb; }

        .status-alert-banner { padding: 16px; border-radius: 6px; font-weight: 600; text-align: center; margin-bottom: 20px; font-size: 0.95rem; }
        .status-alert-banner.error { background-color: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
        .status-loading-spinner { text-align: center; padding: 60px 20px; color: #64748b; font-weight: 600; font-size: 1rem; }
        .status-empty-state { text-align: center; padding: 80px 20px; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 8px; font-weight: 600; font-size: 1.1rem; }

        .table-scroll-container { width: 100%; overflow-x: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
        .membership-data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
        .membership-data-table th { background-color: #f8fafc; color: #475569; font-weight: 700; padding: 14px 16px; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
        .membership-data-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
        .membership-data-table tr:hover { background-color: #f8fafc; }

        .table-photo-preview { width: 45px; height: 55px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1; display: block; background: #f1f5f9; }
        .table-document-anchor { display: inline-flex; align-items: center; gap: 4px; color: #2563eb; text-decoration: none; font-weight: 600; font-size: 0.85rem; }
        .table-document-anchor:hover { text-decoration: underline; }

        /* Clean Emoji Trash Bin Button Style */
        .table-delete-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; padding: 6px; border-radius: 6px; transition: background 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .table-delete-btn:hover { background-color: #fee2e2; }

        /* Pagination Controls CSS */
        .dashboard-pagination-ctrls { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; padding: 10px 0; }
        .pagination-action-btn { background-color: #ffffff; color: #334155; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all 0.15s; }
        .pagination-action-btn:hover:not(:disabled) { background-color: #f8fafc; border-color: #94a3b8; }
        .pagination-action-btn:disabled { color: #cbd5e1; border-color: #e2e8f0; cursor: not-allowed; }
        .pagination-status-text { font-size: 0.9rem; font-weight: 500; color: #475569; }

        .white-space-normal { white-space: normal; min-width: 180px; line-height: 1.4; }
        .timestamp-nowrap { white-space: nowrap; color: #64748b; }
      `}</style>

      <div className="dashboard-header-bar">
        <h1>{text.title}</h1>
        <button type="button" className="refresh-action-btn" onClick={fetchMembershipApplications}>
          🔄 {text.refreshBtn}
        </button>
      </div>

      <div className="dashboard-utilities-panel">
        <input type="text" placeholder={text.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">{text.filterAll}</option>
          {uniqueCourses.map((course, index) => <option key={index} value={course}>{course}</option>)}
        </select>
        <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
          <option value="latest">{text.sortLatest}</option>
          <option value="oldest">{text.sortOldest}</option>
        </select>
      </div>

      {error && <div className="status-alert-banner error">{error}</div>}

      {loading ? (
        <div className="status-loading-spinner">⌛ {text.loadingText}</div>
      ) : currentRecords.length === 0 ? (
        <div className="status-empty-state">📂 {text.emptyText}</div>
      ) : (
        <>
          <div className="table-scroll-container">
            <table className="membership-data-table">
              <thead>
                <tr>
                  <th>{text.thCourse}</th>
                  <th>{text.thName}</th>
                  <th>{text.thFather}</th>
                  <th>{text.thDob}</th>
                  <th>{text.thQual}</th>
                  <th>{text.thAddress}</th>
                  <th>{text.thMobile}</th>
                  <th>{text.thExtra}</th>
                  <th>{text.thPhoto}</th>
                  <th>{text.thAadhaar}</th>
                  <th>{text.thSubmitted}</th>
                  <th style={{ textAlign: 'center' }}>{text.thActions}</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((member, index) => (
                  <tr key={member.id || index}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{member.teaching_course}</td>
                    <td style={{ fontWeight: 500 }}>{member.name}</td>
                    <td>{member.father_or_husband_name}</td>
                    <td className="timestamp-nowrap">
                      {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td>{member.qualification}</td>
                    <td className="white-space-normal">{member.office_or_college_address}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{member.mobile_no}</td>
                    <td>{member.extra_qualification || '-'}</td>
                    <td>
                      <img
                        src={member.photo_path ? resolveAssetUrl(member.photo_path) : 'https://via.placeholder.com/150'}
                        alt={member.name}
                        className="table-photo-preview"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                      />
                    </td>
                    <td>
                      {member.file_path ? (
                        <a
                          href={resolveAssetUrl(member.file_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="table-document-anchor"
                        >
                          📄 {text.viewFile}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="timestamp-nowrap">
                      {member.submitted_date ? new Date(member.submitted_date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB') : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="table-delete-btn"
                        title="Delete Application"
                        onClick={() => handleDelete(member.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dashboard-pagination-ctrls">
            <button
              type="button"
              className="pagination-action-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              ← {text.prevPage}
            </button>
            <span className="pagination-status-text">
              {text.pageIndicator} {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="pagination-action-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              {text.nextPage} →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminMembershipDashboard;

import React from 'react';

const Footer = () => {
  // Enhanced, structured inline styles
  const styles = {
    footer: {
      backgroundColor: '#121212',
      color: '#a0a0a0',
      padding: '48px 20px 24px',
      fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32px',
      borderTop: '1px solid #2a2a2a',
      boxSizing: 'border-box',
      width: '100%',
    },
    navContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '24px',
    },
    navLink: {
      color: '#d1d1d1',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
    },
    socialContainer: {
      display: 'flex',
      gap: '16px',
    },
    socialButton: {
      backgroundColor: '#2a2a2a',
      color: '#ffffff',
      textDecoration: 'none',
      fontSize: '13px',
      fontWeight: '600',
      padding: '10px 20px',
      borderRadius: '6px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
    bottomText: {
      margin: '0',
      fontSize: '13px',
      letterSpacing: '0.5px',
      fontWeight: '400',
      textAlign: 'center',
      lineHeight: '1.5',
      borderTop: '1px solid #2a2a2a',
      paddingTop: '24px',
      width: '100%',
      maxWidth: '800px',
    },
    brand: {
      color: '#ffffff',
      fontWeight: '600',
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      {/* 1. Navigation Links */}
      <nav style={styles.navContainer}>
        {/* Note: If using React Router, replace these <a> tags with <Link to="..."> */}
        <a href="/Contact" style={styles.navLink}>Contact Us</a>
        <a href="/shipping-policy" style={styles.navLink}>Shipping Policy</a>
        <a href="/privacy-policy" style={styles.navLink}>Privacy Policy</a>
        <a href="/terms-conditions" style={styles.navLink}>Terms & Conditions</a>
        <a href="/CancellationRefundPolicy" style={styles.navLink}>Cancellation & Refund</a>
      </nav>

      {/* 2. Social Media Buttons */}
      <div style={styles.socialContainer}>
        <a
          href="https://www.facebook.com/pages/category/Personal-Blog/yedagam-2016683731882651/"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.socialButton}
        >
          Facebook
        </a>
        <a
          href="https://www.youtube.com/channel/UCdzmCFRdTZbAeu2OUY1G9DA"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.socialButton}
        >
          YouTube
        </a>
      </div>

      {/* 3. Copyright Information */}
      <p style={styles.bottomText}>
        Copyright &copy; {currentYear} <span style={styles.brand}>Chola Info Technologies</span>. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
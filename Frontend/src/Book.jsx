import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Book() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "en");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const translations = {
    en: {
      pageTitle: "Our Library",
      pageSubtitle: "Discover our latest published books.",
      author: "Author",
      price: "Price",
      offer: "Offer",
      pages: "Pages",
      noBooks: "No books found at the moment.",
      error: "Failed to load books. Please try again later.",
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      cartTotal: "Cart Total",
      checkout: "Checkout",
      viewCart: "View Cart",
      cartTitle: "Your Cart",
      emptyCart: "Your cart is empty.",
      continueShopping: "Continue Shopping"
    },
    ta: {
      pageTitle: "நூலகம்",
      pageSubtitle: "எங்கள் சமீபத்திய வெளியீடுகளைக் கண்டறியவும்.",
      author: "ஆசிரியர்",
      price: "விலை",
      offer: "சலுகை",
      pages: "பக்கங்கள்",
      noBooks: "தற்போது புத்தகங்கள் எதுவும் இல்லை.",
      error: "புத்தகங்களை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
      addToCart: "கார்ட்டில் சேர்",
      buyNow: "இப்போதே வாங்கு",
      cartTotal: "மொத்த விலை",
      checkout: "பணம் செலுத்து",
      viewCart: "கார்ட் பார்க்க",
      cartTitle: "உங்கள் கார்ட்",
      emptyCart: "உங்கள் கார்ட் காலியாக உள்ளது.",
      continueShopping: "தொடர்ந்து வாங்க"
    },
  };

  const t = translations[lang];

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const cleanPath = url.replace(/\\/g, '/').replace(/^\//, '');
    const baseUrl = (BACKEND_URL || '').replace(/\/$/, '');
    return `${baseUrl}/${cleanPath}`;
  };

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${BACKEND_URL}/published/all/?lang=${lang}`
        );
        setBooks(response.data);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [lang, t.error]);

  // --- Cart & Purchasing Logic ---

  const handleAddToCart = (book) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === book.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...book, quantity: 1 }];
    });
    // Open cart drawer for better UX when they add an item
    setIsCartOpen(true);
  };

  const updateQuantity = (bookId, change) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === bookId) {
          const newQuantity = item.quantity + change;
          // Prevent reducing below 1 via this button (use remove button instead)
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      });
    });
  };

  const removeFromCart = (bookId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== bookId));
    if (cart.length === 1) {
      setIsCartOpen(false); // Close drawer if last item removed
    }
  };

  const handleBuyNow = (book) => {
    const price = book.offer ? parseFloat(book.offer) : parseFloat(book.price) || 0;
    navigate("/pay", {
      state: {
        items: [{ ...book, quantity: 1 }],
        total: price
      }
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/pay", { state: { items: cart, total: cartTotalAmount } });
  };

  // Calculate totals
  const cartTotalAmount = cart.reduce((total, item) => {
    const price = item.offer ? parseFloat(item.offer) : parseFloat(item.price) || 0;
    return total + price * item.quantity;
  }, 0);

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <>
      <Navbar onLanguageChange={setLang} />

      <main className="books-page">
        <header className="page-header">
          <h1 className="title">{t.pageTitle}</h1>
          <p className="subtitle">{t.pageSubtitle}</p>
        </header>

        <div className="books-container">
          {error && (
            <div className="alert error-alert">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          {loading ? (
            <div className="books-grid">
              {[1, 2, 3, 4, 5, 6].map((skel) => (
                <div key={skel} className="book-card skeleton-card">
                  <div className="skeleton-img pulse"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line pulse w-80"></div>
                    <div className="skeleton-line pulse w-50"></div>
                    <div className="skeleton-line pulse w-100 mt-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 && !error ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1" fill="none">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <h2>{t.noBooks}</h2>
            </div>
          ) : (
            <div className="books-grid">
              {books.map((book) => {
                const displayPrice = book.offer ? book.offer : book.price;
                const hasOffer = !!book.offer;

                return (
                  <article key={book.id} className="book-card">
                    <div className="book-image-wrapper">
                      {hasOffer && (
                        <span className="offer-badge">Offer</span>
                      )}
                      {book.image_url ? (
                        <img
                          src={getImageUrl(book.image_url)}
                          alt={book.title}
                          className="book-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}

                      <div className="book-cover-placeholder" style={{ display: book.image_url ? 'none' : 'flex' }}>
                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="#94a3b8" strokeWidth="1" fill="none">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                      </div>
                    </div>

                    <div className="book-content">
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">
                        {t.author}: <span>{book.author}</span>
                      </p>

                      <div className="book-description">
                        {book.description || "No description available."}
                      </div>

                      <div className="book-meta">
                        {displayPrice && (
                          <div className="meta-item">
                            <span className="meta-label">{t.price}</span>
                            <div className="meta-price-box">
                              <span className="meta-value price">₹{displayPrice}</span>
                              {hasOffer && <span className="original-price">₹{book.price}</span>}
                            </div>
                          </div>
                        )}
                        {book.pages && (
                          <div className="meta-item">
                            <span className="meta-label">{t.pages}</span>
                            <span className="meta-value">{book.pages}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="book-actions">
                        <button onClick={() => handleAddToCart(book)} className="btn btn-secondary">
                          {t.addToCart}
                        </button>
                        <button onClick={() => handleBuyNow(book)} className="btn btn-primary">
                          {t.buyNow}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Summary Button */}
      {cart.length > 0 && !isCartOpen && (
        <div className="floating-cart" onClick={() => setIsCartOpen(true)}>
          <div className="cart-info">
            <span className="cart-count">{cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}</span>
            <span className="cart-total">{t.cartTotal}: ₹{cartTotalAmount}</span>
          </div>
          <button className="btn btn-checkout">
            {t.viewCart} &rarr;
          </button>
        </div>
      )}

      {/* Cart Drawer Modal */}
{isCartOpen && (
  <>
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>
    <div className="cart-drawer">
      {/* Header */}
      <div className="cart-drawer-header">
        <h2>🛒 Shopping Cart</h2>
        <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>✕</button>
      </div>

      {/* Body */}
      <div className="cart-drawer-body">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>{t.emptyCart}</p>
            <button className="btn btn-secondary" onClick={() => setIsCartOpen(false)}>
              {t.continueShopping}
            </button>
          </div>
        ) : (
          <div className="cart-items-list">
            {cart.map((item) => {
              const currentPrice = item.offer ? parseFloat(item.offer) : parseFloat(item.price);
              const originalPrice = item.offer ? parseFloat(item.price) : null;

              return (
                <div key={item.id} className="cart-card">
                  <div className="cart-card-img">
                    {item.image_url ? (
                      <img src={getImageUrl(item.image_url)} alt={item.title} />
                    ) : (
                      <div className="placeholder-img" />
                    )}
                  </div>

                  <div className="cart-card-details">
                    <h4>{item.title}</h4>
                    <p className="author">{item.author}</p>

                    <div className="price-row">
                      <span className="current-price">₹{currentPrice}</span>
                      {originalPrice && <span className="original-price">₹{originalPrice}</span>}
                    </div>

                    <div className="card-actions">
                      <div className="qty-selector">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>🗑</button>
                    </div>
                  </div>
                  <div className="cart-card-total">₹{currentPrice * item.quantity}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="cart-drawer-footer">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotalAmount}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{cartTotalAmount}</span>
          </div>
          <button onClick={handleCheckout} className="btn-proceed">
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  </>
)}

      <style>{`
        /* ===========================
           Variables & Resets
        =========================== */
        :root {
          --primary: #10b981;
          --primary-dark: #059669;
          --primary-light: #d1fae5;
          --bg-main: #f8fafc;
          --bg-card: #ffffff;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --danger: #ef4444;
          --danger-light: #fee2e2;
          --radius-lg: 16px;
          --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          --shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* ===========================
           Layout
        =========================== */
        .books-page {
          min-height: 100vh;
          background: var(--bg-main);
          background-image: radial-gradient(var(--border) 1px, transparent 1px);
          background-size: 24px 24px;
          padding: 60px 20px 120px 20px; 
        }

        .books-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ===========================
           Header
        =========================== */
        .page-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .title {
          font-size: 36px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }

        .subtitle {
          font-size: 18px;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }

        /* ===========================
           Grid & Cards
        =========================== */
        .books-grid {
          display: grid;
          align-items: start;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 32px;
        }

        .book-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          position: relative;
          height: 100%;
        }

        .book-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-hover);
          border-color: #cbd5e1;
        }

        /* ===========================
           Image Section
        =========================== */
        .book-image-wrapper {
          position: relative;
          width: 100%;
          height: 260px;
          background: #f1f5f9;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--border);
        }

        .book-cover {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 1rem;
          transition: transform 0.4s ease;
        }

        .book-card:hover .book-cover {
          transform: scale(1.05);
        }

        .book-cover-placeholder {
          color: var(--text-muted);
          opacity: 0.5;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        .offer-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f59e0b;
          color: white;
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          z-index: 10;
          box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);
        }

        /* ===========================
           Content Section
        =========================== */
        .book-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .book-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .book-author {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        .book-author span {
          font-weight: 600;
          color: var(--text-main);
        }

        .book-description {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 24px;
          white-space: pre-wrap;
          flex-grow: 1;
        }

        /* ===========================
           Meta Footer
        =========================== */
        .book-meta {
          display: flex;
          justify-content: flex-start;
          gap: 32px;
          align-items: center;
          padding-top: 20px;
          border-top: 1px dashed var(--border);
          background: #fafaf9;
          margin: 0 -24px 0 -24px;
          padding: 20px 24px;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
        }

        .meta-label {
          font-size: 12px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 4px;
        }

        .meta-price-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .meta-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .meta-value.price {
          color: var(--primary-dark);
          font-size: 20px;
        }

        .original-price {
          font-size: 14px;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 500;
        }

        /* ===========================
           Action Buttons
        =========================== */
        .book-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .btn {
          flex: 1;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          border: none;
          text-align: center;
          display: inline-block;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
        }

        .btn-secondary {
          background: var(--bg-main);
          color: var(--text-main);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .btn-block {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          border-radius: 12px;
        }

        .mt-3 {
          margin-top: 16px;
        }

        /* ===========================
           Floating Cart Tracker
        =========================== */
        .floating-cart {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: white;
          padding: 16px 24px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 24px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          z-index: 90;
          width: 90%;
          max-width: 500px;
          justify-content: space-between;
          animation: slideUpFloat 0.3s ease-out;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .floating-cart:hover {
          transform: translateX(-50%) scale(1.02);
        }

        .cart-info {
          display: flex;
          flex-direction: column;
        }

        .cart-count {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
        }

        .cart-total {
          font-size: 18px;
          font-weight: 700;
        }

        .btn-checkout {
          background: var(--primary);
          color: white;
          padding: 10px 24px;
          border-radius: 99px;
          white-space: nowrap;
        }

        @keyframes slideUpFloat {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        /* ===========================
           Cart Drawer Modal
        =========================== */
        .cart-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 99;
          animation: fadeIn 0.3s ease;
        }

        .cart-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 450px;
          background: #fff;
          z-index: 100;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .cart-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--border);
        }

        .cart-drawer-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
        }

        .close-cart-btn {
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: background 0.2s;
        }
        
        .close-cart-btn:hover {
          background: #e2e8f0;
          color: var(--text-main);
        }

        .cart-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          text-align: center;
        }
        
        .cart-empty svg {
          margin-bottom: 16px;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .cart-item {
          display: flex;
          gap: 16px;
          padding-bottom: 24px;
          border-bottom: 1px dashed var(--border);
          align-items: center;
        }

        .cart-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .cart-item-img-box {
          width: 72px;
          height: 96px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .cart-item-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-details {
          flex: 1;
        }

        .cart-item-details h4 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .cart-item-price {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .cart-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .qty-selector {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
          height: 32px;
        }

        .qty-btn {
          background: #f8fafc;
          border: none;
          width: 32px;
          height: 100%;
          font-size: 16px;
          cursor: pointer;
          color: var(--text-main);
          transition: background 0.2s;
        }

        .qty-btn:hover:not(:disabled) {
          background: #e2e8f0;
        }
        
        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-number {
          width: 32px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
        }

        .remove-btn {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .remove-btn:hover {
          background: var(--danger-light);
        }

        .cart-item-subtotal {
          font-weight: 700;
          font-size: 16px;
          color: var(--primary-dark);
          text-align: right;
        }

        .cart-drawer-footer {
          padding: 24px;
          background: #f8fafc;
          border-top: 1px solid var(--border);
        }

        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 20px;
        }

        .summary-price {
          color: var(--primary-dark);
          font-size: 22px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        /* ===========================
           Alerts & States
        =========================== */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--border);
          color: var(--text-muted);
        }

        .empty-state svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h2 {
          font-size: 20px;
          font-weight: 600;
        }

        .error-alert {
          background: var(--danger-light);
          color: #b91c1c;
          padding: 16px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          font-weight: 500;
        }

        /* ===========================
           Loading Skeletons
        =========================== */
        .skeleton-card {
          border: 1px solid var(--border);
          height: 100%;
        }

        .skeleton-img {
          width: 100%;
          height: 260px;
          background: #e2e8f0;
        }

        .skeleton-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 200px;
        }

        .skeleton-line {
          height: 16px;
          border-radius: 8px;
          background: #e2e8f0;
        }

        .w-80 { width: 80%; }
        .w-50 { width: 50%; }
        .w-100 { width: 100%; height: 60px; }
        .mt-auto { margin-top: auto; }

        .pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }   

        /* ===========================
           Responsive
        =========================== */
        @media(max-width: 768px) {
          .books-page {
            padding: 40px 16px 120px 16px;
          }
          .title {
            font-size: 28px;
          }
          .books-grid {
            grid-template-columns: 1fr;
          }
          .floating-cart {
            border-radius: 16px;
            bottom: 16px;
          }
        }
        /* Drawer Container */
.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  background: #f8fafc;
  z-index: 100;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  border-radius: 20px 0 0 20px;
  overflow: hidden;
  transform: translateX(100%);
  animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Header */
.cart-drawer-header {
  background: #16a34a;
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Cards */
.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 18px; /* Card Gap */
}

.cart-card {
  background: #ffffff;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
  display: flex;
  gap: 15px;
  align-items: center;
}

.cart-card-img img {
  width: 90px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.cart-card-details {
  flex: 1;
}

/* Price & Quantity */
.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.current-price {
  color: #16a34a;
  font-weight: 700;
}

.original-price {
  color: #94a3b8;
  text-decoration: line-through;
  font-size: 14px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

/* Footer & Button */
.cart-drawer-footer {
  padding: 24px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-row.total {
  font-weight: 700;
  font-size: 18px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.btn-proceed {
  width: 100%;
  height: 56px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 700;
  margin-top: 20px;
  cursor: pointer;
}
      `}</style>
      <Footer />
    </>
  );
}
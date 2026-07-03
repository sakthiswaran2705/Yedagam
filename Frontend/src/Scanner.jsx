import React, { useState } from 'react';
import Navbar from "./Navbar.jsx";
// Assuming scanner_img is in the same directory
import scanner_img from "./Payment_scanner.jpg";
import Footer from "./Footer.jsx";

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);

  // Handle successful scan
  const handleScan = (data) => {
    if (data) {
      setScanResult(data);
      console.log("ஸ்கேன் வெற்றிகரமாக முடிந்தது:", data);
    }
  };

  // Handle scan errors
  const handleError = (err) => {
    console.error("ஸ்கேனிங் பிழை:", err);
  };

  return (
    <>
      <Navbar />

      {/* Embedded CSS */}
      <style>{`
        /* Global & Layout */
        .scanner-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          /* Modern subtle gradient background */
          background: linear-gradient(135deg, #f3f8ff 0%, #e0ebff 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 40px 20px;
        }

        /* Main Card */
        .scanner-app-card {
          background-color: #ffffff;
          width: 100%;
          max-width: 440px;
          border-radius: 32px;
          box-shadow: 0 24px 50px rgba(17, 34, 64, 0.08), 
                      0 0 0 8px rgba(255, 255, 255, 0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        /* Header UI */
        .scanner-header {
          padding: 36px 32px 24px;
          text-align: center;
          position: relative;
        }
        
        .scanner-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 4px;
          background: #4f46e5;
          border-radius: 4px;
        }

        .scanner-header h1 {
          font-size: 1.5rem;
          color: #0f172a;
          margin: 0 0 10px 0;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .scanner-header p {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        /* Image Viewport (Animated Scanner) */
        .camera-viewport {
          height: 320px;
          margin: 10px 32px;
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background-color: #1e293b;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
        }

        .scanner-bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85; /* Slight dim to make the laser pop */
        }

        /* Scanning Laser Animation */
        .scan-laser {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: #38bdf8;
          box-shadow: 0 0 15px 5px rgba(56, 189, 248, 0.4);
          animation: scan 2.5s infinite ease-in-out alternate;
          z-index: 2;
        }

        /* Corner Brackets for Scanner Feel */
        .scanner-guides {
          position: absolute;
          top: 16px; left: 16px; right: 16px; bottom: 16px;
          z-index: 3;
          pointer-events: none;
        }
        .scanner-guides::before, .scanner-guides::after {
          content: '';
          position: absolute;
          width: 40px; height: 40px;
          border-color: #38bdf8;
          border-style: solid;
        }
        .scanner-guides::before {
          top: 0; left: 0;
          border-width: 4px 0 0 4px;
          border-top-left-radius: 12px;
        }
        .scanner-guides::after {
          bottom: 0; right: 0;
          border-width: 0 4px 4px 0;
          border-bottom-right-radius: 12px;
        }
        
        .scanner-guides-alt {
          position: absolute;
          top: 16px; left: 16px; right: 16px; bottom: 16px;
          z-index: 3;
          pointer-events: none;
        }
        .scanner-guides-alt::before {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 40px; height: 40px;
          border-color: #38bdf8;
          border-style: solid;
          border-width: 4px 4px 0 0;
          border-top-right-radius: 12px;
        }
        .scanner-guides-alt::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 40px; height: 40px;
          border-color: #38bdf8;
          border-style: solid;
          border-width: 0 0 4px 4px;
          border-bottom-left-radius: 12px;
        }

        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }

        /* Success Message */
        .scan-result {
          margin: 20px 32px 0;
          padding: 16px;
          text-align: center;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
          animation: slideUp 0.4s ease-out;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .scan-result h3 {
          margin: 0 0 4px 0;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.9;
        }
        .scan-result p {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
        }

        /* Digital Receipt / Bank Details Section */
        .bank-details-container {
          margin: 24px 32px 32px;
          padding: 24px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px dashed #cbd5e1;
          position: relative;
        }

        /* Receipt zig-zag top edge effect */
        .bank-details-container::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 10px;
          right: 10px;
          height: 6px;
          background-image: radial-gradient(circle, #f8fafc 3px, transparent 4px);
          background-size: 12px 12px;
          background-position: center bottom;
        }

        .bank-details-container h2 {
          font-size: 1.05rem;
          color: #0f172a;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .bank-details-container h2::before {
          content: '🏦';
          font-size: 1.2rem;
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
          position: relative;
        }
        
        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 1rem;
          color: #1e293b;
          font-weight: 700;
          line-height: 1.4;
          word-break: break-word;
        }

        /* Actions - Added a helpful button */
        .scanner-actions {
          padding: 0 32px 32px;
        }

        .pay-btn {
          width: 100%;
          padding: 16px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
        }

        .pay-btn:hover {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(79, 70, 229, 0.4);
        }
      `}</style>

      {/* Main Component UI */}
      <div className="scanner-wrapper">
        <div className="scanner-app-card">

          {/* Header Section */}
          <div className="scanner-header">
            <h1>பணம் செலுத்த ஸ்கேன் செய்யவும்</h1>
            <p>QR குறியீட்டை சட்டத்திற்குள் காட்டவும்</p>
          </div>

          {/* Image Viewport with Animated Laser & Corner Guides */}
          <div className="camera-viewport">
            <div className="scan-laser"></div>
            <div className="scanner-guides"></div>
            <div className="scanner-guides-alt"></div>
            <img src={scanner_img} alt="Payment Scanner" className="scanner-bg-image" />
          </div>

          {/* Scan Result Section */}
          {scanResult && (
            <div className="scan-result">
              <h3>ஸ்கேன் முடிவு</h3>
              <p>{scanResult}</p>
            </div>
          )}

          {/* Bank Details Section styled like a digital receipt */}
          <div className="bank-details-container">
            <h2>Payment Details</h2>

            <div className="detail-row">
              <span className="detail-label">Account Holder</span>
              <span className="detail-value">YEDAGAM EDUCATIONAL SOCIAL DEVELOPMENT AND REO</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">A/C Number</span>
              <span className="detail-value">136401000027228</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">IFSC Code</span>
              <span className="detail-value" style={{ textTransform: 'uppercase' }}>IOBA0004</span>
            </div>

            {/* Fixed the syntax error on the div below */}
            <div className="detail-row">
              <span className="detail-label">Bank Name</span>
              <span className="detail-value" style={{ textTransform: 'uppercase' }}>Indian Overseas Bank</span>
            </div>
          </div>

          {/* Action Button */}


        </div>
      </div>

      <Footer />
    </>
  );
};

export default Scanner;
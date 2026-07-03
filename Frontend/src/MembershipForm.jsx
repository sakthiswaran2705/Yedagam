import React, { useState, useEffect, useRef } from 'react';
import Navbar from "./Navbar";
import { authenticatedFetch } from './authFetch';
import qrCodeImg from './UPIImage.jpeg';
import Footer from "./Footer.jsx";
// Centralized UI Translations Dictionary completely matching the condition checklist
const translations = {
  en: {
    title: 'Membership Application Form',
    course: 'Teaching Course *',
    selectCourse: 'Select a Course',
    name: 'Full Name *',
    father: 'Father / Husband Name *',
    dob: 'Date of Birth *',
    qualification: 'Qualification *',
    others: 'Others',
    customQualPlaceholder: 'Enter your qualification',
    mobile: 'Mobile Number *',
    extraQual: 'Extra Qualification (Optional)',
    address: 'Office / College Address *',
    photo: 'Photo * (Max 2MB)',
    aadhar: 'Aadhaar Card (Optional - Max 2MB)',
    submitBtn: 'Submit',
    processing: 'Processing...',
    back: 'Go Back',
    paidSubmit: 'I Have Paid - Submit',
    paymentTitle: 'Complete Membership Payment',
    selectedPlan: 'Selected Plan: Annual Subscription',
    planPrice: '/ Year',
    option1: 'Option 1: Scan & Pay via UPI',
    qrNote: 'Scan via any UPI app (GPay, PhonePe)',
    option2: 'Option 2: Netbanking Transfer',
    holder: 'Account Holder:',
    accNo: 'Account Number:',
    ifsc: 'IFSC Code:',
    bank: 'Bank Name:',

    // English Dropdown Course Labels
    courses: [
      { label: 'Tamil Etymology', value: 'தமிழ்ச் சுவடியியல்' },
      { label: 'Epigraphy', value: 'கல்வெட்டியல்' },
      { label: 'Scriptural characters', value: 'கிரந்த எழுத்துகள்' },
      { label: 'Chests', value: 'செப்பேடுகள்' },
      { label: 'Astrology', value: 'சோதிடவியல்' }
    ],

    // Explicit Validation Messages matching requirements
    errCourse: 'Please select a teaching course.',
    errNameReq: 'Name is required.',
    errNameLen: 'Name must be at least 2 characters long.',
    errNameFormat: 'Enter a valid name.',
    errFather: 'Father/Husband Name is required.',
    errDobReq: 'Date of Birth is required.',
    errDobFuture: 'Please select a valid Date of Birth.',
    errDobFormat: 'Please enter a valid date in DD/MM/YYYY format.',
    errQual: 'Qualification is required.',
    errAddressReq: 'Office/College Address is required.',
    errAddressSpaces: 'Enter a valid address.',
    errMobileReq: 'Mobile Number is required.',
    errMobileLen: 'Enter a valid 10-digit mobile number.',
    errMobileDigits: 'Mobile number must contain only digits.',
    errPhotoReq: 'Please upload your photo.',
    errPhotoFormat: 'Only JPG, JPEG and PNG files are allowed.',
    errPhotoSize: 'Photo size must not exceed 2 MB.',
    errAadharFormat: 'Only PDF, JPG, JPEG and PNG files are allowed.',
    errAadharSize: 'Aadhaar card file size must not exceed 2 MB.',
    errDuplicateMobile: 'Membership already exists with this mobile number.',
    successSubmit: 'Membership application submitted successfully.'
  },
  ta: {
    title: 'உறுப்பினர் சேர்க்கை படிவம்',
    course: 'பயிற்றுவிக்கப்படும் பாடம் *',
    selectCourse: 'பாடத்தைத் தேர்ந்தெடுக்கவும்',
    name: 'முழு பெயர் *',
    father: 'தந்தை / கணவர் பெயர் *',
    dob: 'பிறந்த தேதி *',
    qualification: 'கல்வித் தகுதி *',
    others: 'மற்றவை',
    customQualPlaceholder: 'உங்கள் கல்வித் தகுதியை உள்ளிடவும்',
    mobile: 'கைப்பேசி எண் *',
    extraQual: 'கூடுதல் தகுதி (விருப்பம்)',
    address: 'அலுவலகம் / கல்லூரி முகவரி *',
    photo: 'புகைப்படம் * (Max 2MB)',
    aadhar: 'ஆதார் நகல் (விருப்பம் - Max 2MB)',
    submitBtn: 'சமர்ப்பிக்கவும்',
    processing: 'செயலாக்கப்படுகிறது...',
    back: 'பின்செல்ல',
    paidSubmit: 'நான் செலுத்திவிட்டேன் - சமர்ப்பி',
    paymentTitle: 'கட்டணம் செலுத்துதல்',
    selectedPlan: 'தேர்ந்தெடுக்கப்பட்ட திட்டம்: வருட சந்தா',
    planPrice: '/ வருடம்',
    option1: 'விருப்பம் 1: கியூஆர் குறியீடு',
    qrNote: 'எந்தவொரு UPI செயலி மூலமும் ஸ்கேன் செய்யவும் (GPay, PhonePe)',
    option2: 'விருப்பம் 2: வங்கி கணக்கு மாற்றுதல்',
    holder: 'கணக்கு உரிமையாளர்:',
    accNo: 'கணக்கு எண்:',
    ifsc: 'ஐஎஃப்எஸ்சி குறியீடு:',
    bank: 'வங்கி பெயர்:',

    // Tamil Dropdown Course Labels
    courses: [
      { label: 'தமிழ்ச் சுவடியியல்', value: 'தமிழ்ச் சுவடியியல்' },
      { label: 'கல்வெட்டியல்', value: 'கல்வெட்டியல்' },
      { label: 'கிரந்த எழுத்துகள்', value: 'கிரந்த எழுத்துகள்' },
      { label: 'செப்பேடுகள்', value: 'செப்பேடுகள்' },
      { label: 'சோதிடவியல்', value: 'சோதிடவியல்' }
    ],

    // Tamil Validation Messages mapped accurately
    errCourse: 'பயிற்றுவிக்கப்படும் பாடத்தைத் தேர்ந்தெடுக்கவும்.',
    errNameReq: 'பெயர் தேவை.',
    errNameLen: 'பெயர் குறைந்தபட்சம் 2 எழுத்துக்கள் இருக்க வேண்டும்.',
    errNameFormat: 'சரியான பெயரை உள்ளிடவும்.',
    errFather: 'தந்தை/கணவர் பெயர் தேவை.',
    errDobReq: 'பிறந்த தேதி தேவை.',
    errDobFuture: 'சரியான பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்.',
    errDobFormat: 'தேதியை நாள்/மாதம்/வருடம் (DD/MM/YYYY) வடிவத்தில் உள்ளிடவும்.',
    errQual: 'கல்வித் தகுதி தேவை.',
    errAddressReq: 'அலுவலகம்/கல்லூரி முகவரி தேவை.',
    errAddressSpaces: 'சரியான முகவரியை உள்ளிடவும்.',
    errMobileReq: 'கைப்பேசி எண் தேவை.',
    errMobileLen: 'சரியான 10 இலக்க கைப்பேசி எண்ணை உள்ளிடவும்.',
    errMobileDigits: 'கைப்பேசி எண் எண்களை மட்டுமே கொண்டிருக்க வேண்டும்.',
    errPhotoReq: 'புகைப்படத்தை பதிவேற்றவும்.',
    errPhotoFormat: 'JPG, JPEG மற்றும் PNG கோப்புகள் மட்டுமே அனுமதிக்கப்படும்.',
    errPhotoSize: 'புகைப்படம் 2 MB அளவுக்கு மிகாமல் இருக்க வேண்டும்.',
    errAadharFormat: 'PDF, JPG, JPEG மற்றும் PNG கோப்புகள் மட்டுமே ஆதார் நகலுக்கு அனுமதிக்கப்படும்.',
    errAadharSize: 'ஆதார் கோப்பு அளவு 2 MB அளவுக்கு மிகாமல் இருக்க வேண்டும்.',
    errDuplicateMobile: 'இந்த கைப்பேசி எண்ணுடன் ஏற்கனவே உறுப்பினர் பதிவு உள்ளது.',
    successSubmit: 'உறுப்பினர் சேர்க்கை விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.'
  }
};

const MembershipForm = ({ onLanguageChange }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "en");
  const text = translations[lang];
  const hiddenDateRef = useRef(null);

  useEffect(() => {
    const checkLanguageChange = () => {
      const savedLang = localStorage.getItem("app_lang") || "en";
      if (savedLang !== lang) {
        setLang(savedLang);
      }
    };

    const syncInterval = setInterval(checkLanguageChange, 300);
    window.addEventListener("storage", checkLanguageChange);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("storage", checkLanguageChange);
    };
  }, [lang]);

  const handleNavbarLangToggle = (selectedLang) => {
    setLang(selectedLang);
    if (onLanguageChange) onLanguageChange(selectedLang);
  };

  const [formData, setFormData] = useState({
    teaching_course: '',
    name: '',
    father_or_husband_name: '',
    date_of_birth: '',
    qualification: 'Bachelor of Education (B.Ed)',
    custom_qualification: '',
    office_or_college_address: '',
    mobile_no: '',
    extra_qualification: '',
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadharCard, setAadharCard] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleDobTextChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);

    let formatted = "";
    if (value.length > 0) {
      formatted += value.slice(0, 2);
      if (value.length > 2) {
        formatted += "/" + value.slice(2, 4);
        if (value.length > 4) {
          formatted += "/" + value.slice(4, 8);
        }
      }
    }

    setFormData((prev) => ({ ...prev, date_of_birth: formatted }));
    if (fieldErrors.date_of_birth) {
      setFieldErrors((prev) => ({ ...prev, date_of_birth: '' }));
    }
  };

  const handleHiddenPickerChange = (e) => {
    const dateVal = e.target.value;
    if (!dateVal) return;

    const [year, month, day] = dateVal.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    setFormData((prev) => ({ ...prev, date_of_birth: formattedDate }));
    if (fieldErrors.date_of_birth) {
      setFieldErrors((prev) => ({ ...prev, date_of_birth: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Inline Keystroke Validation for Mobile Number Field
    if (name === 'mobile_no') {
      if (value !== '' && !/^\d+$/.test(value)) {
        setFieldErrors((prev) => ({ ...prev, mobile_no: text.errMobileDigits }));
      } else {
        setFieldErrors((prev) => ({ ...prev, mobile_no: '' }));
      }
    } else if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!formData.teaching_course) errors.teaching_course = text.errCourse;

    if (!formData.name.trim()) {
      errors.name = text.errNameReq;
    } else if (formData.name.trim().length < 2) {
      errors.name = text.errNameLen;
    } else if (!nameRegex.test(formData.name)) {
      errors.name = text.errNameFormat;
    }

    if (!formData.father_or_husband_name.trim()) errors.father_or_husband_name = text.errFather;

    const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!formData.date_of_birth) {
      errors.date_of_birth = text.errDobReq;
    } else if (!dobRegex.test(formData.date_of_birth)) {
      errors.date_of_birth = text.errDobFormat;
    } else {
      const [, d, m, y] = formData.date_of_birth.match(dobRegex);
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const year = parseInt(y, 10);

      const parsedDate = new Date(year, month - 1, day);
      const today = new Date();

      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day ||
        month < 1 || month > 12 || day < 1 || day > 31
      ) {
        errors.date_of_birth = text.errDobFormat;
      } else if (parsedDate > today) {
        errors.date_of_birth = text.errDobFuture;
      }
    }

    if (!formData.qualification) errors.qualification = text.errQual;

    if (!formData.office_or_college_address.trim()) {
      errors.office_or_college_address = text.errAddressReq;
    }

    // Strict Submission-Time Validation Framework for Mobile Number Input
    if (!formData.mobile_no) {
      errors.mobile_no = text.errMobileReq;
    } else if (!/^\d+$/.test(formData.mobile_no)) {
      errors.mobile_no = text.errMobileDigits;
    } else if (formData.mobile_no.length !== 10) {
      errors.mobile_no = text.errMobileLen;
    }

    if (!photo) errors.photo = text.errPhotoReq;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedFormats.includes(file.type)) {
      setFieldErrors((prev) => ({ ...prev, photo: text.errPhotoFormat }));
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, photo: text.errPhotoSize }));
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }

    setFieldErrors((prev) => ({ ...prev, photo: '' }));
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleAadharChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedFormats = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedFormats.includes(file.type)) {
      setFieldErrors((prev) => ({ ...prev, aadhar: text.errAadharFormat }));
      setAadharCard(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, aadhar: text.errAadharSize }));
      setAadharCard(null);
      return;
    }

    setFieldErrors((prev) => ({ ...prev, aadhar: '' }));
    setAadharCard(file);
  };

  const handlePreSubmitCheck = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (validateForm()) {
      setShowPaymentModal(true);
    }
  };

  const handleFinalSubmitWithPayment = async () => {
    setShowPaymentModal(false);
    setLoading(true);

    const finalQualification = formData.qualification === 'Others' ? formData.custom_qualification : formData.qualification;

    const [, d, m, y] = formData.date_of_birth.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const backendDob = `${y}-${m}-${d}`;

    const dataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === 'qualification') {
        dataToSend.append('qualification', finalQualification);
      } else if (key === 'date_of_birth') {
        dataToSend.append('date_of_birth', backendDob);
      } else if (key !== 'custom_qualification') {
        dataToSend.append(key, formData[key]);
      }
    });

    dataToSend.append('photo', photo);
    if (aadharCard) {
      dataToSend.append('aadhar_card', aadharCard);
    }

    try {
      const response = await authenticatedFetch('/membership/form/', {
        method: 'POST',
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: text.successSubmit });
        setFormData({
          teaching_course: '',
          name: '',
          father_or_husband_name: '',
          date_of_birth: '',
          qualification: 'Bachelor of Education (B.Ed)',
          custom_qualification: '',
          office_or_college_address: '',
          mobile_no: '',
          extra_qualification: '',
        });
        setPhoto(null);
        setPhotoPreview(null);
        setAadharCard(null);
      } else {
        if (result.detail?.includes("already exists")) {
          setMessage({ type: 'error', text: text.errDuplicateMobile });
        } else {
          setMessage({ type: 'error', text: result.detail || text.errorMsg });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: text.serverError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .form-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 30px;
          background-color: #ffffff;
          border: 1px solid #edf2f7;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .form-container h2 {
          text-align: center;
          color: #2d3748;
          margin-bottom: 30px;
          font-size: 1.8rem;
          font-weight: 700;
        }
        .membership-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group.full-width {
          grid-column: span 2;
        }
        .form-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 8px;
        }
        .membership-form input[type="text"],
        .membership-form input[type="tel"],
        .membership-form textarea,
        .styled-select {
          padding: 11px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.95rem;
          color: #334155;
          background-color: #ffffff;
          transition: all 0.2s ease-in-out;
          width: 100%;
          box-sizing: border-box;
        }
        .membership-form input.input-field-error {
          border-color: #e53e3e;
          background-color: #fff5f5;
        }

        .custom-dob-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .custom-dob-wrapper input[type="text"] {
          padding-right: 44px;
        }
        .calendar-trigger-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0;
          display: flex;
          align-items: center;
          color: #4a5568;
          user-select: none;
        }
        .hidden-native-picker {
          position: absolute;
          right: 12px;
          width: 24px;
          height: 24px;
          opacity: 0;
          cursor: pointer;
          z-index: -1;
        }

        .membership-form input:focus,
        .membership-form textarea:focus,
        .styled-select:focus {
          outline: none;
          border-color: #3182ce;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
        }
        .membership-form textarea {
          resize: vertical;
        }
        .membership-form input[type="file"] {
          font-size: 0.85rem;
          color: #718096;
          padding: 5px 0;
          cursor: pointer;
        }
        .error-text {
          color: #e53e3e;
          font-size: 0.8rem;
          font-weight: 500;
          margin-top: 6px;
          display: block;
        }
        .image-preview-wrapper {
          margin-top: 10px;
          width: 110px;
          height: 130px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          background-color: #f7fafc;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .uploaded-photo-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .file-name-info {
          font-size: 0.85rem;
          color: #38a169;
          font-weight: 600;
          margin-top: 6px;
          display: inline-block;
        }
        .submit-btn {
          background-color: #48bb78;
          color: #ffffff;
          border: none;
          padding: 14px;
          font-size: 1.05rem;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          width: 100%;
        }
        .submit-btn:hover {
          background-color: #38a169;
        }
        .submit-btn:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }
        .alert-message {
          padding: 14px;
          border-radius: 6px;
          margin-bottom: 25px;
          font-weight: 600;
          text-align: center;
          font-size: 0.95rem;
        }
        .alert-message.success {
          background-color: #c6f6d5;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }
        .alert-message.error {
          background-color: #fed7d7;
          color: #742a2a;
          border: 1px solid #feb2b2;
        }
        .payment-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(26, 32, 44, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }
        .payment-modal-content {
          background-color: #ffffff;
          width: 92%;
          max-width: 680px;
          padding: 28px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          box-sizing: border-box;
          animation: modalViewSlideUp 0.2s ease-out;
        }
        @keyframes modalViewSlideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .payment-modal-content h3 {
          margin: 0 0 12px 0;
          color: #2d3748;
          font-size: 1.3rem;
          font-weight: 700;
        }
        .payment-modal-content hr {
          border: 0;
          border-top: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }
        .plan-badge {
          background-color: #f7fafc;
          border-left: 5px solid #48bb78;
          padding: 14px;
          margin-bottom: 24px;
          border-radius: 0 6px 6px 0;
        }
        .plan-badge h4 {
          margin: 0 0 6px 0;
          color: #4a5568;
          font-size: 0.95rem;
        }
        .plan-badge .price {
          font-size: 1.6rem;
          font-weight: 700;
          color: #2f855a;
          margin: 0;
        }
        .plan-badge .price span {
          font-size: 0.9rem;
          color: #718096;
          font-weight: 400;
        }
        .payment-options-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .payment-section {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          background-color: #ffffff;
        }
        .payment-section h5 {
          margin: 0 0 12px 0;
          color: #2d3748;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .qr-code-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 12px auto;
        }
        .payment-qr-img {
          width: 160px;
          height: 160px;
          object-fit: contain;
          border: 1px solid #cbd5e1;
          padding: 6px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .payment-note {
          font-size: 0.75rem;
          color: #718096;
          text-align: center;
          margin: 6px 0 0 0;
          line-height: 1.4;
        }
        .bank-details-table {
          width: 100%;
          font-size: 0.85rem;
          border-collapse: collapse;
        }
        .bank-details-table td {
          padding: 8px 4px;
          border-bottom: 1px dashed #edf2f7;
          color: #2d3748;
        }
        .bank-details-table tr:last-child td {
          border-bottom: none;
        }
        .bank-details-table td strong {
          color: #4a5568;
        }
        .modal-actions-bar {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
        }
        .cancel-btn, .confirm-btn {
          padding: 10px 20px;
          font-weight: 600;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s ease;
        }
        .cancel-btn { background-color: #edf2f7; color: #4a5568; }
        .cancel-btn:hover { background-color: #e2e8f0; }
        .confirm-btn { background-color: #48bb78; color: #ffffff; }
        .confirm-btn:hover { background-color: #38a169; }

        @media (max-width: 680px) {
          .membership-form, .payment-options-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .form-group.full-width {
            grid-column: span 1;
          }
          .modal-actions-bar {
            flex-direction: column-reverse;
            gap: 10px;
          }
          .cancel-btn, .confirm-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <Navbar onLanguageChange={handleNavbarLangToggle} />

      <div className="form-container">
        <h2>{text.title}</h2>

        {message.text && (
          <div className={`alert-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePreSubmitCheck} className="membership-form" noValidate>
          <div className="form-group">
            <label>{text.course}</label>
            <select name="teaching_course" value={formData.teaching_course} onChange={handleChange} className="styled-select" required>
              <option value="">-- {text.selectCourse} --</option>
              {text.courses.map((course, idx) => (
                <option key={idx} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
            {fieldErrors.teaching_course && <span className="error-text">{fieldErrors.teaching_course}</span>}
          </div>

          <div className="form-group">
            <label>{text.name}</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            {fieldErrors.name && <span className="error-text">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label>{text.father}</label>
            <input type="text" name="father_or_husband_name" value={formData.father_or_husband_name} onChange={handleChange} required />
            {fieldErrors.father_or_husband_name && <span className="error-text">{fieldErrors.father_or_husband_name}</span>}
          </div>

          <div className="form-group">
            <label>{text.dob}</label>
            <div className="custom-dob-wrapper">
              <input
                type="text"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleDobTextChange}
                placeholder="dd/mm/yyyy"
                maxLength="10"
                required
              />
              <button
                type="button"
                className="calendar-trigger-btn"
                onClick={() => hiddenDateRef.current && hiddenDateRef.current.showPicker()}
              >
                📅
              </button>
              <input
                type="date"
                ref={hiddenDateRef}
                className="hidden-native-picker"
                onChange={handleHiddenPickerChange}
              />
            </div>
            {fieldErrors.date_of_birth && <span className="error-text">{fieldErrors.date_of_birth}</span>}
          </div>

          <div className="form-group full-width">
            <label>{text.qualification}</label>
            <select name="qualification" value={formData.qualification} onChange={handleChange} required className="styled-select">
              <option value="Bachelor of Education (B.Ed)">B.Ed (Bachelor of Education)</option>
              <option value="Master of Education (M.Ed)">M.Ed (Master of Education)</option>
              <option value="Diploma in Teacher Education (D.T.Ed)">D.T.Ed</option>
              <option value="PhD">PhD</option>
              <option value="Others">{text.others}</option>
            </select>

            {formData.qualification === 'Others' && (
              <input
                type="text"
                name="custom_qualification"
                placeholder={text.customQualPlaceholder}
                value={formData.custom_qualification}
                onChange={handleChange}
                style={{ marginTop: '10px' }}
                required
              />
            )}
            {fieldErrors.qualification && <span className="error-text">{fieldErrors.qualification}</span>}
          </div>

          <div className="form-group">
            <label>{text.mobile}</label>
            <input
              type="tel"
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleChange}
              maxLength="10"
              className={fieldErrors.mobile_no ? 'input-field-error' : ''}
              required
            />
            {fieldErrors.mobile_no && <span className="error-text">{fieldErrors.mobile_no}</span>}
          </div>

          <div className="form-group">
            <label>{text.extraQual}</label>
            <input type="text" name="extra_qualification" value={formData.extra_qualification} onChange={handleChange} />
          </div>

          <div className="form-group full-width">
            <label>{text.address}</label>
            <textarea name="office_or_college_address" value={formData.office_or_college_address} onChange={handleChange} rows="3" required />
            {fieldErrors.office_or_college_address && <span className="error-text">{fieldErrors.office_or_college_address}</span>}
          </div>

          <div className="form-group">
            <label>{text.photo}</label>
            <input type="file" accept=".jpg, .jpeg, .png" onChange={handlePhotoChange} required />
            {photoPreview && (
              <div className="image-preview-wrapper">
                <img src={photoPreview} alt="Profile Preview" className="uploaded-photo-preview" />
              </div>
            )}
            {fieldErrors.photo && <span className="error-text">{fieldErrors.photo}</span>}
          </div>

          <div className="form-group">
            <label>{text.aadhar}</label>
            <input type="file" accept=".pdf, .jpg, .jpeg, .png" onChange={handleAadharChange} />
            {aadharCard && <span className="file-name-info">📄 {aadharCard.name}</span>}
            {fieldErrors.aadhar && <span className="error-text">{fieldErrors.aadhar}</span>}
          </div>

          <div className="form-group full-width">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? text.processing : text.submitBtn}
            </button>
          </div>
        </form>

        {showPaymentModal && (
          <div className="payment-modal-backdrop">
            <div className="payment-modal-content">
              <h3>{text.paymentTitle}</h3>
              <hr />

              <div className="plan-badge">
                <h4>{text.selectedPlan}</h4>
                <p className="price">₹300 <span>{text.planPrice}</span></p>
              </div>

              <div className="payment-options-grid">
                <div className="payment-section qr-scanner-section">
                  <h5>{text.option1}</h5>
                  <div className="qr-code-placeholder">
                    <img
                      src={qrCodeImg}
                      alt="Yedagam Payment QR Code"
                      className="payment-qr-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="payment-note">{text.qrNote}</p>
                </div>

                <div className="payment-section netbanking-section">
                  <h5>{text.option2}</h5>
                  <table className="bank-details-table">
                    <tbody>
                      <tr>
                        <td><strong>{text.holder}</strong></td>
                        <td>YEDAGAM Educational Centre</td>
                      </tr>
                      <tr>
                        <td><strong>{text.accNo}</strong></td>
                        <td>136401000027228</td>
                      </tr>
                      <tr>
                        <td><strong>{text.ifsc}</strong></td>
                        <td>IOBA0004</td>
                      </tr>
                      <tr>
                        <td><strong>{text.bank}</strong></td>
                        <td>Indian Overseas Bank</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-actions-bar">
                <button type="button" className="cancel-btn" onClick={() => setShowPaymentModal(false)}>
                  {text.back}
                </button>
                <button type="button" className="confirm-btn" onClick={handleFinalSubmitWithPayment}>
                  {text.paidSubmit}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MembershipForm;

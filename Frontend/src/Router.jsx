import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Home from "./Home.jsx";
import LoginRegister from "./Login.jsx";
import Category from "./category.jsx";
import BlogDetail from "./Particular-view.jsx";
import Donate from "./Donate-by.jsx"

import AdminDashboard from "./Admin_dashboard.jsx";
import CategoryOp from "./category_operation.jsx";
import UserRoleManager from "./userRole.jsx";
import BlogAdminPanel from "./Blog_operation.jsx";
import About from "./About-us.jsx"
import Payments from "./Payment.jsx"
import BookStore from "./Book-store.jsx"
import Contact from "./Contact_us.jsx";
import Book from "./Book.jsx"
import DonateList from "./Donate_all_dt.jsx";
import ContactCheck from "./contact_details_ad.jsx";
import Scanner from "./Scanner.jsx";
import CourseAdminPanel from "./Courses.jsx"
import CourseUser from "./courses_user.jsx";
import Payment from "./Pay_book.jsx"
import BookOrder from "./book_orders_dt_ad.jsx"
import ShippingPolicy from "./ShippingPolicy.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import TermsConditions from "./TermsConditions.jsx";
import CancellationRefundPolicy from "./CancellationRefundPolicy.jsx";
import MembershipForm from "./MembershipForm.jsx";
import AdminMembershipDashboard from "./Membershipform_admin.jsx";
// Admin Route Guard
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  const status = localStorage.getItem("USER_STATUS");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (status !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function RouterPage() {
  return (
    <Routes>
      {/* ========================= */}
      {/* PUBLIC ROUTES */}
      {/* ========================= */}
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<LoginRegister />} />

      <Route path="/category" element={<Category />} />
     <Route path ="/Donate" element={<Donate/>} />
        <Route path="/About" element={<About />} />
        <Route path ="/Payments/*" element={<Payments />} />
        <Route path ="/BookStore/*" element={<BookStore/>} />
        <Route path ="/Contact" element={<Contact/>} />
        <Route path ="/Book" element={<Book/>} />
        <Route path ="/DonateList/*" element={<DonateList/>} />
        <Route path ="/ContactCheck/*" element={<ContactCheck/>} />
       <Route path ="/Scanner" element={<Scanner/>} />
       <Route path ="/CourseAdminPanel/*" element={<CourseAdminPanel/>} />
       <Route path ="/CourseUser" element={<CourseUser/>} />
       <Route path ="/pay" element={<Payment/>} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/CancellationRefundPolicy" element={<CancellationRefundPolicy />} />
        <Route path="/membership" element={<MembershipForm />} />
        <Route path="/MembershipForm-admin/*" element={<AdminMembershipDashboard/>} />
        <Route
        path="/blog/:blog_id"
        element={<BlogDetail />}
      />

      {/* ========================= */}
      {/* ADMIN ROUTES */}
      {/* ========================= */}

      <Route
        path="/dashboard/*"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/category_op/*"
        element={
          <AdminRoute>
            <CategoryOp />
          </AdminRoute>
        }
      />

      <Route
        path="/AdminProcess/*"
        element={
          <AdminRoute>
            <BlogAdminPanel />
          </AdminRoute>
        }
      />

      <Route
        path="/UserRoleManager/*"
        element={
          <AdminRoute>
            <UserRoleManager />
          </AdminRoute>
        }
      /><Route
        path="/Bookorders/*"
        element={
          <AdminRoute>
            <BookOrder />
          </AdminRoute>
        }
      />

      {/* ========================= */}
      {/* FALLBACK */}
      {/* ========================= */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RouterPage;
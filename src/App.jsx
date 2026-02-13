// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./component/Navbar";
import ProtectedRoutes from "./utilis/ProtectedRoutes";
import Dashboard from "./pages/Dashboard";

// Public pages
import Root from "./component/Root";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin / Common Dashboard Pages
import AdminDashboard from "./component/AdminDashboard";
import ItemsPage from "./pages/Itemspage";
import AddItemPage from "./pages/AddItemPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ItemEditPage from "./pages/ItemEditPage";
import ReleasePage from "./pages/ReleasePage";
import ReleaseDetailPage from "./pages/ReleaseDetailPage";
import ReturnPage from "./pages/ReturnPage";

import User from "./component/User";
import AddUserPage from "./pages/AddUserPage";
import Profile from "./component/Profile";
import Logout from "./component/Logout";
import SchedulePage from "./pages/SchedulePage";
import NotificationPanel from "./component/notifications/NotificationPanel";
import Report from "./component/Report";
import ReturnDetailPage from "./pages/ReturnDetailPage ";
import ReturnHistoryPage from './pages/ReturnHistoryPage '
import Notification from "./component/notifications/Notification";

export default function App() {
  return (
    <>
  
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} />

        <main className="pt-20 px-4 md:px-8 bg-gray-50 min-h-screen transition-all duration-500">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin / Superadmin */}
            <Route
              path="/admin-dashboard/*"
              element={<ProtectedRoutes requireRole={["admin", "superadmin"]} />}
            >
              <Route element={<Dashboard />}>
                <Route index element={<AdminDashboard />} />
                <Route path="items" element={<ItemsPage />} />
                <Route path="item/details/:id" element={<ItemDetailPage />} />
                <Route path="item-edit/:id" element={<ItemEditPage />} />
                <Route path="add-item" element={<AddItemPage />} />
                <Route path="releases" element={<ReleasePage />} />
                <Route path="releases/:id" element={<ReleaseDetailPage />} />
                <Route path="returns" element={<ReturnPage />} />
                <Route path="returns/:releaseId" element={<ReturnDetailPage />} />
                <Route
                  path="returns-details/:releaseId"
                  element={<ReturnHistoryPage />}
                />
                <Route
                  path="notifications-panel"
                  element={<NotificationPanel />}
                />
                <Route path="notifications" element={<Notification />} />
                <Route path="reports" element={<Report />} />
                <Route path="schedules" element={<SchedulePage />} />
                <Route path="users" element={<User />} />
                <Route path="users/add" element={<AddUserPage />} />
                <Route path="profile" element={<Profile />} />
                <Route path="logout" element={<Logout />} />
              </Route>
            </Route>

            {/* User */}
            <Route
              path="/user-dashboard/*"
              element={<ProtectedRoutes requireRole={["user"]} />}
            >
              <Route element={<Dashboard />}>
                <Route index element={<AdminDashboard />} />
                <Route path="items" element={<ItemsPage />} />
                <Route path="item/details/:id" element={<ItemDetailPage />} />
                <Route path="add-item" element={<AddItemPage />} />
                <Route path="releases" element={<ReleasePage />} />
                <Route path="releases/:id" element={<ReleaseDetailPage />} />
                <Route path="returns" element={<ReturnPage />} />
                <Route path="returns/:releaseId" element={<ReturnDetailPage />} />
                <Route
                  path="returns-details/:releaseId"
                  element={<ReturnHistoryPage />}
                />
                <Route path="schedules" element={<SchedulePage />} />
                <Route path="profile" element={<Profile />} />
                <Route path="logout" element={<Logout />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="/unauthorized" element={<h1>Unauthorized Access</h1>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
 
    </>
  );
}

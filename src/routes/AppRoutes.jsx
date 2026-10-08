import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Dashboard
import Dashboard from "../pages/Dashboard";

// Other pages
import Properties from "../pages/Properties";
import PropertyDetails from "../pages/PropertyDetails";
import Apartments from "../pages/Apartments";
import ApartmentDetails from "../pages/ApartmentDetails";
import Tenancy from "../pages/Tenancy";
import Payments from "../pages/Payments";
import Invoices from "../pages/Invoices";
import Maintenance from "../pages/Maintenance";
import Users from "../pages/Users";
import Profile from "../pages/Profile";

// Admin
import ManagerRequests from "../pages/admin/ManagerRequests";

// Layout / protection
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}

        <Route
          path="/properties"
          element={<Properties />}
        />

        <Route
          path="/properties/:id"
          element={<PropertyDetails />}
        />

        <Route
          path="/apartments/:id"
          element={<ApartmentDetails />}
        />

        {/* PUBLIC(AUTH) ROUTES*/}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-email/:token"
          element={<VerifyEmail />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/*PROTECTED APPLICATION*/}

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Properties */}
            <Route
              path="/properties"
              element={<Properties />}
            />

            {/* Apartments */}
            <Route
              path="/apartments"
              element={<Apartments />}
            />

            {/* Tenancy */}
            <Route
              path="/tenancy"
              element={<Tenancy />}
            />

            {/* Payments */}
            <Route
              path="/payments"
              element={<Payments />}
            />

            {/* Invoices */}
            <Route
              path="/invoices"
              element={<Invoices />}
            />

            {/* Maintenance */}
            <Route
              path="/maintenance"
              element={<Maintenance />}
            />

            {/* Users */}
            <Route
              path="/users"
              element={<Users />}
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* Manager requests */}
            <Route
              path="/manager-requests"
              element={<ManagerRequests />}
            />

          </Route>
        </Route>

        {/*DEFAULT ROUTES*/}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
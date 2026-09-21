import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import SecurityQuestions from './pages/SecurityQuestions.jsx';
import WageEntry from './pages/WageEntry.jsx';
import Wages from './pages/wages.jsx';
import SalesEntry from './pages/SalesEntry.jsx';
import Sales from './pages/Sales.jsx';
import Expenses from './pages/Expenses.jsx';
import ExpenseEntry from './pages/ExpenseEntry.jsx';
import StaffRegistration from './pages/StaffRegistration.jsx';
import StaffManagement from './pages/StaffManagement.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Aggregation from './pages/Aggregation.jsx';
import Receipt from './pages/receipt.jsx';
import Voucher from './pages/voucher.jsx';
import VoucherVerification from './pages/VoucherVerification.jsx';
import ReceiptVerification from './pages/ReceiptVerification.jsx';
import { HarvestPage } from './pages/harvest.jsx';
import SettingsLayout from './components/settings/SettingsLayout.jsx';
import CompanySettings from './pages/settings/CompanySettings.jsx';
import PricingSettings from './pages/settings/PricingSettings.jsx';
import CoffeeTypesSettings from './pages/settings/CoffeeTypesSettings.jsx';
import MasterDataSettings from './pages/settings/MasterDataSettings.jsx';
import SaleItemsSettings from './pages/settings/SaleItemsSettings.jsx';
import Customers from './pages/Customers.jsx';
import Assets from './pages/Assets.jsx';
import Documents from './pages/Documents.jsx';
import Trainings from './pages/Trainings.jsx';
import UsersSettings from './pages/settings/UsersSettings.jsx';
import PermissionsSettings from './pages/settings/PermissionsSettings.jsx';
import AuditSettings from './pages/settings/AuditSettings.jsx';
import LocationSelector from './components/LocationSelector';
import Processing from './pages/Processing.jsx';
import ProcessingOverview from './pages/ProcessingOverview.jsx';
import QualityControl from './pages/QualityControl.jsx';
import ProcessingType from './pages/ProcessingType.jsx';
import Drying from './pages/Drying.jsx';
import Bagging from './pages/Bagging.jsx';
import Hulling from './pages/Hulling.jsx';
import Fermenting from './pages/Fermenting.jsx';
import NaturalSundrying from './pages/NaturalSundrying.jsx';
import Washing from './pages/Washing.jsx';
import TaskManagement from './pages/TaskManagement.jsx';
import ExportInventory from './pages/export/ExportInventory.jsx';
import ExportDispatch from './pages/export/ExportDispatch.jsx';
import ExportTraceReport from './pages/export/ExportTraceReport.jsx';

// Remove unused imports like reactLogo, viteLogo, './App.css', etc.

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>

          {/* Path 1: Root path must show Login */}
          <Route path="/" element={<Login />} />

          {/* Security Questions Setup - requires login but shown after login if not yet set */}
          <Route path="/security-questions" element={<SecurityQuestions />} />

          {/* Public Routes - no authentication required */}
          <Route path="/verify-voucher" element={<VoucherVerification />} />
          <Route path="/verify-receipt" element={<ReceiptVerification />} />
          <Route path="/receipt" element={<Receipt />} />

          {/* Protected Routes - require authentication */}
          <Route path="/sales-entry" element={<ProtectedRoute><SalesEntry /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/trainings" element={<ProtectedRoute><Trainings /></ProtectedRoute>} />
          <Route path="/wage-entry" element={<ProtectedRoute><WageEntry /></ProtectedRoute>} />
          <Route path="/wages" element={<ProtectedRoute><Wages /></ProtectedRoute>} />
          <Route path="/expense-entry" element={<ProtectedRoute><ExpenseEntry /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/staff-registration" element={<ProtectedRoute><StaffRegistration /></ProtectedRoute>} />
          <Route path="/staff-management" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/aggregation" element={<ProtectedRoute><Aggregation /></ProtectedRoute>} />
          <Route path="/harvest" element={<ProtectedRoute><HarvestPage /></ProtectedRoute>} />
          <Route path="/voucher" element={<ProtectedRoute><Voucher /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TaskManagement /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/settings/company" replace />} />
            <Route path="company" element={<CompanySettings />} />
            <Route path="pricing" element={<PricingSettings />} />
            <Route path="coffee-types" element={<CoffeeTypesSettings />} />
            <Route path="sale-items" element={<SaleItemsSettings />} />
            <Route path="master-data" element={<MasterDataSettings />} />
            <Route path="customers" element={<Navigate to="/customers" replace />} />
            <Route path="assets" element={<Navigate to="/assets" replace />} />
            <Route path="users" element={<UsersSettings />} />
            <Route path="permissions" element={<PermissionsSettings />} />
            <Route path="audit" element={<AuditSettings />} />
          </Route>

          {/* Processing Routes */}
          <Route path="/processing" element={<Navigate to="/processing/overview" replace />} />
          <Route path="/processing/overview" element={<ProtectedRoute><ProcessingOverview /></ProtectedRoute>} />
          <Route path="/processing/quality-control" element={<ProtectedRoute><QualityControl /></ProtectedRoute>} />
          <Route path="/processing/processing-type" element={<ProtectedRoute><ProcessingType /></ProtectedRoute>} />
          <Route path="/processing/drying" element={<ProtectedRoute><Drying /></ProtectedRoute>} />
          <Route path="/processing/bagging" element={<ProtectedRoute><Bagging /></ProtectedRoute>} />
          <Route path="/processing/hulling" element={<ProtectedRoute><Hulling /></ProtectedRoute>} />

          {/* Processing Type Routes */}
          <Route path="/processing/fermenting" element={<ProtectedRoute><Fermenting /></ProtectedRoute>} />
          <Route path="/processing/natural-sundrying" element={<ProtectedRoute><NaturalSundrying /></ProtectedRoute>} />
          <Route path="/processing/washing" element={<ProtectedRoute><Washing /></ProtectedRoute>} />

          {/* Export & Compliance */}
          <Route path="/export/inventory" element={<ProtectedRoute><ExportInventory /></ProtectedRoute>} />
          <Route path="/export/dispatch" element={<ProtectedRoute><ExportDispatch /></ProtectedRoute>} />
          <Route path="/export/trace" element={<ProtectedRoute><ExportTraceReport /></ProtectedRoute>} />
          <Route path="/export/dossier" element={<Navigate to="/export/trace" replace />} />

          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
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
import { HarvestPage } from './pages/harvest.jsx';

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

          {/* Protected Routes - require authentication */}
          <Route path="/sales-entry" element={<ProtectedRoute><SalesEntry /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
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
          <Route path="/receipt" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />

          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

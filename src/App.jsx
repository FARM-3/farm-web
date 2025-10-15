import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

// Remove unused imports like reactLogo, viteLogo, './App.css', etc.

function App() {
  return (
    <BrowserRouter> 
      <div className="App">
        <Routes> 
          
          {/* Path 1: Root path must show Login */}
          <Route path="/" element={<Login />} /> 
          
          {/* Path 2: This path MUST render the WageEntry form. 
            If you are seeing the Login form when the URL is /wage-entry,
            it means the browser's memory is holding an older version.
          */}
          <Route path="/sales-entry" element={<SalesEntry />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/wage-entry" element={<WageEntry />} />
          <Route path="/wages" element={<Wages />} />
          <Route path="/expense-entry" element={<ExpenseEntry />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/staff-registration" element={<StaffRegistration />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

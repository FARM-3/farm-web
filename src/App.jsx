import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; // Import your Login page component
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <BrowserRouter> 
      <div className="App">
        <Routes> 
          {/* Set the default route path ("/") to render the Login component.
            When you open http://localhost:5173/, this is the page you will see.
          */}
          <Route path="/" element={<Login />} /> 
          
          {/* We'll add a Dashboard route here later */}
          {/* <Route path="/dashboard" element={<h1>Dashboard</h1>} /> */}
          
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


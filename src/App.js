import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Checkin from './pages/Checkin';
import Guest from './pages/Guest';
// import Guest from './Guest';
import '../src/output.css'
// In your main entry file (e.g., index.js or App.js)
import 'primereact/resources/themes/saga-blue/theme.css'; // Choose the theme you want
import 'primereact/resources/primereact.min.css'; // Core PrimeReact CSS
import 'primeicons/primeicons.css'; // Icons
import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Reservations from './pages/Reservations';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import AdminDashboard from './pages/admin/Dashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/checkin' element={<Checkin/>} />
        <Route path='/guestmanagement' element={<Guest />} />
        <Route path='/reservations' element={<Reservations />} />
        <Route path='/billing' element={<Billing />} />
        <Route path='/reports' element={<Reports />} />

        <Route path='/admin/dashboard' element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ualogo from '../../resources/ualogo.jpg';
import '../../../src/output.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCalendar, faCashRegister, faDoorOpen, faFolder, faGauge, faSignOut, faUsersGear } from '@fortawesome/free-solid-svg-icons';
import { Confirmation } from '../Confirmation';

const AdminSidebar = ({menu}) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(menu);

  const loadPage = (route) => {
    navigate(route); // Navigate after setting active menu
  };

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLogout = () => {
    navigate("/")
    
  }

  return (
    <div>

    {showConfirmation && <Confirmation message={"Are you sure you want to log out?"} toggleThis={()=> setShowConfirmation(false)} 
    confirmed={handleLogout}/>}

    
    <div className="sidebar fixed top-0 left-0 h-screen admin-bg text-lg">
      <div className="flex flex-col justify-center items-center py-10">
        <img src={ualogo} alt="University of Antique Logo" className="h-40 w-40 rounded-full mb-4" />
        <p className="text-lg font-bold">UA HMS</p>
        <p className='font-bold'>ADMIN CONTROL</p>
        <hr className="w-full my-4" />
      </div>
      
      <h2 className="text-xl font-semibold mb-4 px-4">
        <FontAwesomeIcon icon={faBars} className="mr-2" />Menu
      </h2>
      
      <ul className="space-y-2 px-4">
        <li onClick={() => loadPage('/admin/dashboard', 'dashboard')} className={`menu-item cursor-pointer ${activeMenu === 'dashboard' ? 'active' : ''}`}>
          <button className="flex items-center">
            <FontAwesomeIcon icon={faGauge} className="mr-2" /> Dashboard
          </button>
        </li>
        
        <li onClick={() => loadPage('/admin/reservations', 'reservations')} className={`menu-item cursor-pointer ${activeMenu === 'reservations' ? 'active' : ''}`}>
          <button className="flex items-center">
            <FontAwesomeIcon icon={faCalendar} className="mr-2" /> Reservations
          </button>
        </li>
        
        <li onClick={() => loadPage('/admin/checkin', 'checkin')}  className={`menu-item cursor-pointer ${activeMenu === 'checkin' ? 'active' : ''}`}>
          <button className="flex items-center">
            <FontAwesomeIcon icon={faDoorOpen} className="mr-2" /> Check-In/Check-Out
          </button>
        </li>
        
        <li onClick={() => loadPage('/admin/guestmanagement', 'guest-management')} className={`menu-item cursor-pointer ${activeMenu === 'guest-management' ? 'active' : ''}`}>
          <button className="flex items-center">
            <FontAwesomeIcon icon={faUsersGear} className="mr-2" /> Guest Management
          </button>
        </li>
        
        <li onClick={() => loadPage('/admin/billing', 'billing')} className={`menu-item cursor-pointer ${activeMenu === 'billing' ? 'active' : ''}`}>
          <button className="flex items-center">
            <FontAwesomeIcon icon={faCashRegister} className="mr-2" /> Billing and Invoicing
          </button>
        </li>

        <li onClick={() => loadPage('/admin/report', 'report')} className={`menu-item cursor-pointer ${activeMenu === 'report' ? 'active' : ''}`}>
          <button className="flex items-center">
            <FontAwesomeIcon icon={faFolder} className="mr-2" /> Reports
          </button>
        </li>
        
        <li onClick={() => setShowConfirmation(true) } className={`menu-item cursor-pointer ${activeMenu === 'logout' ? 'active' : ''}`}>
          <button className="flex items-center">
            <FontAwesomeIcon icon={faSignOut} className="mr-2" /> Logout
          </button>
        </li>
      </ul>
    </div>

    </div>
  );
};

export default AdminSidebar;

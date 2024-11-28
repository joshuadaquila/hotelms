import React, { useState } from 'react';
import '../../src/output.css';
import ualogo from '../resources/ualogo.jpg';
import { useNavigate } from 'react-router-dom';
import { postData } from '../api';
import { Notice } from '../components/Notice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignIn, faUser } from '@fortawesome/free-solid-svg-icons';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(0);
  const [adminLogin, setAdminLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  console.log(adminLogin)

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      const endpoint = adminLogin ? 'admin/login' : 'login'; // Determine endpoint dynamically
      const response = await postData(endpoint, { username, password });
  
      console.log(response);
  
      if (response.data && response.data.message === 'Login successful') {
        localStorage.setItem("userid", response.data.user.id);
  
        // Navigate to the appropriate dashboard based on adminLogin
        const dashboardPath = adminLogin ? '/admin/dashboard' : '/dashboard';
        navigate(dashboardPath);
      } else {
        setLoginStatus(401);
      }
    } catch (err) {
      console.error('An unexpected error occurred.', err);
      // setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="grid grid-cols-2 h-screen w-screen">
      {loginStatus === 401 && <Notice message={"Username or password is incorrect!"} toggleThis={()=> setLoginStatus(0)}/>}
      <div className="main-bg flex flex-col justify-center items-center text-white shadow-lg">
        <img src={ualogo} alt="University of Antique Logo" className="h-60 w-60 rounded-full mb-4" />
        <p className="text-center text-2xl">University of Antique</p>
        <p className="text-4xl font-bold">Hotel Management System</p>
      </div>

      <form className="pic-bg flex justify-center items-center h-screen" onSubmit={handleSubmit}>
        <div className="bg-white p-10 rounded-lg shadow-xl flex flex-col w-[60%] items-center">
          <p className="font-bold text-lg mb-4">
            <FontAwesomeIcon icon={faUser} /> Account Login
          </p>

          <div className="flex flex-col w-[70%] text-left mt-4">
            <label className="mb-2 font-semibold" htmlFor="username">Username</label>
            <input
              className="input-underline w-full mb-4"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label className="mb-2 font-semibold" htmlFor="password">Password</label>
            <input
              className="input-underline w-full mb-6"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className='flex items-center'>
              <input type="checkbox" name="usertype" className='mr-2' value="admin" onChange={()=> setAdminLogin(!adminLogin)}/>
               Login as Admin
            </label>
          </div>

          <button
            className={`bg-slate-950 text-white mt-4 px-8 py-4 font-semibold rounded-full`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <><FontAwesomeIcon icon={faSignIn} className='mr-2'/>Login</>
            )}
          </button>

        </div>
      </form>
    </div>
  );
}

export default Login;

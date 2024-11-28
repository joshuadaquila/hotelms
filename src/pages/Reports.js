import React, { useEffect, useState } from 'react';
import '../../src/output.css';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { fetchData } from '../api';

export default function Reports(){
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return(
    <div className="flex w-screen h-screen">
      
      <Sidebar menu={'reports'} />
      <div className="flex-1 p-10 text-center">
        <p className='text-4xl font-bold'>REPORTS</p>
      </div>
    </div>


  )
}
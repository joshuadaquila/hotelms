import React, { useEffect, useState } from 'react';
import '../../src/output.css';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { fetchData } from '../api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { GuestDetails } from '../components/GuestDetails';
import { BillingDetails } from '../components/BillingDetails';

export default function Billing() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [showGuestDetails, setShowGuestDetails] = useState(false);

  const [billingData, setBillingData] = useState()

  useEffect(() => {
    const loadGuest = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchData('billing');
        if (error) {
          setError(error);
        } else {
          setData(data);
          console.log(data)
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
  
    loadGuest();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleViewMore = (rowData) => {
    setShowGuestDetails(!showGuestDetails);
    setBillingData(rowData);
  };

  const filteredData = data.filter(guest => 
    guest.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.middlename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  console.log("data", data)
  return (
    <div className="flex min-w-screen min-h-screen">
      <div className='w-[320px]'>
        <Sidebar menu={'billing'} />
    
      </div>
      {showGuestDetails && <BillingDetails toggleThis={handleViewMore} data={billingData}/> }
      <div className="flex-1 p-10 text-center">
        <p className='text-4xl font-bold'>BILLING AND INVOICING</p>
        
        <div className="mb-4 p-2 flex justify-start items-start">
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by First Name, Last Name, or Middle Name"
            className="p-2 w-full border"
          />
        </div>

        <DataTable 
          value={filteredData.slice(first, first + rows)}
          className="p-datatable-responsive border-2 p-4 border-gray-300 rounded-lg shadow-md"
          paginator 
          rows={rows} 
          totalRecords={filteredData.length}
          onPage={onPageChange}
        >
          <Column field="guestid" header="Guest ID" filter filterPlaceholder="Search by Guest ID" />
          <Column field="lastname" header="Last Name" filter filterPlaceholder="Search by Last Name" />
          <Column field="firstname" header="First Name" filter filterPlaceholder="Search by First Name" />
          <Column field="checkindate" header="Checkin Date" filter filterPlaceholder="Search by Check-in Date" />
          <Column 
            body={(rowData) => (
              <Button 
                label="View" 
                onClick={() => handleViewMore(rowData)} 
                className=" bg-green-600 p-2 rounded-full text-white"
              />
            )}
            header="Actions" 
          />
        </DataTable>

      </div>
    </div>
  );
}

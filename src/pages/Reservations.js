import React, { useEffect, useState } from 'react';
import '../../src/output.css';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { fetchData, postData } from '../api';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faEdit, faEllipsisH, faTrash } from '@fortawesome/free-solid-svg-icons';
import ReservationForm from '../components/ReservationForm';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import UpdateReservationForm from '../components/UpdateReservationForm';
import { Confirmation } from '../components/Confirmation';

const localizer = momentLocalizer(moment); // Set up moment as the localizer for the calendar

export default function Reservations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]); // For upcoming reservations
  const [events, setEvents] = useState([]); // Events for the calendar
  const [dataToUpdate, setDataToUpdate] = useState()

  const [showRegForm, setShowregForm] = useState(false);
  const [showUpdateResForm, setShowUpdateResForm]= useState(false);
  const [showConf, setShowConf] = useState(false);

  useEffect(() => {
    const loadReservations = async () => {
      setLoading(true);
      try {
        const { data: upcomingData, error: upcomingError } = await fetchData('reservations');
        if (upcomingError) {
          setError(upcomingError);
        } else {
          setData(upcomingData);
          setEvents(formatReservationsToEvents(upcomingData)); // Transform data to calendar events
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  // Transform reservation data into event objects for the calendar
  const formatReservationsToEvents = (reservations) => {
    return reservations.map(reservation => ({
      title: `${reservation.name} - ${reservation.roomname}`,
      start: new Date(reservation.checkindate), // start time
      end: new Date(reservation.checkoutdate), // end time, if available
    }));
  };

  const handleEdit = (data) => {
    setShowUpdateResForm(true);
    setDataToUpdate(data);
  }

  const handleDelete = (data) =>{
    setShowConf(true);
    setDataToUpdate(data);
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  console.log(dataToUpdate)

  return (
    <div className="flex min-w-screen min-h-screen">
      <div className='w-[320px]'>
        <Sidebar menu={'reservations'} />
      </div>

      <div className="flex-1 p-10 text-center">
        <p className="text-4xl font-bold mb-4">RESERVATIONS</p>

        <div className='flex justify-end items-end'>
          <button className='bg-blue-600 px-4 py-2 rounded-full text-white'
          onClick={()=> setShowregForm(true)}><FontAwesomeIcon icon={faPlusCircle} /> New Reservation</button>
        </div>
        {showRegForm && <ReservationForm toggleThis={()=> setShowregForm(false)}/>}
        {showUpdateResForm && <UpdateReservationForm data={dataToUpdate} toggleThis={()=> setShowUpdateResForm(false)}/>}
        {showConf && <Confirmation message={"Are you sure you want to delete this reservation?"} toggleThis={()=> setShowConf(false)} disabled={false} confirmed={()=> {postData('deleteReservation', dataToUpdate); window.location.reload()}}/>}
        <div className="my-3">
          <p className="text-2xl font-bold mb-3">Table View</p>
          <DataTable 
            value={data} // Bind the fetched data directly
            className="p-datatable-responsive border-2 p-4 border-gray-300 rounded-lg shadow-md"
            paginator 
            rows={5} // Adjust the rows displayed per page
          >
            <Column field="reservationid" header="Reservation ID" filter filterPlaceholder="Search by Reservation ID" />
            <Column field="name" header="Guest Name" filter filterPlaceholder="Search by Guest Name" />
            <Column field="roomname" header="Room Name" filter filterPlaceholder="Search by Room Name" />
            <Column 
              field="checkindate" 
              header="Check-in Date" 
              filter 
              filterPlaceholder="Search by Check-in Date" 
              body={(rowData) => moment(rowData.checkindate).format('MM/DD/YYYY HH:mm')} // Format date
            />
            <Column 
              field="checkoutdate" 
              header="Check-out Date" 
              filter 
              filterPlaceholder="Search by Check-out Date" 
              body={(rowData) => moment(rowData.checkoutdate).format('MM/DD/YYYY HH:mm')} // Format date
            />
            {/* <Column field="status" header="Status" filter filterPlaceholder="Search by Status" /> */}
            <Column field="date" header="Reserved at" filter filterPlaceholder="Search by Reservation Date" />
            <Column 

              body={(rowData) => (
                <div className="flex space-x-2">
                  {/* <Button 
                    // label="More" 
                    onClick={() => handleViewMore(rowData)} 
                    className="bg-green-600 p-2 rounded-full text-white m-1"
                  >
                    <FontAwesomeIcon icon={faEllipsisH}  />
                  </Button> */}
                  <Button 
                    // label="Edit" 
                    onClick={() => handleEdit(rowData)} 
                    className="bg-blue-600 p-2 rounded-full text-white m-1"
                  >
                    <FontAwesomeIcon icon={faEdit}  />
                  </Button>
                  <Button 
                    // label="Delete" 
                    onClick={() => handleDelete(rowData)} 
                    className="bg-red-600 p-2 rounded-full text-white m-1"
                  >
                    <FontAwesomeIcon icon={faTrash}  />
                  </Button>
                </div>
              )}
              header="Actions" 
            />


          </DataTable>
        </div>


        {/* Calendar View */}
        <div className="card mb-5">
          <p className="text-2xl font-bold mb-3">Calendar View</p>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            defaultView="month"
            views={['month', 'week', 'day']}
            popup
            selectable
            onSelectEvent={(event) => alert(`Reservation: ${event.title}`)} // Action on selecting an event
            onSelectSlot={(slotInfo) => alert(`Slot selected: ${slotInfo.start}`)} // Action on selecting a time slot
          />
        </div>

        
      </div>
    </div>
  );
}

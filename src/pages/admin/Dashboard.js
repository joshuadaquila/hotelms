import React, { useEffect, useState } from 'react';
import '../../../src/output.css';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { fetchData } from '../../api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { format } from 'date-fns';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components to Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const localizer = momentLocalizer(moment);


const AdminDashboard = () => {
  const [data, setData] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [checkedIn, setCheckedIn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState('');
  const [dataCount, setDataCount] = useState({ currentMonth: 0, previousMonth: 0 });

  const updateTime = () => {
    const currentTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
    setNow(currentTime);
  };

  const chartData = {
    labels: ['Current Month', 'Previous Month'],
    datasets: [
      {
        label: ['Check-Ins', 'Check-Ins'],
        data: [dataCount.currentMonth, dataCount.previousMonth],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
        borderWidth: 1,
      },
    ],
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  useEffect(() => {
    const loadRooms = async () => {
      const { data, error } = await fetchData('rooms');
      if (error) {
        setError(error);
      } else {
        setData(data);
        // console.log(data)
      }
      setLoading(false);
    };
    loadRooms();
  }, []);

  useEffect(() => {
    const fetchMontlyCounts = async () => {
      const { data, error } = await fetchData('admin/getMonthlyOccupants');
      if (error) {
        setError(error);
      } else {
        setDataCount({currentMonth: data[0].total_current_month, previousMonth: data[0].total_previous_month})
        // console.log("DATA", data)
      }
      setLoading(false);
    };
    fetchMontlyCounts();
  }, []);

  // console.log("count", dataCount)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: upcomingData, error: upcomingError } = await fetchData('reservations');
        if (upcomingError) {
          setError(upcomingError);
        } else {
          setReservations(upcomingData);
        }

        const { data: checkedInData, error: checkedInError } = await fetchData('checkedin');
        if (checkedInError) {
          setError(checkedInError);
        } else {
          setCheckedIn(checkedInData);
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (rowData) => {
    const date = new Date(rowData.checkindate);
    return format(date, 'EEEE, MMMM d hh:mm a');
  };

  const events = [
    // Map reservations to calendar events
    ...reservations.map((res) => ({
      title: `${res.name} - ${res.roomname}`,
      start: new Date(res.checkindate),
      end: new Date(res.checkoutdate),
      allDay: false,
      resource: { type: 'reservation' },
    })),
    
    // Map checked-in data to calendar events
    ...checkedIn.map((checkin) => {
      // Split the firstnames and lastnames into arrays
      const firstNames = checkin.firstname.split(', ').map(name => name.trim());
      const lastNames = checkin.lastname.split(', ').map(name => name.trim());
      
      // Combine each firstname with its corresponding lastname
      const fullNames = firstNames.map((firstName, index) => {
        const lastName = lastNames[index] || ''; // Handle mismatched lengths
        return `${firstName} ${lastName}`;
      });
  
      // Join the full names with a comma
      const combinedNames = fullNames.join(', ');
  
      return {
        title: `${combinedNames} - ${checkin.name}`,
        start: new Date(checkin.checkindate),
        end: new Date(checkin.checkoutdate),
        allDay: false,
        resource: { type: 'checkedin' },
      };
    }),
  ];
  
  

  // console.log("checkin", checkedIn)

  const eventStyleGetter = (event) => {
    let backgroundColor = event.resource.type === 'checkedin' ? '#315900' : '#9c9908';
    return { style: { backgroundColor } };
  };

  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex min-w-screen">
      <div className='w-[320px]'>
        <AdminSidebar menu={'dashboard'} />
      </div>
      <div className="flex-1 p-10">
        <div className="pic-bg h-28 text-white flex flex-col justify-center items-center relative">
          <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
          <div className="text-center relative z-10">
            <p className="text-2xl font-semibold shadow-md mb-1">University of Antique</p>
            <p className="text-4xl font-bold shadow-lg tracking-wide">HOTEL MANAGEMENT SYSTEM</p>
          </div>
          {/* <div className="relative z-10 my-4 w-10 h-1 bg-white rounded-full"></div>
          <div className="p-4 text-center relative z-10">
            <p className="text-lg font-medium">Today is</p>
            <p className="text-4xl font-extrabold shadow-lg mt-1">{now}</p>
          </div> */}
        </div>

        <div className="grid grid-cols-2 mt-12 gap-8">
          <div>
            <p className="text-4xl font-bold">Current Occupancy</p>
            <div className="grid grid-cols-3 p-5 bg-slate-300 rounded-md mt-4">
              <div className="flex flex-col justify-center items-center scale-95">
                <p className="text-lg font-semibold">Total Rooms</p>
                <p className="text-4xl font-bold py-2">8</p>
                <div className="text-left">
                  <p>Standard: <span>6</span></p>
                  <p>Deluxe: <span>2</span></p>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center">
                <p className="text-lg font-semibold">Occupied Rooms</p>
                <p className="text-4xl font-bold py-2">{8 - (data[2]?.available_count || 0)}</p>
                <div className="text-left">
                  <p>Standard: <span id="occu-standard">{6 - (data[1]?.available_count || 0)}</span></p>
                  <p>Deluxe: <span id="occu-deluxe">{2 - (data[0]?.available_count || 0)}</span></p>
                </div>
              </div>

              <div className="flex scale-110 outline outline-1 rounded-md
              flex-col justify-center items-center bg-white">
                <p className="text-lg font-semibold">Available Rooms</p>
                <p className="text-4xl font-bold py-2">{data[2]?.available_count || 0}</p>
                <div className="text-left">
                  <p>Standard: <span>{data[1]?.available_count || 0}</span></p>
                  <p>Deluxe: <span>{data[0]?.available_count || 0}</span></p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-4xl font-bold mt-10">Upcoming Reservations</p>
              <DataTable value={reservations} paginator rows={5} emptyMessage="No upcoming reservations found." responsiveLayout="scroll">
                <Column field="name" header="Guest Name" sortable />
                <Column field="roomname" header="Room" sortable />
                <Column field="checkindate" header="Date" body={formatDate} sortable />
              </DataTable>
            </div>
          </div>

          

          <div>
            <p className="text-4xl font-bold mb-4">Occupancy Trend</p>
              <Bar data={chartData} options={chartOptions} />
            <p className="text-4xl font-bold mb-4">Calendar</p>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              eventPropGetter={eventStyleGetter}
            />
            <p><FontAwesomeIcon icon={faSquare} color='#315900'/> Checked-In <FontAwesomeIcon icon={faSquare} color='#9c9908'/> Reservation</p>
            
          </div>

          
        </div>

        {/* Calendar Section */}
        
      </div>
    </div>
  );
};

export default AdminDashboard;

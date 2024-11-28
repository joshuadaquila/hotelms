import React, { useEffect, useState } from 'react';
import '../../src/output.css';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { fetchData, postData } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faTv, faRestroom, faChevronDown, faMartiniGlass, faShower, faBath } from '@fortawesome/free-solid-svg-icons';
import Cardroom from '../components/Cardroom';
import { RegistrationForm } from '../components/RegistrationForm';
import { Confirmation } from '../components/Confirmation';
import { BillingStatement } from '../components/BillingStatement';

function Checkin() {
  const [showInclusionStandard, setShowInclusionStandard] = useState(false);
  const [showInclusionDeluxe, setShowInclusionDeluxe] = useState(false);
  const [data, setData] = useState([]);

  const [occupied, setOccupied] = useState([]);
  const [occupiedDetails, setOccupiedDetails] = useState([]);

  const [reserved, setReserved] = useState([]);
  const [reservedDetails, setReservedDetails] = useState([]);

  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(true); 

  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false)

  const [roomid, setRoomId] = useState(0);
  const [roomname, setRoomName] = useState('')

  const [showBilling, setShowBilling] = useState(false);
  const [guest, setGuest] = useState();

  // room states
  const initialRoomState = { status: 'Available', guest: '', date: '' };
  const [stdRm1, setStdRm1] = useState(initialRoomState);
  const [stdRm2, setStdRm2] = useState(initialRoomState);
  const [stdRm3, setStdRm3] = useState(initialRoomState);
  const [stdRm4, setStdRm4] = useState(initialRoomState);
  const [stdRm5, setStdRm5] = useState(initialRoomState);
  const [stdRm6, setStdRm6] = useState(initialRoomState);
  const [delRm1, setDelRm1] = useState(initialRoomState);
  const [delRm2, setDelRm2] = useState(initialRoomState);

  useEffect(() => {
    const storedName = localStorage.getItem('showBilling');
    const guest = localStorage.getItem('guest');
    if (storedName) {
      setShowBilling(true);
      setGuest(guest);
    }
  }, []);

  useEffect(() => {
    const getOccupied = async () => {
      setLoading(true);
      try {
        const response = await fetchData('getReserved');
        const { data: reservedData, errorRes } = response;  // Destructure the response object

        const { data, error } = await fetchData('getOccupied');
        if (error) {
          setError(error);
        } else {
          
          setReserved(reservedData);
          setOccupied(data);
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
  
    getOccupied();
  }, []);

  const checkOut = (e) => {
    e.preventDefault();
    postData('checkout', {roomid: roomid})
      .then(({ data, error }) => {
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('Success:', data);
          
        }
      })
      .catch((error) => console.error('Error:', error));
  }
  
  
  // console.log(reserved);

  useEffect(() => {
    const getAllOccupiedDetails = async () => {
      const detailsArray = [];
      const reservedDetailsArray = [];
  
      // Fetch details for occupied rooms
      for (const room of occupied) {
        try {
          const { data, error } = await fetchData(`getOccupiedDetails?room=${room.name}`);
          if (error) {
            setError(error);
            continue;
          }
          detailsArray.push(...data);
        } catch (err) {
          setError('An unexpected error occurred.');
        }
      }
  
      // Fetch details for reserved rooms (using reserved state)
      for (const room of reserved) {
        try {
          const { data, error } = await fetchData(`getReservedDetails?room=${room.roomid}`);
          if (error) {
            setError(error);
            continue;
          }
          reservedDetailsArray.push(...data);
        } catch (err) {
          setError('An unexpected error occurred.');
        }
      }
  
      // Update both occupied and reserved details states
      
      setReservedDetails(reservedDetailsArray);
      setOccupiedDetails(detailsArray);
    };
  
    if (occupied.length > 0 || reserved.length > 0) {
      getAllOccupiedDetails();
    }
  }, [occupied, reserved]);

  console.log("reserveddetails", reservedDetails);
  // console.log("OD", occupiedDetails)
  

  useEffect(() => {
    // Map room names to their state setter functions
    const roomSetters = {
      'Standard Room - Room 1': setStdRm1,
      'Standard Room - Room 2': setStdRm2,
      'Standard Room - Room 3': setStdRm3,
      'Standard Room - Room 4': setStdRm4,
      'Standard Room - Room 5': setStdRm5,
      'Standard Room - Room 6': setStdRm6,
      'Deluxe Room - Room 1': setDelRm1,
      'Deluxe Room - Room 2': setDelRm2,
    };

    // console.log(occupiedDetails);
    // Update room states based on `occupiedDetails`
    reservedDetails.forEach((reservation) => {
      const roomSetter = roomSetters[reservation.roomname];

      console.log("rromsetter", roomSetter)
      if (roomSetter) {
        roomSetter({
          status: 'Reserved',
          guest: reservation.name, // Or handle reserved guest name if you have that info
          date: reservation.checkindate, // Assuming you have a reserved checkout date
        });
      }
    });
    occupiedDetails.forEach((detail) => {
      const roomSetter = roomSetters[detail.name];
      if (roomSetter) {
        // Split lastname and firstname into arrays
        const lastNames = detail.lastname.split(', ').map(name => name.trim());
        const firstNames = detail.firstname.split(', ').map(name => name.trim());
    
        // Get the first guest's first name and last name pair (index 0)
        const guest = `${lastNames[0]} ${firstNames[0]}`;
    
        // Set room details for the first guest only
        roomSetter({ 
          status: 'Occupied', 
          guest: guest, 
          date: detail.checkoutdate 
        });
      }
    });
    

    
  }, [occupiedDetails, reservedDetails]);

  console.log(stdRm2, stdRm6)

  const toggleForm = () => [
    setShowForm(!showForm)
  ];

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen min-w-screen">
      <div className='w-[320px]'>
        {showForm && <RegistrationForm toggleForm={toggleForm} roomNumber={roomid} roomName={roomname} />}
        {showConfirmation && <Confirmation message={"Confirm Check-Out?"} toggleThis={()=> setShowConfirmation(false)}
          confirmed={checkOut}/>}
        <Sidebar menu="checkin" />
      </div>
      <div className="flex-1 p-10">
        <p className="text-4xl font-bold">Standard Room</p>
        <p className="text-2xl font-semibold">P1500.00</p>

        {showBilling &&
          <BillingStatement
            toggleThis={()=>{setShowBilling(false); localStorage.removeItem('showBilling'); localStorage.removeItem('guest')}}
            guestName={localStorage.getItem("guestName")}
            // billingnumber="1"
            roomNumber={localStorage.getItem("roomNumber")}
            roomCharges={localStorage.getItem("roomCharges")}
            totalAmountDue={localStorage.getItem("totalAmountDue")}
            amountPaid={localStorage.getItem("amountPaid")}
            change={localStorage.getItem("change")}
            paymentDate={new Date()}  // current date and time
        />
          }

        <div className="ml-4">
          <div className="flex" style={{ paddingLeft: '15px' }}>
            <button onClick={() => setShowInclusionStandard(!showInclusionStandard)}>
              Inclusion <FontAwesomeIcon icon={faChevronDown} />
            </button>
          </div>

          {showInclusionStandard && (
            <div className="roominc mr-4 absolute bg-white shadow-md p-4 rounded-md" style={{ marginLeft: '15px' }}>
              <p><FontAwesomeIcon icon={faBed} /> 5 Single Bed</p>
              <p><FontAwesomeIcon icon={faTv} /> Television</p>
              <p><FontAwesomeIcon icon={faRestroom} /> Comfort Room</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 p-10" style={{ gridGap: '20px' }}>
          <Cardroom num={'1'} status={stdRm1.status} toggleForm={() =>{setRoomId(1), stdRm1.status !== 'Occupied' ? (toggleForm(), setRoomName('Standard Room - Room 1')) : setShowConfirmation(true)}} guest={stdRm1.guest} date={stdRm1.date} />
          <Cardroom num={'2'} status={stdRm2.status} toggleForm={() =>{setRoomId(2), stdRm2.status !== 'Occupied' ? (toggleForm(), setRoomName('Standard Room - Room 2')) : setShowConfirmation(true)}} guest={stdRm2.guest} date={stdRm2.date} />
          <Cardroom num={'3'} status={stdRm3.status} toggleForm={() =>{setRoomId(3), stdRm3.status !== 'Occupied' ? (toggleForm(), setRoomName('Standard Room - Room 3')) : setShowConfirmation(true)}} guest={stdRm3.guest} date={stdRm3.date} />
          <Cardroom num={'4'} status={stdRm4.status} toggleForm={() =>{setRoomId(4), stdRm4.status !== 'Occupied' ? (toggleForm(), setRoomName('Standard Room - Room 4')) : setShowConfirmation(true)}} guest={stdRm4.guest} date={stdRm4.date} />
          <Cardroom num={'5'} status={stdRm5.status} toggleForm={() =>{setRoomId(5), stdRm5.status !== 'Occupied' ? (toggleForm(), setRoomName('Standard Room - Room 5')) : setShowConfirmation(true)}} guest={stdRm5.guest} date={stdRm5.date} />
          <Cardroom num={'6'} status={stdRm6.status} toggleForm={() =>{setRoomId(6), stdRm6.status !== 'Occupied' ? (toggleForm(), setRoomName('Standard Room - Room 6')) : setShowConfirmation(true)}} guest={stdRm6.guest} date={stdRm6.date} />

        </div>

        <p className="text-4xl font-bold">Deluxe Room</p>
        <p className="text-2xl font-semibold">P1500.00</p>

        <div className="ml-4">
          <div className="flex" style={{ paddingLeft: '15px' }}>
            <button onClick={() => setShowInclusionDeluxe(!showInclusionDeluxe)}>
              Inclusion <FontAwesomeIcon icon={faChevronDown} />
            </button>
          </div>

          {showInclusionDeluxe && (
            <div className="roominc mr-4 absolute bg-white shadow-md p-4 rounded-md" style={{ marginLeft: '15px' }}>
              <p><FontAwesomeIcon icon={faBed} /> 1 Double Bed</p>
              <p><FontAwesomeIcon icon={faBed} /> 1 Single Bed</p>
              <p><FontAwesomeIcon icon={faMartiniGlass} /> Mini Bar</p>
              <p><FontAwesomeIcon icon={faShower} /> Hot and Cold Shower</p>
              <p><FontAwesomeIcon icon={faBath} /> Bathtub</p>
              <p><FontAwesomeIcon icon={faTv} /> Television</p>
              <p><FontAwesomeIcon icon={faRestroom} /> Comfort Room</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 p-10" style={{ gridGap: '20px' }}>
          <Cardroom num={'1'} status={delRm1.status} toggleForm={() => {setRoomId(7), delRm1.status !== 'Occupied' ? (toggleForm(), setRoomName('Deluxe Room - Room 1')) : setShowConfirmation(true)}} guest={delRm1.guest} date={delRm1.date} />
          <Cardroom num={'2'} status={delRm2.status} toggleForm={() => {setRoomId(8), delRm2.status !== 'Occupied' ? (toggleForm(), setRoomName('Deluxe Room - Room 2')) : setShowConfirmation(true)}} guest={delRm2.guest} date={delRm2.date} />
        </div>
      </div>
    </div>
  );
}

export default Checkin;

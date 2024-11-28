import React from "react";
import '../../src/output.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faTv, faRestroom, faDoorClosed, faChevronDown, faMartiniGlass, faShower, faBath } from '@fortawesome/free-solid-svg-icons';


function Cardroom({num, guest, status, date, toggleForm}){
  return(
    <div className="shadow-lg p-5 grid grid-cols-2" style={{ borderRadius: '15px'}}>
      <div className="flex flex-col items-center justify-center">
        <FontAwesomeIcon icon={faDoorClosed} className="text-4xl" />
        <p className="text-lg font-semibold">Room {num} </p>
      </div>

      <div className="cardl flex flex-col justify-center items-center text-md">
        <div className="flex flex-col items-center" style={{ textAlign: 'center' }}>
          <p className="font-semibold">Status: <span className="font-bold" 
          style={{ color: status === 'Occupied' ? 'red' : status === 'Reserved' ? 'orange' : 'green' }}>{status}</span></p>
        </div>
        <div style={{display: status === 'Occupied' || status === 'Reserved' ? "" : "none"}}>
          <p>Guest: <span>{guest}</span></p>
          <p>{status === "Occupied"? "Check-Out" : "Check-In"}: <span>{date}</span></p>
        </div>

        <button
          className="w-[70%] btn"
          onClick={toggleForm}
          style={{
            backgroundColor:
              status === 'Occupied' ? 'red' : 
              status === 'Reserved' ? 'orange' : 
              'green',
            height: '40px',
            borderRadius: '30px',
            color: 'white',
          }}
        >
          {status === 'Occupied' ? 'Check-Out' : 'Check-In'}
        </button>

      </div>
    </div>
  )
}

export default Cardroom;
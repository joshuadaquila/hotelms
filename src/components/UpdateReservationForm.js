import { faCheckCircle, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Confirmation } from "./Confirmation";
import { postData } from "../api";
import { Notice } from "./Notice";

export default function UpdateReservationForm({ toggleThis, data }) {
  const rooms = [
    { id: 1, name: "Standard Room - Room 102" },
    { id: 2, name: "Standard Room - Room 103" },
    { id: 3, name: "Standard Room - Room 201" },
    { id: 4, name: "Standard Room - Room 202" },
    { id: 5, name: "Standard Room - Room 205" },
    { id: 6, name: "Standard Room - Room 206" },
    { id: 7, name: "Deluxe Room - Room 203" },
    { id: 8, name: "Deluxe Room - Room 204" },
  ];

  const [guestName, setGuestName] = useState(data.name);
  const [roomId, setRoomId] = useState(data.roomid);
  const [checkinDate, setCheckinDate] = useState(data.checkindate);
  const [checkoutDate, setCheckoutDate] = useState(data.checkoutdate);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [showSaveConf, setShowSaveConf] = useState(false);
  const [showReqErr, setShowReqErr] = useState(false)

  const reservationData = {
    guestName,
    roomId,
    checkinDate,
    checkoutDate,
    reservationid: data.reservationid
  };

  const handleSubmit = (e) => {
    // e.preventDefault();
    console.log("submitting...", reservationData)

    if (guestName === "" && roomId === null && checkinDate === "" && checkoutDate === ""){
      setShowReqErr(true)
    }else{
      postData('updateReservation', reservationData)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error:', error);
            setShowSaveConf(false);
            setShowNotice(true);
          } else {
            console.log('Success:', data);
            window.location.reload();
          }
        })
        .catch((error) => console.error('Error:', error));
      }

  };

  const handleGuestNameChange = (e) => {
    setGuestName(e.target.value);
  };

  const handleRoomChange = (e) => {
    setRoomId(e.target.value);
  };

  const handleCheckinDateChange = (e) => {
    setCheckinDate(e.target.value);
  };

  const handleCheckoutDateChange = (e) => {
    setCheckoutDate(e.target.value);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      {showNotice && <Notice message={"Conflict with room schedule!"} toggleThis={()=> setShowNotice(false)} color={"text-red-600"}/>}
      {showSaveConf && <Confirmation message={"Save changes?"} confirmed={(e)=> {e.preventDefault(); handleSubmit()}} toggleThis={()=> setShowSaveConf(false)}/>}
      {showReqErr && <Notice message={"Please fill-out all the fields!"} color={"text-red-600"} toggleThis={()=> setShowReqErr(false)}/>}
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-4xl">
        <p className="text-center font-bold text-xl mb-6">Update Reservation Form</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Guest Name</label>
            <input
              type="text"
              value={guestName}
              required
              onChange={handleGuestNameChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Room Number</label>
            <select
              value={roomId}
              required
              onChange={handleRoomChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Check-in Date & Time</label>
            <input
              type="datetime-local"
              value={checkinDate}
              required
              onChange={handleCheckinDateChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Check-out Date & Time</label>
            <input
              type="datetime-local"
              value={checkoutDate}
              required
              onChange={handleCheckoutDateChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        {showConfirmation && <Confirmation message={"Are you sure you want to cancel the update to your reservation?"} toggleThis={()=> setShowConfirmation(false)} confirmed={toggleThis}/>}
        <div className="flex justify-center items-center mt-4">
          <button className="bg-red-600 px-4 py-2 rounded-full text-white mr-2"
          onClick={()=> setShowConfirmation(true)}>
            <FontAwesomeIcon icon={faXmarkCircle} /> Cancel
          </button>
          <button className="bg-green-600 px-4 py-2 rounded-full text-white" onClick={(e)=>{
            e.preventDefault();
            if (guestName === "" && checkinDate === "" && checkoutDate === ""){
              setShowReqErr(true)
            }else{
              setShowSaveConf(true)
            }}}>
            <FontAwesomeIcon icon={faCheckCircle} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

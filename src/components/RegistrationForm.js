import { faArrowCircleRight, faClose, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useState } from "react";
import '../../src/output.css';
import { Terms } from "./Terms";
import { Notice } from "./Notice";
import { Confirmation } from "./Confirmation";
import { fetchData, postData } from "../api";
import { PaymentForm } from "./PaymentForm";

export function RegistrationForm({toggleForm, roomNumber, roomName}) {
  // Function to get the current date and time in GMT+8
const getCurrentDateTimeInGMT8 = () => {
  const currentDateTime = new Date();
  
  // Adjust to GMT+8
  const gmt8Offset = 8 * 60; // GMT+8 in minutes
  const localOffset = currentDateTime.getTimezoneOffset(); // Local timezone offset in minutes
  const gmt8DateTime = new Date(currentDateTime.getTime() + (gmt8Offset + localOffset) * 60 * 1000);

  return gmt8DateTime;
};

// Get current date and time in GMT+8
const currentDateTime = getCurrentDateTimeInGMT8();

// Create checkout date and time: one day after currentDateTime at 12:00 PM
const checkoutDateTime = new Date(currentDateTime);
checkoutDateTime.setDate(checkoutDateTime.getDate() + 1); // Add one day
checkoutDateTime.setHours(12, 0, 0, 0); // Set time to 12:00 PM

// Function to format date and time for HTML datetime-local input
const formatForDateTimeLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Format for datetime-local input
const currentDateTimeFormatted = formatForDateTimeLocal(currentDateTime);
const checkoutDateTimeFormatted = formatForDateTimeLocal(checkoutDateTime);

// You can now use these formatted strings in your HTML
  const [showTC, setShowTC] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [showCancelConf, setShowCancelConf] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showReqErr, setShowReqErr] = useState(false);

  const [guests, setGuests] = useState([{ // Initialize guest fields
    lastName: '',
    firstName: '',
    middleName: '',
    homeAddress: '',
    contactNumber: '',
    telephoneNumber: '',
    companyOrganization: '',
    companyTelephone: '',
    address: '',
    nationality: '',
    passportNumber: '',
    email: '',
    checkInDate: currentDateTimeFormatted,
    checkOutDate: checkoutDateTimeFormatted,
    roomNumber: roomNumber,
    remarks: ''
  }]);

  const addGuest = () => {
    setGuests([...guests, {
      lastName: '',
      firstName: '',
      middleName: '',
      homeAddress: '',
      contactNumber: '',
      telephoneNumber: '',
      companyOrganization: '',
      companyTelephone: '',
      address: '',
      nationality: '',
      passportNumber: '',
      email: '',
      checkInDate: currentDateTimeFormatted,
      checkOutDate: checkoutDateTimeFormatted,
      roomNumber: roomNumber,
      remarks: ''
    }]);
  };

  const removeGuest = (index) => {
    const newGuests = guests.filter((_, i) => i !== index);
    setGuests(newGuests);
  };

  const handleInputChange = (index, field, value) => {
    const newGuests = guests.map((guest, i) =>
      i === index ? { ...guest, [field]: value } : guest
    );
    setGuests(newGuests);
  };

  const handleSubmit = (e) => {
    console.log("submitting...")
    postData('checkinGuest', guests)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error:', error);
        } else {
          // console.log('Success:', data);
          localStorage.setItem('showBilling', true);
          localStorage.setItem('guest', guests);
        }
      })
      .catch((error) => console.error('Error:', error));

  };
  const validateGuest = (guest) => {
    const errors = {};
  
    if (!guest.lastName.trim()) errors.lastName = "Last name is required.";
    if (!guest.firstName.trim()) errors.firstName = "First name is required.";
    if (!guest.homeAddress.trim()) errors.homeAddress = "Home address is required.";
    if (!guest.contactNumber.trim()) errors.contactNumber = "Contact number is required.";
    if (!guest.nationality.trim()) errors.nationality = "Nationality is required.";
    if (!guest.email.trim()) errors.email = "Email is required.";
    if (!guest.checkInDate.trim()) errors.checkInDate = "Check-in date is required.";
    if (!guest.checkOutDate.trim()) errors.checkOutDate = "Check-out date is required.";
    // if (!guest.roomNumber.trim()) errors.roomNumber = "Room number is required.";
  
    // Optional: Add additional validation, like email format
    if (guest.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
      errors.email = "Invalid email format.";
    }
  
    return errors;
  };

  const validateGuests = () => {
    const validationErrors = guests.map(validateGuest);
  
    // Check if there are any errors for any guest
    const hasErrors = validationErrors.some((errors) => Object.keys(errors).length > 0);
  
    if (hasErrors) {
      console.log("Validation failed:", validationErrors);
      setShowReqErr(true);
      return false;
    }
  
    return true; // All fields are valid
  };
  



  console.log("Guests: ", errors)

  return (
    
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex 
    items-center justify-center overflow-y-scroll z-50">
      {showCancelConf &&
          <Confirmation message={"Cancel registration?"} toggleThis={()=> setShowCancelConf(false)}
            confirmed={(e)=> {e.preventDefault(); toggleForm()}}
          />
        }
      {showReqErr && <Notice message={"Please fill-out all the required fields."} color={"text-red-600"} toggleThis={()=> setShowReqErr(false)}/>}
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-4xl"
       style={{maxHeight: '90%', overflowY:'scroll'}} >
        <div className="flex relative justify-end items-end">
          <button onClick={()=>{setShowCancelConf(true)}}
          className="top-4 right-4 text-gray-700 hover:text-gray-900">
            <FontAwesomeIcon icon={faClose} size="lg" />
          </button>
        </div>
        
        <h2 className="text-xl font-bold mb-2">Guest Registration Form</h2>
        <p className="mb-2 ml-4">* Please fill-out all the required fields.</p>

        <form>
          {/* Grouping Names */}
          {guests.map((guest, index) => (
          <div key={index} className="p-4 rounded-md" style={{marginBottom: '20px', outline: '1px gray solid'}}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700" htmlFor="lastName">
                Last Name *
              </label>
              <input
                type="text"
                id={`lastName-${index}`}
                required
                value={guest.lastName}
                onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
                // required
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="firstName">
                First Name *
              </label>
              <input
                type="text"
                id={`firstName-${index}`}
                required
                onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
                // required
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="middleName">
                Middle Name *
              </label>
              <input
                type="text"
                id={`middleName-${index}`}
                required
                onChange={(e) => handleInputChange(index, 'middleName', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
                // required
              />
            </div>
          </div>

          {/* Home Address and Contact No */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700" htmlFor="homeAddress">
                Home Address *
              </label>
              <input
                type="text"
                id={`homeAddress-${index}`}
                required
                onChange={(e) => handleInputChange(index, 'homeAddress', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
                // required
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="contactNumber">
                Contact No. *
              </label>
              <input
                type="tel"
                id={`contactNumber-${index}`}
                required
                onChange={(e) => handleInputChange(index, 'contactNumber', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
                // required
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700" htmlFor="telephoneNumber">
                Telephone Number (Optional)
              </label>
              <input
                type="tel"
                id={`telephoneNumber-${index}`}
                onChange={(e) => handleInputChange(index, 'telephoneNumber', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="companyOrganization">
                Company/Organization (Optional)
              </label>
              <input
                type="text"
                id={`companyOrganization-${index}`}
                onChange={(e) => handleInputChange(index, 'companyOrganization', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Optional Company Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700" htmlFor="companyTelephone">
                Telephone (Company) (Optional)
              </label>
              <input
                type="tel"
                id={`companyTelephone-${index}`}
                onChange={(e) => handleInputChange(index, 'companyTelephone', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="address">
                Address (Company)
              </label>
              <input
                type="text"
                id={`address-${index}`}
                onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Nationality */}
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="nationality">
              Nationality *
            </label>
            <select
              id={`nationality-${index}`}
              value={guest.nationality}
              required
              onChange={(e) => handleInputChange(index, 'nationality', e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded"
              // required
            >
              <option value="" disabled selected>
                Select your nationality
              </option>
              <option value="Filipino">Filipino</option>
              <option value="American">American</option>
              <option value="British">British</option>
              <option value="Canadian">Canadian</option>
              <option value="Australian">Australian</option>
              {/* Add more options as needed */}
            </select>
          </div>

          {/* Passport and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700" htmlFor="passportNumber">
                Passport No. (Optional)
              </label>
              <input
                type="text"
                id={`passportNumber-${index}`}
                onChange={(e) => handleInputChange(index, 'passportNumber', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="email">
                Email *
              </label>
              <input
                type="email"
                id={`email-${index}`}
                required
                onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
                // required
              />
            </div>
          </div>

          {/* Dates and Room No */}
          {index <= 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700" htmlFor="checkInDate">
                Check-in Date *
              </label>
              <input
                type="datetime-local"
                id={`checkInDate-${index}`}
                required
                value={guest.checkInDate}
                onChange={(e) => handleInputChange(index, 'checkInDate', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
                // required
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="checkOutDate">
                Check-out Date *
              </label>
              <input
                type="datetime-local"
                id={`checkOutDate-${index}`}
                value={guest.checkOutDate}
                required
                onChange={(e) => handleInputChange(index, 'checkOutDate', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
                // required
              />
            </div>
          </div>
          )}

          {/* Room No and Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700" htmlFor="roomNumber">
                Room No. *
              </label>
              <input
                type="text"
                readOnly
                // id={`roomNumber-${index}`
                value={roomName}
                required
                onChange={(e) => handleInputChange(index, 'roomNumber', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100"
                // required
              />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="remarks">
                Remarks
              </label>
              <textarea
                id={`remarks-${index}`}
                onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded"
              ></textarea>
            </div>
          </div>


          <div className="flex justify-between items-center">
          {index > 0 && (
            <button
              type="button"
              onClick={() => {
                removeGuest(index);
              }}
              className="text-red-500 hover:text-red-700"
              style={{ color: 'red' }}
            >
              <FontAwesomeIcon icon={faTrash} color="red" className="mr-2" />
              Remove Guest
            </button>
          )}

            </div>
          </div>
          ))}

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={addGuest}
              className="text-blue-500 flex items-center hover:text-blue-700"
            >
              Add Another Guest
              <FontAwesomeIcon icon={faPlusCircle} className="ml-2" />
            </button>
          </div>

          {showTC && <Terms toggleThis={()=>setShowTC(!showTC)}/>}  
          <div className="flex items-center">
            
            <label htmlFor="terms" className="text-gray-700">
              * Agreed to the <a onClick={()=> setShowTC(!showTC)} className="text-blue-500 underline cursor-pointer">terms and conditions</a>.
            </label>
          </div>
          
          {showPayment && <PaymentForm onSubmit={handleSubmit} toggleThis={()=> setShowPayment(false)}
            guestName={guests[0].firstName+ " "+ guests[0].lastName}
            roomNumber={roomName}
            totalAmountDue={1500.00}
            roomid={roomNumber}
          />}

          <div className="flex justify-end w-full">
            <div onClick={(e)=> {
                e.preventDefault();  
                const validationErrors = guests.map(validateGuest);
                setErrors(validationErrors);

                if (validateGuests()) {
                  console.log("Form is valid. Proceeding to submit.");
                  // Proceed with submission
                  setShowPayment(true);
                }
              }
            
            }
              className="bg-blue-600 text-white p-2 flex justify-center 
              items-center rounded-full hover:bg-blue-600 cursor-pointer"
            >
              Proceed to Payment
              <FontAwesomeIcon icon={faArrowCircleRight} size="lg" className="ml-2"/>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useRef, useState, useEffect } from "react";
import ualogo from '../resources/ualogo.jpg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faPrint } from "@fortawesome/free-solid-svg-icons";
import { fetchData } from "../api";
import Loader from "./Loader";

export const BillingDetails = React.forwardRef(({
  data,
  guestName,
  roomNumber,
  roomCharges,
  totalAmountDue,
  amountPaid,
  change,
  paymentDate,
  billingnumber,
  toggleThis
}, ref) => {
  const billingRef = useRef(null);

  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState([])

  // Print function
  const handlePrint = (e) => {
    e.preventDefault();
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Billing Statement</title>');
    printWindow.document.write(`
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .footer {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 12px;
        }
        .billing-content {
          border: 1px solid #ccc;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        h2 {
          margin: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .total {
          font-weight: bold;
          font-size: 16px;
        }
        .thank-you {
          text-align: center;
          margin-top: 20px;
        }
      </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write(billingRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    const loadGuest = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchData('getRoomInfo', {roomId: 1});
        console.log("room", data)
        if (error) {
          setError(error);
        } else {
          setRoomData(data);
          console.log("room", data)
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
  
    loadGuest();
  }, []);

  if (loading) {
    return <p></p>;
  }
  
  if (error.length > 0) {
    return <p className="text-red-600">Error: {error}</p>; // Show error message
  }
  
  // if (!roomData) {
  //   return <p className="text-gray-600">No room data available.</p>; // Handle missing data gracefully
  // }
  


  console.log(roomData)
  return (
    <div  className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div  className="relative bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-4xl flex flex-col">
        <FontAwesomeIcon icon={faClose} size="lg" className="absolute -right-0 -top-0 p-2 cursor-pointer" onClick={toggleThis}/>
        {/* <div className="bg-green-200 outline outline-green-500 rounded-lg mb-4">
          <p className="p-2">Saved Successfully!</p>
        </div> */}

        <div ref={billingRef}>
        <div className="header flex justify-center items-center flex-col">
          <img src={ualogo} alt="UA Logo" style={{ maxWidth: '80px' }} />
          <p className="font-semibold text-lg">University of Antique Hotel</p>
          <h2 className="invoice-title font-bold text-2xl">BILLING STATEMENT</h2>
          
        </div>
        
        <div className="billing-content">
          <div className="grid grid-cols-2 m-4">
            <div>
              <p><strong>Guest Name:</strong> {data.lastname.split('|')[0]}, {data.firstname.split('|')[0]}</p>
              <p><strong>Room Number:</strong> {roomData[0].name}</p>
            </div>
            <div>
              {/* <p><strong>Billing Number:</strong>{billingnumber}</p> */}
              {/* <p><strong>Payment Date:</strong> {paymentDate.toLocaleString()}</p> */}
            </div>
            
          </div>
          
          {/* Room Charges Table */}
          <table className="min-w-full border border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-200">Room</th>
                <th className="border border-gray-300 p-2 bg-gray-200">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">{roomData[0].name}</td>
                <td className="border border-gray-300 p-2">P{roomData[0].price}</td>
              </tr>
            </tbody>
          </table>


          {/* Total and Payment Details */}
          <div className="text-end mt-4">
            <p className="total text-lg">Total Amount Due: <span className="font-bold">P{data.amountdue}</span></p>
            <p>Amount Paid: P{data.amountreceived}</p>
            <p>Change: P{data.change}</p>
          </div>
          
        </div>
        
        <div className="thank-you">
          <p>Thank you for staying with us!</p>
        </div>

        </div>
        {/* Print Button */}
      <div className="flex justify-end items-end mt-4">
          <button 
            className="bg-blue-600 text-white p-2 px-4 rounded-full hover:bg-blue-700"
            onClick={handlePrint}
          >
            <FontAwesomeIcon icon={faPrint} className="mr-2"/>
             Print
          </button>
        </div>
        
      </div>
    </div>
  );
});

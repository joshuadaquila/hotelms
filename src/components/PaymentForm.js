import { faCheckCircle, faInfoCircle, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import '../../src/output.css';
import { BillingStatement } from "./BillingStatement";
import { Confirmation } from "./Confirmation";
import Loader from "./Loader";
import { postData } from "../api";
import { fetchData } from "../api";
import { Notice } from "./Notice";

export function PaymentForm({
  toggleThis,
  guestName,
  roomNumber,
  roomid,
  totalAmountDue,
  onSubmit
}) {
  const roomCharges = 1500;

  const getCurrentDateTimeInGMT8 = () => {
    const currentDateTime = new Date();
    const gmt8Offset = 8 * 60; // GMT+8 in minutes
    const localOffset = currentDateTime.getTimezoneOffset();
    const gmt8DateTime = new Date(currentDateTime.getTime() + (gmt8Offset + localOffset) * 60 * 1000);
    return gmt8DateTime;
  };

  const currentDateTime = getCurrentDateTimeInGMT8();
  const formatForDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const currentDateTimeFormatted = formatForDateTimeLocal(currentDateTime);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState([]);
  const [showNotPaidErr, setShowNotPaidErr] = useState(false);
  const [submitting, setSubmitting] = useState(false)

  const [amountPaid, setAmountPaid] = useState("");
  const [change, setChange] = useState("0.00");

  const [showBilling, setShowBilling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saveTransac, setSaveTransac] = useState(false);
  const [data, setData] = useState({});

  const [guestid, setGuestId] = useState(0)
  const [userid, setUserId] = useState(0)

  useEffect(() => {
    const getLatestId = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchData('getLatestId');
        const userId = localStorage.getItem('userid'); // Retrieve userid here
        if (error) {
          console.error("Error fetching ID:", error);
          setError(error);
        } else {
          console.log("Fetched guest ID:", data[0] || data);
          setGuestId((data[0]?.guestid ?? 0) + 1);
          setUserId(userId); // Set userid state directly
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
  
    getLatestId();
  }, []);
  

  useEffect(() => {
    if (amountPaid) {
      const totalDue = parseFloat(totalAmountDue) || 0;
      const paid = parseFloat(amountPaid) || 0;
      setChange((paid - totalDue).toFixed(2));
    } else {
      setChange("0.00");
    }
  }, [amountPaid, totalAmountDue]);

  useEffect(() => {
    setData({
      guestid,
      roomid,
      userid,
      guestName,
      roomNumber,
      roomCharges,
      totalAmountDue,
      amountPaid,
      change,
      paymentMethod: "cash",
      paymentDate: currentDateTimeFormatted,
    });
  }, [guestName, roomNumber, roomCharges, totalAmountDue, amountPaid, change, currentDateTimeFormatted]);

  const saveTransaction = (e) => {
    // console.log("Submitting transaction...");
    // console.log("data to save", data)
    localStorage.setItem("guestName", guestName);
    localStorage.setItem("roomNumber", roomNumber);
    localStorage.setItem("roomCharges", roomCharges);
    localStorage.setItem("totalAmountDue", totalAmountDue);
    localStorage.setItem("amountPaid", amountPaid);
    localStorage.setItem("change", change);
    postData('saveTransaction', data)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('Success:', data);
        }
      })
      .catch((error) => console.error('Error:', error));
  };

  if (loading) {
    return <Notice message={"Loading..."} />;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-4xl">
        <p className="text-center font-bold text-xl mb-6">Payment Form</p>
        {showConfirmation &&
          <Confirmation message={"Cancel payment?"} toggleThis={() => setShowConfirmation(false)}
            confirmed={(e) => { e.preventDefault(); toggleThis(); }}
          />
        }
        {saveTransac &&
          <Confirmation message={"Save transaction?"} disabled={submitting} toggleThis={() => setSaveTransac(false)}
            confirmed={(e) => { setSubmitting(true); saveTransaction(); onSubmit() }}
          />
        }
        {showNotPaidErr &&
          <Notice message={"Please enter the total amount paid."} color={"text-red-600"} 
          toggleThis={()=>setShowNotPaidErr(false)}/>
        }
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Guest Name</label>
            <input
              type="text"
              value={guestName}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700">Room Number</label>
            <input
              type="text"
              value={roomNumber}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700">Room Charges</label>
            <input
              type="number"
              value={roomCharges}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700">Total Amount Due</label>
            <div className="flex justify-center items-center">
              <p className="mr-2">P</p>
              <input
                type="number"
                value={totalAmountDue}
                readOnly
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Amount Paid</label>
            <div className="flex justify-center items-center">
              <p className="mr-2">P</p>
              <input
                type="number"
                value={amountPaid}
                required
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Change</label>
            <div className="flex justify-center items-center">
              <p className="mr-2">P</p>
              <input
                type="number"
                value={change}
                readOnly
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Payment Method</label>
            <select
              value={'Cash'}
              className="w-full p-2 border rounded"
              disabled
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            <p className="text-gray-600 m-1"><FontAwesomeIcon icon={faInfoCircle}/> Cash payments are currently the only option available</p>
          </div>
          <div>
            <label className="block text-gray-700">Payment Date</label>
            <input
              type="datetime-local"
              value={currentDateTimeFormatted}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 flex items-center"
            onClick={(e) => { e.preventDefault(); setShowConfirmation(true); }}
          >
            <FontAwesomeIcon icon={faXmarkCircle} />
            <span className="ml-2">Cancel</span>
          </button>
          <button
            className={`bg-green-600 ml-4 text-white p-3 rounded-full flex items-center ${
              submitting ? "bg-green-400 cursor-not-allowed" : "hover:bg-green-700"
            }`}
            onClick={(e) => { 
              e.preventDefault();
              if (amountPaid === ""){
                setShowNotPaidErr(true)
              }else{
                setShowBilling(true); 
                setSaveTransac(true);
              } 
            }}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            <span className="ml-2">Save Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
}

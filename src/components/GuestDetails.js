import { faArrowCircleRight, faClose, faPlusCircle, faPrint, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useState } from "react";
import '../../src/output.css';
import { useEffect } from "react";
import { fetchData } from "../api";
import ualogo from '../resources/ualogo.jpg'

export function GuestDetails({toggleThis, guestid}) {
  const [data, setData] = useState([]);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(true);

  // console.log("Guest ID", guestid)

  useEffect(() => {
    const loadGuestDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchData(`guestDetails?guestid=${guestid}`);
        if (error) {
          setError(error);
        } else {
          setData(data);
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    loadGuestDetails();
  }, [guestid]);

  if (loading) {
    return <p className="absolute">Loading...</p>;
  }

  if (!data || data.length === 0) {
    return <p className="absolute">No guest data found.</p>;
  }

  // Split data for multiple guests where applicable
  const splitField = (field) => (field ? field.split("| ") : []);

  const guestDetails = {
    firstnames: splitField(data[0].firstname),
    lastnames: splitField(data[0].lastname),
    middlenames: splitField(data[0].middlename),
    nationalities: splitField(data[0].nationality),
    homeaddresses: splitField(data[0].homeaddress),
    contactnums: splitField(data[0].contactnum),
    addresses: splitField(data[0].address),
    companies: splitField(data[0].company),
    companytels: splitField(data[0].companytel),
    emails: splitField(data[0].email),
    passportnums: splitField(data[0].passportnum),
    telephonnums: splitField(data[0].telephonenum),
    remarks: splitField(data[0].remarks),
  };
  // console.log(data)

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
  
    // Set up the HTML content to be printed
    printWindow.document.write(`
      <html>
        <head>
          <title>Guest Details</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            h1, h2, h3 {
              text-align: center;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
            }
            .guest-card {
              border: 1px solid #ddd;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 8px;
              background-color: #f9f9f9;
            }
            .guest-card h2 {
              margin-top: 0;
            }
            .guest-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .guest-info p {
              margin: 5px 0;
              padding: 10px;
              border: 1px solid #ccc; /* Added border to fields */
              border-radius: 4px;
              background-color: #f9f9f9;
            }
            .guest-info strong {
              width: 200px;
              display: inline-block;
            }
            .guest-info span {
              color: #555;
            }
            .stay-details p {
              margin: 5px 0;
              padding: 10px;
              border: 1px solid #ccc; /* Added border to fields */
              border-radius: 4px;
              background-color: #f9f9f9;
            }
            .stay-details strong {
              width: 200px;
              display: inline-block;
            }
            .stay-details span {
              color: #555;
            }
            .logo {
              text-align: center;
            }
            .logo img {
              width: 100px; /* Adjust the size as needed */
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="${ualogo}" alt="Logo" id="logoImage" />
            </div>
            <h1>University of Antique Hotel</h1>
            <h2>Guest Information</h2>
            <div class="guest-card">
              ${guestDetails.firstnames.map((_, index) => `
                <h2>Guest ${index + 1}</h2>
                <div class="guest-info">
                  <p><strong>Last Name:</strong><span>${guestDetails.lastnames[index] || ''}</span></p>
                  <p><strong>First Name:</strong><span>${guestDetails.firstnames[index] || ''}</span></p>
                  <p><strong>Middle Name:</strong><span>${guestDetails.middlenames[index] || ''}</span></p>
                  <p><strong>Home Address:</strong><span>${guestDetails.homeaddresses[index] || ''}</span></p>
                  <p><strong>Contact No.:</strong><span>${guestDetails.contactnums[index] || ''}</span></p>
                  <p><strong>Telephone No.:</strong><span>${guestDetails.telephonnums[index] || ''}</span></p>
                  <p><strong>Company/Organization:</strong><span>${guestDetails.companies[index] || ''}</span></p>
                  <p><strong>Company Telephone:</strong><span>${guestDetails.companytels[index] || ''}</span></p>
                  <p><strong>Company Address:</strong><span>${guestDetails.addresses[index] || ''}</span></p>
                  <p><strong>Nationality:</strong><span>${guestDetails.nationalities[index] || ''}</span></p>
                  <p><strong>Email:</strong><span>${guestDetails.emails[index] || ''}</span></p>
                  <p><strong>Passport No.:</strong><span>${guestDetails.passportnums[index] || ''}</span></p>
                  <p><strong>Remarks:</strong><span>${guestDetails.remarks[index] || ''}</span></p>
                </div>
              `).join('')}
            </div>
            
            <!-- Stay Details Section -->
            <div class="stay-details">
              <h3>Stay Details</h3>
              <p><strong>Check-in Date:</strong><span>${data[0].checkindate || ''}</span></p>
              <p><strong>Check-out Date:</strong><span>${data[0].checkoutdate || ''}</span></p>
              <p><strong>Room No.:</strong><span>${data[0].name || ''}</span></p>
            </div>
          </div>
        </body>
      </html>
    `);
  
    // Preload the logo image and print once it's loaded
    const logoImage = printWindow.document.getElementById("logoImage");

    const applyZoomAndPrint = () => {
        // Apply zoom-out effect
        printWindow.document.body.style.zoom = "0.8";
        printWindow.document.documentElement.style.zoom = "0.8";

        // Close the document to ensure rendering
        printWindow.document.close();

        // Wait a short time to ensure rendering, then show print dialog
        setTimeout(() => {
            printWindow.print();
        }, 300); // Adjust the delay as needed
    };

    // Check if the logo image is loaded
    logoImage.onload = applyZoomAndPrint;

    // In case the logo is cached and already loaded
    if (logoImage.complete) {
        applyZoomAndPrint();
    }

  };
  
  

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex 
    items-center justify-center overflow-y-scroll z-50">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-4xl"
      style={{maxHeight: '90%', overflowY:'scroll'}}
        >
          <FontAwesomeIcon icon={faClose} size="lg" className="absolute top-4 rounded-full right-4 cursor-pointer"
          onClick={toggleThis} />
          <p className="text-center font-bold text-lg">GUEST INFORMATION</p>

          <div className="p-4 rounded-md">
            {guestDetails.firstnames.map((_, index) => (
            <div key={index} className="border border-black rounded-md p-4 mb-4 shadow-sm">
              <p className="font-bold">GUEST {index + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700" htmlFor="lastName">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={guestDetails.lastnames[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700" htmlFor="firstName">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={guestDetails.firstnames[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700" htmlFor="middleName">
                    Middle Name *
                  </label>
                  <input
                    type="text"
                    id="middleName"
                    value={guestDetails.middlenames[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                    required
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
                    id="homeAddress"
                    value={guestDetails.homeaddresses[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700" htmlFor="contactNumber">
                    Contact No. *
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    value={guestDetails.contactnums[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                    required
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
                    id="telephoneNumber"
                    value={guestDetails.telephonnums[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700" htmlFor="companyOrganization">
                    Company/Organization (Optional)
                  </label>
                  <input
                    type="text"
                    id="companyOrganization"
                    value={guestDetails.companies[index] || ""}
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
                    id="companyTelephone"
                    value={guestDetails.companytels[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700" htmlFor="address">
                    Address (Company)
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={guestDetails.addresses[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>

              {/* Nationality */}
              <div className="mb-4">
                <label className="block text-gray-700" htmlFor="nationality">
                  Nationality *
                </label>
                <select
                  id="nationality"
                  value={guestDetails.nationalities[index] || ""}
                  className="mt-1 p-2 w-full border border-gray-300 rounded"
                  required
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
                    id="passportNumber"
                    value={guestDetails.passportnums[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700" htmlFor="email">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={guestDetails.emails[index] || ""}
                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700" htmlFor="remarks">
                  Remarks *
                </label>
                <textarea
                  id="remarks"
                  value={guestDetails.remarks[index] || ""}
                  className="mt-1 p-2 w-full border border-gray-300 rounded"
                  required
                ></textarea>
              </div>
            </div>
            ))}

            {/* Dates and Room No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700" htmlFor="checkInDate">
                  Check-in Date *
                </label>
                <input
                  type="datetime-local"
                  id="checkInDate"
                  readOnly
                  value={data[0].checkindate}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700" htmlFor="checkOutDate">
                  Check-out Date *
                </label>
                <input
                  type="datetime-local"
                  id="checkOutDate"
                  readOnly
                  value={data[0].checkoutdate}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100"
                  required
                />
              </div>
            </div>

            {/* Room No and Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700" htmlFor="roomNumber">
                  Room No. *
                </label>
                <input
                  type="text"
                  id="roomNumber"
                  readOnly
                  value={data[0].name}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100"
                  required
                />
              </div>
              
            </div>

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
    </div>
  );
}

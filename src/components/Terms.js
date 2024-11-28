
import { faArrowCircleRight, faCircle, faClose, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useState } from "react";
import '../../src/output.css';

export function Terms({toggleThis}){
  return(
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex 
    items-center justify-center z-50">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-4xl"
        >
          <FontAwesomeIcon icon={faClose} className="absolute top-4 right-4 cursor-pointer"
          onClick={toggleThis} />
          <p className="text-center font-bold mb-2">Terms and Conditions</p>

          <div>
            <p className="m-1"><FontAwesomeIcon icon={faCircle} size="xs" className="mr-2"/>Check-in time is from 2:00 pm and checkout time is 12:00 noon.</p>
            <p className="m-1"><FontAwesomeIcon icon={faCircle} size="xs" className="mr-2"/>The guest acknowledge joint and several liability for all services rendered until full settlement of bills.</p>
            <p className="m-1"><FontAwesomeIcon icon={faCircle} size="xs" className="mr-2"/>Guests will be held responsible for any loss or damage to the Hotel/Hostel caused by themselves, tehir friends or any person for whom they are responsible.</p>
            <p className="m-1"><FontAwesomeIcon icon={faCircle} size="xs" className="mr-2"/>Hotel Management is not responsible for personal belongings and valuables like money, jewellry or any other valuables left by guests in the rooms.</p>
            <p className="m-1"><FontAwesomeIcon icon={faCircle} size="xs" className="mr-2"/>Regardless of charge instructions, guest acknowledges that he is personally liable for the payment of all charges incurred by him during stay at UA Hotel/Hostel.</p>
            <p className="m-1"><FontAwesomeIcon icon={faCircle} size="xs" className="mr-2"/>Make all paychecks payable to University of Antique.</p>
          </div>
      </div>
    </div>
  )
}
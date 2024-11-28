import { faArrowCircleRight, faCircle, faClose, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useState } from "react";
import '../../src/output.css';

export function Confirmation({toggleThis, message, confirmed, disabled}){
  return(
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex 
    items-center justify-center z-50">
      <div className="relative bg-white p-8 rounded-lg shadow-lg"
        >
          <p className="font-bold">Confirmation</p>
          <div className="text-center">
            <p className="m-1 p-4">
            {message}
            </p>
            <div className="w-full flex justify-center items-center">
              <button className="p-2 rounded-full bg-red-600 text-white px-4 mr-4" onClick={toggleThis}>No</button>
              <button className="p-2 rounded-full bg-green-600 text-white px-4" disabled={disabled} onClick={confirmed}>Yes</button>
            </div>
          </div>
      </div>
    </div>
  )
}
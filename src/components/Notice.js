
import { faArrowCircleRight, faCircle, faClose, faInfoCircle, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useState } from "react";
import '../../src/output.css';

export function Notice({toggleThis, message, color}){
  return(
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex 
    items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-60 max-w-4xl"
        >

          <div className="text-center">
            <p className="m-1 p-3">
            <FontAwesomeIcon icon={faInfoCircle} className={`mr-2 ${color}`}/>
            {message}
            </p>
            <div className="w-full flex justify-center items-center">
              <button className="py-1 rounded-full bg-blue-600 text-white px-5" onClick={toggleThis}>OK</button>
            </div>
          </div>
      </div>
    </div>
  )
}
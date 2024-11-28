import React from "react";
import { Circles } from 'react-loader-spinner';
import '../../src/output.css';
import Sidebar from "./Sidebar";

const Loader = () => {
    return (
    <div className="flex w-screen h-screen">
      <Sidebar menu={''} />
      <div className="flex-1 p-10">
        
      </div>
    </div>
    );
};

export default Loader;

import React from "react";
import "../../css/welcome.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import image from "../../assets/w3.jpg";
import bg from "../../assets/bg.png"


export default function Welcome() {


const navigate=useNavigate();

 const  rotateFront=(event)=>{
    const svg=event.currentTarget.querySelector('svg');
    svg.style.transform='rotate(0deg) scale(1)';
    svg.style.transition='transform 0.5s ease-in';

 }
 const  rotateBack=(event)=>{
    const svg=event.currentTarget.querySelector('svg');
    svg.style.transform='rotate(360deg) scale(1.3)';
    svg.style.transition='transform 0.5s ease-out';

 }

 const goto=(event)=>{
    const role=event.currentTarget.textContent.trim().toLowerCase();
    if(role==="doctor"){
        navigate('/doctor/login');
    }else navigate('/patient/home');
  }

  return (
    <div className="welcome-container">
      
      <div className="w-left">
        <div className="w-image doc">
          <img className="bg" src={bg} alt="" />
          <img  src={image} alt="" />
        </div>
        <div className="w-text">
     <h1>Health Made Simple</h1>
<p>
  Connect with doctors, manage appointments, and store your consultation receipts 
  securely — making your healthcare journey smooth and stress-free.
</p>


        </div>
      </div>


      <div className="w-right">
        <div className="w-logo">
          
          <svg width="150" height="150" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_495_3740)">
<path d="M64.9511 16.4914H53.5086V5.04886C53.5086 2.26596 51.2426 0 48.4597 0H21.5364C18.7535 0 16.4875 2.26596 16.4875 5.04886V16.4914H5.04886C2.26596 16.4914 0 18.7535 0 21.5403V48.4636C0 51.2465 2.26596 53.5125 5.04886 53.5125H16.4914V64.955C16.4914 67.7379 18.7535 70.0039 21.5403 70.0039H48.4636C51.2465 70.0039 53.5125 67.7379 53.5125 64.955V53.5125H64.955C67.7379 53.5125 70.0039 51.2465 70.0039 48.4636V21.5403C70 18.7535 67.734 16.4914 64.9511 16.4914ZM64.613 48.1255H53.5086V27.2576H48.1255V64.613H21.8745V53.5086H42.7385V48.1255H5.38312V21.8745H16.4875V42.7385H21.8706V5.38312H48.1177V16.4875H27.2615V21.8706H64.6169V48.1255H64.613Z" fill="url(#paint0_linear_495_3740)"/>
</g>
<defs>
<linearGradient id="paint0_linear_495_3740" x1="-1.69238e-07" y1="3.58994" x2="76.3966" y2="18.4545" gradientUnits="userSpaceOnUse">
<stop stop-color="#0EBE7E"/>
<stop offset="1" stop-color="#07D9AD"/>
</linearGradient>
<clipPath id="clip0_495_3740">
<rect width="70" height="70" fill="white"/>
</clipPath>
</defs>
</svg>

          <div className="logo-text">
            <h1 className="montserrat-regular">
              HELLO <span>Dr.</span>
            </h1>
            <p className="montserrat-bold">Book.Consult.Heal</p>
          </div>
        </div>

        <div className="w-buttons">
          <button onMouseEnter={rotateBack} onClick={goto} onMouseLeave={rotateFront}>
            Doctor
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="black"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="arrow"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </button>

          <button onMouseEnter={rotateBack} onMouseLeave={rotateFront} onClick={goto}>
            Patient
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="black"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="white"
              className="arrow"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </button>

          
        </div>
      </div>
    </div>
  );
}

import React from 'react'
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

export default function patienthome() {

    const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get('alert');
    console.log(msg)
    if (msg) toast.success(msg);
  }, [location.search]); 

  return (
    <div>
       <Toaster position="top-right" toastOptions={{className:"my-toast"}}  reverseOrder={false} />
    </div>
  )
}

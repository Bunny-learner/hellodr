import React from 'react'
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function patienthome() {


  useEffect(()=>{
  
    const urlobj=new URL(window.location.href)
    const params = new URLSearchParams(urlobj.search);
    const msg=params.get('alert')
    if(msg) toast.success(msg);
    
  },[window.location.search])
  return (
    <div>
       <Toaster position="top-right"  reverseOrder={false} />
    </div>
  )
}

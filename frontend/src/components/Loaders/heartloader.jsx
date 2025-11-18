import { Cardio } from 'ldrs/react'
import 'ldrs/react/Cardio.css'

import React from 'react'

export default function HeartLoader() {
  return (
   <div className='loader'>
<Cardio
  size="270"
  stroke="12"
  speed="3"
  color="#349ce3" 
/></div>
  )
}


import React from 'react'
import { grid } from 'ldrs'
grid.register()

export default function bubbles() {
    return (
        <div className='loader'>
            <l-grid
                size="280"
                speed="1.5"
                color="#34c9e3"
            ></l-grid></div>
    )
}

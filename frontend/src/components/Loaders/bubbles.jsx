import React from 'react'
import { grid } from 'ldrs'
grid.register()

export default function bubbles() {
    return (
        <div className='loader'>
            <l-grid
                size="280"
                speed="1.5"
                 color="#2563eb"
            ></l-grid></div>
    )
}

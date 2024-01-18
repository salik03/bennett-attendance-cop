import React from 'react'
import Button from '@mui/material/Button';



const Attendance = () => {
  return (
    <div>
      <Button variant="contained">Generate Qr </Button>
        <div className="qr-container">
            <div className="qr-container-inside">            
            </div>
        </div>

    </div>
  )
}

export default Attendance

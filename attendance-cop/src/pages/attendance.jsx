import React, { useRef, useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import * as XLSX from 'xlsx';
import axios from 'axios';

const Attendance = () => {
  const pdfRef = useRef();
  const [imageSrc, setImageSrc] = useState('');
  const [rows, setRows] = useState([]);

  const generateQRCode = async () => {
    try {
      const response = await fetch('https://sixc1f0487-145f-4e33-8897-641d33f1d0e6.onrender.com/get_qr_code');
  
      if (!response.ok) {
        throw new Error('QR code API request failed');
      }
  
      const data = await response.json();
  
      if (!data.qr_code_base64) {
        throw new Error('QR code data not found in response');
      }
  
      setImageSrc(`data:image/png;base64,${data.qr_code_base64}`);
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };
  

  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/random_student');

      if (!response.data) {
        throw new Error('Data API request failed');
      }

      setRows((prevRows) => [...prevRows, { ...response.data, timestamp: new Date().toLocaleString() }]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const downloadExcel = () => {
    const header = ['Enrollment No', 'Name', 'Timestamp'];
    const data = rows.map((row) => [row.Enrollment, row.name, row.timestamp]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Sheet');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    fileSaver.saveAs(blob, 'attendance.xlsx');
  };

  useEffect(() => {
    generateQRCode();
    fetchData();

    const intervalId = setInterval(() => {
      fetchData(); // Fetch data every 3 seconds
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
  <>
     

     <Typography
              component="h1"
              variant="h3"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Attendance portal
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              Scan the QR to mark attendance
            </Typography>

            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
        <div className="upper">
        <div className="qr-code-display">
    <img
      alt="QR Code"
      src={imageSrc}
      style={{ width: '50vw', height: '70vh' }}
    />
  </div>
        </div>
        <div className="r">
          <Button variant="contained" onClick={generateQRCode}>
            Generate QR
          </Button>
        </div>

        <Button variant="contained" color="success" size="medium" onClick={downloadExcel}>
        Download Excel
      </Button>
      <div className="table">
        <div className="table2" ref={pdfRef}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 450 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Enrollment No</TableCell>
                  <TableCell align="right">Name</TableCell>
                  <TableCell align="right">TimeStamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.Enrollment}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.Enrollment}
                    </TableCell>
                    <TableCell align="right">{row.name}</TableCell>
                    <TableCell align="right">{row.group}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
        
    </div>
    </>
  );
};

export default Attendance;

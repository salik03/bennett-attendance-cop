import React, { useRef, useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import { Icon } from '@mui/material';


const Attendance = () => {
  const pdfRef = useRef();
  const [imageSrc, setImageSrc] = useState('');
  const [rows, setRows] = useState([]);

  const generateQRCode = async () => {
    try {
      const response = await fetch('https://api.example.com/image.png');
      if (!response.ok) {
        throw new Error('Image API request failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageSrc(url);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  const fetchData = async () => {
    
    try {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) {
        throw new Error('Data API request failed');
      }

      const data = await response.json();
      setRows(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const downloadPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('attendance.pdf');
  };

  useEffect(() => {
    generateQRCode();
    fetchData(); 

    const intervalId = setInterval(() => {
      fetchData(); // Fetch data every 3 seconds
    }, 3000);

    return () => clearInterval(intervalId); 
  }, []); 

  return (<>
     

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
          <img alt="QR Code" src={imageSrc} />
        </div>
      </div>
      <div className="r">
        <Button variant="contained" onClick={generateQRCode}>
          Generate QR
        </Button>
      </div>

      <div className="table">
        <div className="table2" ref={pdfRef}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 450 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Enrollment No</TableCell>
                  <TableCell align="right">Name</TableCell>
                  <TableCell align="right">Group</TableCell>
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
        <button className="pdfButton" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
    </div>
    </>
  );
};

export default Attendance;

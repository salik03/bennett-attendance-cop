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

function createData(Enrollment, name, group) {
  return { Enrollment, name, group };
}

const rows = [
  createData('Frozen yoghurt', 'random data', 'group'),
  createData('Frozen yoghurt', 'random data', 'group'),
  createData('Frozen yoghurt', 'random data', 'group'),
  createData('Frozen yoghurt', 'random data', 'group'),
  createData('Frozen yoghurt', 'random data', 'group'),
  createData('Frozen yoghurt', 'random data', 'group'),
];

const Attendance = () => {
  const pdfRef = useRef();
  const [imageSrc, setImageSrc] = useState('');

  const generateQRCode = async () => {
    // Fetching image from the API
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
  }, []); // Call the API on component mount

  return (
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
  );
};

export default Attendance;

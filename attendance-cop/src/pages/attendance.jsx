import React, { useRef, useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import * as XLSX from "xlsx";
import axios from "axios";
import ServerStatusIndicator from "../components/ServerCheck";
import supabase from "../supabaseConfig";

const Attendance = () => {
  const pdfRef = useRef();
  const [imageSrc, setImageSrc] = useState("");
  const [rows, setRows] = useState([]);
  const [attendanceInProgress, setAttendanceInProgress] = useState(false);
  const [token, setToken] = useState("");
  const [timer, setTimer] = useState(5);
  const [data, setData] = useState([""]);

  const generateQRCode = async () => {
    try {
      const response = await fetch(
        "https://sixc1f0487-145f-4e33-8897-641d33f1d0e6.onrender.com/get_qr_code"
      );

      if (!response.ok) {
        throw new Error("QR code API request failed");
      }

      const data = await response.json();

      if (!data.qr_code_base64 || !data.token) {
        throw new Error("QR code data not found in response");
      }

      setImageSrc(`data:image/png;base64,${data.qr_code_base64}`);
      setToken(data.token);

      return data.token;
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };

  const startAttendance = async () => {
    setAttendanceInProgress(true);
    const token = await generateQRCode();

    console.log(token);

    startTimer(token);
  };

  const stopAttendance = async (token) => {
    try {
      console.log("Attempting to stop attendance..."); // Add this log
      const response = await axios.get(
        `https://sixc1f0487-145f-4e33-8897-641d33f1d0e6.onrender.com/expire_link/${token}`
      );

      if (response.data.status === "expired") {
        console.log("Attendance stopped successfully."); // Add this log
        setAttendanceInProgress(false);
        setImageSrc("");
        setToken("");
        setTimer(0);
      } else {
        console.error("Unexpected response status:", response.data.status);
      }
    } catch (error) {
      console.error("Error stopping attendance:", error);
    }
  };

  const startTimer = (token) => {
    let countdown = 5;

    const intervalId = setInterval(() => {
      setTimer(countdown);
      countdown -= 1;

      if (countdown < 0) {
        clearInterval(intervalId);
        console.log("reached");
        stopAttendance(token);
      }
    }, 1000);
  };

  const fetchData = async () => {
    try {
      // Replace 'your_table_name' with the actual name of your Supabase table
      const { data, error } = await supabase
        .from("attendance")
        .select("id, email, display_name");

      if (error) {
        throw new Error("Data fetch from Supabase failed");
      }

      if (data) {
        setRows((prevRows) => [
          ...prevRows,
          {
            Enrollment: data.email, // Check the correct property name in your Supabase table
            name: data.display_name, // Check the correct property name in your Supabase table
            timestamp: new Date().toLocaleString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    }
  };

  useEffect(() => {
    const fetchDataAndAttendance = async () => {
      try {
        let { data: attendance, error } = await supabase
          .from("attendance")
          .select("*");

        if (attendance) {
          setData(attendance);
        }

        console.log(attendance);
      } catch (error) {
        console.log(error);
      }

      fetchData();
    };

    const intervalId = setInterval(fetchDataAndAttendance, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const downloadExcel = () => {
    const header = ["Enrollment No", "Name", "Timestamp"];
    const data = rows.map((row) => [row.Enrollment, row.name, row.timestamp]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    fileSaver.saveAs(blob, "attendance.xlsx");
  };

  useEffect(() => {
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
        {attendanceInProgress
          ? "Scan the QR to mark attendance"
          : "Attendance Stopped"}
      </Typography>

      <div
        style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}
      >
        <div className="upper">
          <div className="qr-code-display">
            {attendanceInProgress && (
              <img
                alt="QR Code"
                src={imageSrc}
                style={{ width: "50vw", height: "70vh" }}
              />
            )}
          </div>
        </div>
        {attendanceInProgress && (
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
          >
            Time remaining: {timer} seconds
          </Typography>
        )}

        <div className="r">
          <Button variant="contained" onClick={startAttendance}>
            Start Attendance
          </Button>

          <Button
            variant="contained"
            color="error"
            size="medium"
            onClick={stopAttendance}
          >
            Stop Attendance
          </Button>
        </div>

        {attendanceInProgress && (
          <Button
            variant="contained"
            color="success"
            size="medium"
            onClick={downloadExcel}
          >
            Download Excel
          </Button>
        )}

        <div className="table">
          <div className="table2" ref={pdfRef}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 450 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Id</TableCell>
                    <TableCell align="right">Email</TableCell>
                    <TableCell align="right">Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow
                      key={row.Enrollment}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.id}
                      </TableCell>
                      <TableCell align="right">{row.mail}</TableCell>
                      <TableCell align="right">{row.displayname}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
        <ServerStatusIndicator></ServerStatusIndicator>
      </div>
    </>
  );
};

export default Attendance;

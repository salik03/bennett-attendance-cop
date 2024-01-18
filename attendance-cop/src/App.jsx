
import TeacherPage from "./components/teacherPage"

import { Routes, Route } from "react-router-dom";
import Attendance from "./pages/attendance";



function App() {
 
  return (
    <>
    <Routes>
      <Route path="/" element={<TeacherPage/>}/>
      <Route path="/attendance" element={<Attendance/>}/>
    </Routes>
    </>
  )
}

export default App

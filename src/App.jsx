import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import TestApi from './components/TestApi'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test_api" element={<TestApi />} />
        <Route path="*" element={<Navigate to="/test_api" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

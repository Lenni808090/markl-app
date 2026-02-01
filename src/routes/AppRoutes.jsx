import { Routes, Route } from 'react-router-dom'

import HomePage from '../pages/HomePage'
import ReaderPage from '../pages/ReaderPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/reader/:chapterId" element={<ReaderPage />} />

      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-red-950 text-white">
          <h2 className="text-5xl font-bold">404 – Not Found</h2>
        </div>
      } />
    </Routes>
  )
}

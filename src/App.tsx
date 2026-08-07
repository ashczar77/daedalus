import { Navigate, Route, Routes } from 'react-router-dom'
import { CatalogPage } from './pages/CatalogPage'
import { ProblemPage } from './pages/ProblemPage'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/problems/:problemId" element={<ProblemPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

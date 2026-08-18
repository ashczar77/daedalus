import { Navigate, Route, Routes } from 'react-router-dom'
import { AcademyLessonPage } from './pages/AcademyLessonPage'
import { CatalogPage } from './pages/CatalogPage'
import { LanguageLessonPage } from './pages/LanguageLessonPage'
import { ProblemPage } from './pages/ProblemPage'
import { SystemDesignLabPage } from './pages/SystemDesignLabPage'
import './App.css'

/** Top-level routes for Daedalus (Algorithms, Terminal, System Design, Languages). */
export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/problems/:problemId" element={<ProblemPage />} />
        <Route path="/terminal" element={<CatalogPage />} />
        <Route path="/terminal/:lessonId" element={<AcademyLessonPage />} />
        <Route path="/system-design" element={<CatalogPage />} />
        <Route path="/system-design/:labId" element={<SystemDesignLabPage />} />
        <Route path="/languages" element={<CatalogPage />} />
        <Route path="/languages/:lessonId" element={<LanguageLessonPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

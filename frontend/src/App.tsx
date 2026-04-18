import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Homepage from './pages/Homepage'
import PlanPage from './pages/PlanPage'
import PlanDayDetail from './pages/PlanDayDetail'
import Identifier from './pages/Identifier'
import Community from './pages/Community'
import Profile from './pages/Profile'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { useApp } from './context/AppContext'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useApp()
  if (!isLoggedIn) return <Navigate to="/landing" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected routes */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<Homepage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/plan/day/:day" element={<PlanDayDetail />} />
        <Route path="/identifier" element={<Identifier />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Route>

      {/* Fallback: redirect to landing */}
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  )
}

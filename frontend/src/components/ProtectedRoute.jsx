import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const hasToken = !!localStorage.getItem('abastix_access')
  if (!user && !hasToken) return <Navigate to="/login" replace />
  return children
}

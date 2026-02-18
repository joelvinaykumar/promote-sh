import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className='h-screen w-screen flex items-center justify-center bg-background'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (!token) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return <>{children}</>
}

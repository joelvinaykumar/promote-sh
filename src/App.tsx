import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WorkEntry } from './types'
import { ProfileSidebar } from './components/ProfileSidebar'
import { AIChatSidebar } from './components/AIChatSidebar'
import { Navbar } from './components/Navbar'
import { SidebarInset, SidebarProvider } from './components/ui/sidebar'
import { UserProvider } from './contexts/UserContext'
import { ProtectedRoute } from './components/ProtectedRoute'

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))


function Dashboard() {

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
    >
      <SidebarInset className='flex flex-col min-w-0 h-screen overflow-hidden'>
        <Navbar />
        <div className='flex-1 overflow-hidden relative'>
          <DashboardPage />
        </div>
      </SidebarInset>
      <AIChatSidebar />
    </SidebarProvider>
  )
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Suspense fallback={
          <div className="h-screen w-full flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route 
              path='/' 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserProvider>
  )
}


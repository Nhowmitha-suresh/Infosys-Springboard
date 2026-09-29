import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({ title, children }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="ms-app-shell">
      <Sidebar role={user?.role} open={sidebarOpen} />
      <div className="ms-main">
        <Topbar title={title} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="p-3 p-md-4">{children}</main>
      </div>
    </div>
  )
}

import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[120px] -top-[100px] h-[500px] w-[500px] rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[100px] right-[-50px] h-[400px] w-[400px] rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)' }} />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

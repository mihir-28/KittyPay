import { Outlet } from 'react-router-dom'
import Navbar from '../ui/Navbar'
import Footer from '../ui/Footer'

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen max-w-screen">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
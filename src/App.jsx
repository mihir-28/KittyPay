import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Policy from './pages/Policy'
import Terms from './pages/Terms'
import MainLayout from './layouts/MainLayout'
import ScrollToTop from './components/common/ScrollToTop'
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="privacy-policy" element={<Policy />} />
          <Route path="terms-of-use" element={<Terms />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
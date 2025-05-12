import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
// import Policy from './pages/Policy'
// import Terms from './pages/Terms'
import MainLayout from './layouts/MainLayout'
import ScrollToTop from './components/common/ScrollToTop'
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* <Route path="privacy-policy" element={<Policy />} />
          <Route path="terms-of-use" element={<Terms />} /> */}
        </Route>
      </Routes>
    </>
  )
}

export default App
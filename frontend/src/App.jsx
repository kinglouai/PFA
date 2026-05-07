import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Wizard from './pages/Wizard.jsx'
import Result from './pages/Result.jsx'
import OAuthCallback from './pages/OAuthCallback.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wizard" element={<Wizard />} />
      <Route path="/result" element={<Result />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
    </Routes>
  )
}

export default App

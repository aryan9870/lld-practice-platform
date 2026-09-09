import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MyAttampts from './pages/MyAttampts'
import ProblemDetail from './pages/ProblemDetail'
import Problems from './pages/Problems'
import AttemptDetail from './pages/AttemptDetail'

function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/my-attempts" element={<MyAttampts />} />
        <Route path="/attempts/:id" element={<AttemptDetail />} />
      </Routes>
    </>
  )
}

export default App

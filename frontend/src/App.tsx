import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MyAttampts from './pages/MyAttampts'
import ProblemDetail from './pages/ProblemDetail'
import Problems from './pages/Problems'
import AttemptDetail from './pages/AttemptDetail'
import { LearnerProvider } from './context/LearnerProvider'
import { useLearner } from './context/learnerContext'
import AuthModal from './components/AuthModal'

function AppContent() {
  const { learner } = useLearner();

  return (
    <>
      {!learner && <AuthModal />}
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

function App() {
  return (
    <LearnerProvider>
      <AppContent />
    </LearnerProvider>
  )
}

export default App

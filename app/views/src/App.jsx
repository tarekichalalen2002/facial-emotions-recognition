import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import CNN from './pages/CNN'
import ViT from './pages/ViT'
import Comparaison from './pages/Comparaison'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import Footer from './components/Footer'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cnn" element={<CNN />} />
            <Route path="/vit" element={<ViT />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App

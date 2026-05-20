import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DustParticles from './components/DustParticles'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import NowShowingSection from './components/NowShowingSection'
import GenreSection from './components/GenreSection'
import Footer from './components/Footer'
import MovieDetailPage from './pages/MovieDetailPage'

function HomePage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <DustParticles />
      <Navbar />
      <main className="flex-grow pt-[80px] relative z-10">
        <HeroSection />
        <NowShowingSection />
        <GenreSection />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

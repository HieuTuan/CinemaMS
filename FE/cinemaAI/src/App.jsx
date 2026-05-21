import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DustParticles from './components/DustParticles'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import NowShowingSection from './components/NowShowingSection'
import AISpotlightSection from './components/AISpotlightSection'
import ComingSoonSection from './components/ComingSoonSection'
import GenreSection from './components/GenreSection'
import Footer from './components/Footer'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MoviesPage from './pages/MoviesPage'
import MovieDetailPage from './pages/MovieDetailPage'
import BookingPage from './pages/BookingPage'
import PaymentPage from './pages/PaymentPage'
import SuccessPage from './pages/SuccessPage'
import FailedPage from './pages/FailedPage'
import ProfilePage from './pages/ProfilePage'
import MyTicketsPage from './pages/MyTicketsPage'
import WishlistPage from './pages/WishlistPage'

function HomePage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <DustParticles />
      <Navbar />
      <main className="flex-grow pt-20 relative z-10">
        <HeroSection />
        <NowShowingSection />
        <AISpotlightSection />
        <ComingSoonSection />
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/payment/:id" element={<PaymentPage />} />
          <Route path="/success/:id" element={<SuccessPage />} />
          <Route path="/failed/:id"  element={<FailedPage />} />
          <Route path="/profile"     element={<ProfilePage />} />
          <Route path="/my-tickets"  element={<MyTicketsPage />} />
          <Route path="/wishlist"    element={<WishlistPage />} />
      </Routes>
    </BrowserRouter>
  )
}

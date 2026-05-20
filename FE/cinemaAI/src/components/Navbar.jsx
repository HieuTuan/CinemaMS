import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  return (
    <nav className="bg-surface/80 backdrop-blur-xl font-body-md text-body-md fixed top-0 w-full z-50 border-b border-white/10 shadow-2xl transition-all duration-500">
      <div className="flex justify-between items-center px-margin-desktop py-4 max-w-container-max mx-auto md:px-margin-mobile">
        {/* Logo */}
        <div
          className="font-display-lg text-headline-xl tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-shimmer cursor-pointer"
          style={{ backgroundSize: '200% auto' }}
        >
          CINEPREMIER
        </div>

        {/* Nav links */}
        <div className="hidden md:flex space-x-8">
          <a
            className="text-primary font-bold border-b-2 border-primary pb-1 transition-all duration-300"
            href="/movies"
          >
            Movies
          </a>
          <a
            className="text-on-surface/70 hover:text-primary nav-link-hover transition-colors duration-300"
            href="#"
          >
            Cinemas
          </a>
          <a
            className="text-on-surface/70 hover:text-primary nav-link-hover transition-colors duration-300"
            href="#"
          >
            Offers
          </a>
          <a
            className="text-on-surface/70 hover:text-primary nav-link-hover transition-colors duration-300"
            href="#"
          >
            VIP Experience
          </a>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-4">
          <button className="text-on-surface hover:text-primary transition-colors duration-300 hover:scale-110">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="text-on-surface hover:text-primary transition-colors duration-300 hover:scale-110 hidden md:block">
            <span className="material-symbols-outlined">location_on</span>
          </button>
          <button
            className="hidden md:block text-on-surface-variant hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
          <img
            alt="User profile avatar"
            className="w-10 h-10 rounded-full border border-white/20 hover:border-primary transition-colors duration-300 cursor-pointer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2AjlkwtF3aiXVqr3LldvPZ-aj0mn33-MU0mZhejwtrhYesrIk18WhuGTNa7uFMoae3mQZ5-haxDSE8FMjBbQNhIUt8wXwPo8u070PeDoC7tLR0OQbXSsIh4geMWMZF8uI3gjk9B2SESZbvcz9-g8gXRgQHy9JtjO59BdINLCoMX4bp0ll_QDPO3NmcX61eVGSXCyN1A3MQBICX1CO6UT74xQii8chsqsX0QdZwo9vBhLwQNeZtyUrcpLjoOoAfcq6ExdOAKwUy4LO"
          />
        </div>
      </div>
    </nav>
  )
}

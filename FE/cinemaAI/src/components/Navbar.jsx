import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">

        {/* Left: logo + nav */}
        <div className="flex items-center gap-12">
          <a
            className="font-display-lg text-headline-xl tracking-tighter bg-gradient-to-r from-primary-container to-secondary-container bg-clip-text text-transparent font-extrabold cursor-pointer"
            onClick={() => navigate('/')}
          >
            CINEPREMIER
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary-container pb-1 transition-all duration-300 cursor-pointer nav-link-hover">
              Movies
            </a>
            <a className="font-body-md text-body-md text-on-surface/70 hover:text-on-surface transition-colors cursor-pointer nav-link-hover">
              Cinemas
            </a>
            <a className="font-body-md text-body-md text-on-surface/70 hover:text-on-surface transition-colors cursor-pointer nav-link-hover">
              Offers
            </a>
            <a className="font-body-md text-body-md text-on-surface/70 hover:text-on-surface transition-colors cursor-pointer nav-link-hover">
              VIP Experience
            </a>
          </nav>
        </div>

        {/* Right: search + location + avatar */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              className="bg-surface-container-high border-none rounded-full px-6 py-2 w-56 lg:w-64 text-body-md text-on-surface placeholder-on-surface-variant/60 focus:ring-2 focus:ring-primary-container/50 transition-all outline-none"
              placeholder="Tìm kiếm phim..."
              type="text"
            />
            <span className="material-symbols-outlined absolute right-4 top-2 text-on-surface-variant pointer-events-none">
              search
            </span>
          </div>

          {/* Search icon on mobile */}
          <button className="md:hidden text-on-surface hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>

          {/* Location */}
          <button className="hidden md:flex items-center gap-2 hover:scale-105 transition-transform duration-300 text-on-surface hover:text-primary">
            <span className="material-symbols-outlined text-primary-container">location_on</span>
            <span className="text-body-md">Hồ Chí Minh</span>
          </button>

          {/* Sign In button */}
          <button
            onClick={() => navigate('/login')}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-primary-container/40 text-on-surface hover:bg-primary-container/10 hover:border-primary-container transition-all duration-300 font-label-sm text-label-sm uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Sign In
          </button>

          {/* Avatar → Profile */}
          <div
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container/30 hover:border-primary-container transition-colors cursor-pointer flex-shrink-0 hover:scale-105 duration-300"
            onClick={() => navigate('/profile')}
            title="Hồ sơ của tôi"
          >
            <img
              alt="User profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2AjlkwtF3aiXVqr3LldvPZ-aj0mn33-MU0mZhejwtrhYesrIk18WhuGTNa7uFMoae3mQZ5-haxDSE8FMjBbQNhIUt8wXwPo8u070PeDoC7tLR0OQbXSsIh4geMWMZF8uI3gjk9B2SESZbvcz9-g8gXRgQHy9JtjO59BdINLCoMX4bp0ll_QDPO3NmcX61eVGSXCyN1A3MQBICX1CO6UT74xQii8chsqsX0QdZwo9vBhLwQNeZtyUrcpLjoOoAfcq6ExdOAKwUy4LO"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

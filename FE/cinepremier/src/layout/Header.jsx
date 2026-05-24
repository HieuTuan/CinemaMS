import React, { useState } from 'react';
import { Search, MapPin, Ticket, User, Heart, Compass, Home, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cinemaLocations } from '../services/cinemaData';

export default function Header({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedCity,
  onOpenWatchlist,
  onOpenOTP,
  isLoggedIn,
  currentUser,
  currentRole = 'user',
  onRoleChange = () => {}
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-10">
        
        {/* Logo CINEPREMIER */}
        <motion.div 
          onClick={() => onTabChange('home')}
          className="flex cursor-pointer items-center space-x-3.5 group select-none mr-4"
          id="header-logo"
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
        >
          {/* Animated luxury brand monogram C with gold accenting and shimmering reflex */}
          <motion.div 
            className="relative h-10 w-10 flex items-center justify-center bg-zinc-950 border border-white/15 overflow-hidden shadow-[inset_0_0_12px_rgba(255,255,255,0.05)] group-hover:border-amber-400/40 transition-all duration-300"
            animate={{ 
              boxShadow: ["inset 0 0 10px rgba(255,255,255,0.02)", "inset 0 0 10px rgba(245,158,11,0.08)", "inset 0 0 10px rgba(255,255,255,0.02)"]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            {/* Golden Corner Brackets with expanding motion on parent Group Hover */}
            <span className="absolute top-1 left-1 h-1.5 w-1.5 border-t border-l border-white/30 group-hover:border-amber-400 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"></span>
            <span className="absolute top-1 right-1 h-1.5 w-1.5 border-t border-r border-white/30 group-hover:border-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"></span>
            <span className="absolute bottom-1 left-1 h-1.5 w-1.5 border-b border-l border-white/30 group-hover:border-amber-400 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300"></span>
            <span className="absolute bottom-1 right-1 h-1.5 w-1.5 border-b border-r border-white/30 group-hover:border-amber-400 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300"></span>
            
            {/* Golden radial background flow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Dynamic sweep mask highlight across logo C */}
            <div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-sweep pointer-events-none" />

            {/* Main Letter C with gorgeous drop shadow glow and rich Gold Gradient Style */}
            <span className="relative font-serif text-lg italic font-extrabold tracking-normal text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-400 group-hover:from-white group-hover:via-amber-200 group-hover:to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.45)] transition-all duration-300 select-none">
              C
            </span>
          </motion.div>

          <div className="flex flex-col justify-center">
            <span className="font-sans font-black tracking-[0.22em] text-xs sm:text-sm text-white uppercase leading-none group-hover:text-amber-400 transition-colors duration-300">
              CINE<span className="text-amber-400">PREMIER</span>
            </span>
            <span className="text-[7.5px] font-mono tracking-[0.45em] text-neutral-500 uppercase mt-1 leading-none group-hover:text-neutral-400 transition-colors">
              STUDIOS
            </span>
          </div>
        </motion.div>

        {/* Categories Tab list matching screenshot 2 & 3 navigation style */}
        <nav className="hidden lg:flex items-center space-x-0.5" id="main-nav-bar">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3.5 py-1.5 text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'home'
                ? 'text-white border-white font-bold'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
            id="nav-home"
          >
            <Home className="h-3.5 w-3.5" />
            <span>TRANG CHỦ</span>
          </button>
          
          <button
            onClick={() => onTabChange('explore')}
            className={`px-3.5 py-1.5 text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'explore'
                ? 'text-white border-white font-bold'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
            id="nav-explore"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>KHÁM PHÁ</span>
          </button>

          <button
            onClick={() => onTabChange('my-tickets')}
            className={`px-3.5 py-1.5 text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'my-tickets'
                ? 'text-white border-white font-bold'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
            id="nav-my-bookings"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>VỀ CỦA TÔI</span>
          </button>
          
          <button
            onClick={() => onTabChange('wishlist')}
            className={`px-3.5 py-1.5 text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'wishlist'
                ? 'text-white border-white font-bold'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
            id="nav-wishlist"
          >
            <Heart className="h-3.5 w-3.5" />
            <span>WATCHLIST</span>
          </button>

          {isLoggedIn && (
            <button
              onClick={() => onTabChange('profile')}
              className={`px-3.5 py-1.5 text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
                activeTab === 'profile'
                  ? 'text-white border-white font-bold'
                  : 'text-neutral-400 hover:text-white border-transparent'
              }`}
              id="nav-profile-tab"
            >
              <User className="h-3.5 w-3.5" />
              <span>CÁ NHÂN</span>
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => onTabChange('admin')}
              className={`px-3.5 py-1.5 text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
                activeTab === 'admin'
                  ? 'text-amber-500 border-amber-500 font-extrabold'
                  : 'text-neutral-400 hover:text-amber-500 border-transparent'
              }`}
              id="nav-admin-tab"
            >
              <ShieldAlert className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>QUẢN TRỊ VIÊN</span>
            </button>
          )}
        </nav>

        {/* Right Header Section */}
        <div className="flex items-center space-x-2.5">
          
          {/* Search Box */}
          <div className="relative hidden xl:block w-40 xl:w-48 h-9 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600 pointer-events-none" />
            <input
              type="text"
              placeholder="TÌM PHIM..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onClick={() => {
                if (activeTab !== 'explore') onTabChange('explore');
              }}
              className="w-full h-full border border-white/10 bg-neutral-950/80 pl-9 pr-4 text-[9.5px] text-white tracking-widest placeholder-neutral-700 uppercase focus:border-white/30 focus:bg-neutral-900/60 focus:outline-none transition-all duration-300"
              id="search-input"
            />
          </div>

          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-9 items-center justify-center space-x-1.5 border border-white/10 bg-black/40 px-3.5 text-[10px] font-sans uppercase tracking-[0.15em] text-neutral-400 hover:text-white hover:border-white/30 hover:bg-neutral-900/25 transition-all duration-300 whitespace-nowrap"
              id="location-button"
            >
              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
              <span className="max-w-[85px] truncate">
                {selectedCity.split('(')[0].trim()}
              </span>
            </button>
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 border border-white/15 bg-black p-1 shadow-2xl z-50 text-left animate-slide-in"
                id="location-dropdown"
              >
                {cinemaLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      onSearchChange(''); // Reset search
                      onTabChange('home'); // Reset to home
                      alert(`Đã đổi rạp chiếu hoạt động sang: ${loc}`);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-[10px] tracking-wider uppercase font-sans text-neutral-400 hover:bg-neutral-900 hover:text-white transition"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Signin Profile Indicator */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                onTabChange('profile');
              } else {
                onOpenOTP();
              }
            }}
            className={`flex h-9 items-center justify-center space-x-1.5 border px-3.5 text-[10px] font-sans uppercase tracking-[0.15em] font-bold shadow-md transition-all duration-300 whitespace-nowrap ${
              isLoggedIn 
                ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.05)]' 
                : 'border-white bg-white text-black hover:bg-black hover:text-white'
            }`}
            id="signin-button"
          >
            <User className="h-3.5 w-3.5" />
            <span>
              {isLoggedIn ? (currentUser?.name || 'MINH HỒNG (VIP)') : 'ĐĂNG NHẬP VIP'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}

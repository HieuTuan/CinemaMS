import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import HomeView from './pages/HomePage';
import ExploreView from './pages/ExplorePage';
import DetailView from './pages/MovieDetailPage';
import BookingView from './pages/BookingPage';
import ProfileView from './pages/ProfilePage';
import MyTicketsView from './pages/MyTicketsPage';
import WishlistView from './pages/WishlistPage';
import AdminDashboard from './pages/AdminPage';
import AuthModal from './features/auth/AuthModal';
import { movies, cinemaLocations } from './services/cinemaData';
import { X, Ticket } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [moviesList, setMoviesList] = useState(movies);
  const [currentRole, setCurrentRole] = useState('user'); // 'user' | 'admin'
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [bookingMovie, setBookingMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(cinemaLocations[0]);
  
  // Modals state
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [ticketOTP, setTicketOTP] = useState('');

  // Watchlist & Booked Tickets state
  const [watchlist, setWatchlist] = useState([]);
  const [bookedTickets, setBookedTickets] = useState([]);

  // Load sample initial watchlist if empty
  useEffect(() => {
    if (moviesList && moviesList.length >= 3) {
      setWatchlist([
        moviesList[0], // Neon Horizon
        moviesList[2]  // The Last Shadow
      ]);
    }
  }, [moviesList]);

  // Handle Select Movie Detail
  const handleSelectMovie = (id) => {
    setSelectedMovieId(id);
    setBookingMovie(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Book Movie
  const handleBookMovie = (movie) => {
    setBookingMovie(movie);
    setSelectedMovieId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Confirm Ticket Booking
  const handleConfirmBooking = (booking) => {
    const randomTicketId = 'CP-' + Math.floor(100000 + Math.random() * 900000);
    const newTicket = {
      ...booking,
      ticketId: randomTicketId,
      bookingTime: new Date().toLocaleString()
    };
    
    setBookedTickets([newTicket, ...bookedTickets]);
    setBookingMovie(null);
    setSelectedMovieId(null);
    setShowWatchlist(true); // Open tickets panel to show success!
    alert(`Xác thực giao dịch thành công!\nMã vé của bạn là: ${randomTicketId}\nHệ thống đã lưu vé của bạn vào mục "Vé & Watchlist".`);
  };

  const handleToggleWatchlist = (movie) => {
    const exists = watchlist.find(m => m.id === movie.id);
    if (exists) {
      setWatchlist(prev => prev.filter(m => m.id !== movie.id));
    } else {
      setWatchlist(prev => [...prev, movie]);
    }
  };

  const selectedMovie = moviesList.find(m => m.id === selectedMovieId);

  // OTP login
  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setOtpSent(true);
    alert("Hệ thống đã gửi mã OTP (123456) giả lập đến số điện thoại của bạn.");
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otpCode === '123456' || otpCode === '000000') {
      setIsLoggedIn(true);
      setShowOTP(false);
      setOtpSent(false);
      alert("Đăng nhập tài khoản Cinephile VIP thành công!");
    } else {
      alert("Mã OTP không đúng. Vui lòng nhập mã: 123456 để thử nghiệm.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      
      {/* VERTICAL LEFT RAIL (Artistic Flair requirement) */}
      <div className="hidden md:flex flex-col items-center justify-between py-12 border-r border-white/10 bg-black text-neutral-500 w-[60px] h-screen fixed left-0 top-0 z-40">
        <div className="text-[9px] uppercase tracking-[0.3em] font-sans font-bold whitespace-nowrap rotate-270 -my-8 text-neutral-400 select-none">
          EST. 2026
        </div>
        
        {/* Navigation Dot indicators */}
        <div className="flex flex-col items-center space-y-4">
          <div 
            onClick={() => { setActiveTab('home'); setSelectedMovieId(null); setBookingMovie(null); }}
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${activeTab === 'home' && !selectedMovieId && !bookingMovie ? 'bg-white scale-150' : 'bg-neutral-800'}`}
            title="Trang Chủ"
          />
          <div 
            onClick={() => { setActiveTab('explore'); setSelectedMovieId(null); setBookingMovie(null); }}
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${activeTab === 'explore' || selectedMovieId || bookingMovie ? 'bg-white scale-150' : 'bg-neutral-800'}`}
            title="Khám phá"
          />
          <div 
            onClick={() => { setActiveTab('my-tickets'); setSelectedMovieId(null); setBookingMovie(null); }}
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${activeTab === 'my-tickets' ? 'bg-white scale-150' : 'bg-neutral-800'}`}
            title="Vé của tôi"
          />
          <div 
            onClick={() => { setActiveTab('wishlist'); setSelectedMovieId(null); setBookingMovie(null); }}
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${activeTab === 'wishlist' ? 'bg-white scale-150' : 'bg-neutral-800'}`}
            title="Watchlist"
          />
        </div>

        <div className="text-[10px] uppercase tracking-[0.25em] font-serif italic text-white text-center select-none font-light">
          C P
        </div>
      </div>

      {/* Main Container Wrapper with Left Rail Padding */}
      <div className="md:pl-[60px] min-h-screen flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <Header 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSelectedMovieId(null);
              setBookingMovie(null);
            }} 
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              if (activeTab !== 'explore') {
                setActiveTab('explore');
              }
            }}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            onOpenWatchlist={() => setShowWatchlist(true)}
            onOpenOTP={() => setShowOTP(true)}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
          />

          {/* VIEW ROUTER WITH TRANSITION ANIMATIONS */}
          <main className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={bookingMovie ? `booking-${bookingMovie.id}` : selectedMovieId ? `detail-${selectedMovieId}` : activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {bookingMovie ? (
                  // Step Booking View
                  <BookingView 
                    movie={bookingMovie} 
                    onBack={() => setBookingMovie(null)} 
                    onConfirmBooking={handleConfirmBooking}
                  />
                ) : selectedMovie ? (
                  // Step Detail View
                  <DetailView 
                    movie={selectedMovie} 
                    onBack={() => setSelectedMovieId(null)} 
                    onBook={handleBookMovie}
                  />
                ) : activeTab === 'home' ? (
                  // Step Home View
                  <HomeView 
                    onSelectMovie={handleSelectMovie} 
                    onBookMovie={handleBookMovie} 
                    onTabChange={setActiveTab}
                    moviesList={moviesList}
                  />
                ) : activeTab === 'explore' ? (
                  // Step Explore Search list View
                  <ExploreView 
                    searchQuery={searchQuery} 
                    onSearchChange={setSearchQuery} 
                    onSelectMovie={handleSelectMovie} 
                    onBookMovie={handleBookMovie}
                    moviesList={moviesList}
                  />
                ) : activeTab === 'profile' ? (
                  // Custom Profile Page - Minh Hong VIP Gold
                  <ProfileView 
                    onSelectMovie={handleSelectMovie}
                    onTabChange={setActiveTab}
                    bookedTickets={bookedTickets}
                    isLoggedIn={isLoggedIn}
                    currentUser={currentUser}
                    onLogout={() => {
                      setIsLoggedIn(false);
                      setCurrentUser(null);
                      setCurrentRole('user');
                      setActiveTab('home');
                      alert("Đăng xuất tài khoản VIP.");
                    }}
                    onOpenOTP={() => setShowOTP(true)}
                  />
                ) : activeTab === 'my-tickets' ? (
                  // Custom Tickets listing and history page
                  <MyTicketsView 
                    bookedTickets={bookedTickets}
                    onSelectMovie={handleSelectMovie}
                    isLoggedIn={isLoggedIn}
                    onOpenOTP={() => setShowOTP(true)}
                  />
                ) : activeTab === 'wishlist' ? (
                  // Custom watchlist and newsletter page
                  <WishlistView 
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                    onBookMovie={handleBookMovie}
                    onSelectMovie={handleSelectMovie}
                  />
                ) : activeTab === 'admin' ? (
                  // Comprehensive cinema administration control panel
                  <AdminDashboard
                    moviesList={moviesList}
                    setMoviesList={setMoviesList}
                    bookedTickets={bookedTickets}
                    setBookedTickets={setBookedTickets}
                    cinemaLocations={cinemaLocations}
                    onSelectMovie={handleSelectMovie}
                  />
                ) : (
                  // Fallback
                  <HomeView 
                    onSelectMovie={handleSelectMovie} 
                    onBookMovie={handleBookMovie} 
                    onTabChange={setActiveTab}
                    moviesList={moviesList}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Footer */}
        <Footer />

      </div>

      {/* WATCHLIST & BOOKED TICKETS DRAWER MODAL (Sleek minimalist panel) */}
      {showWatchlist && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md h-full bg-black border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto animate-slide-in relative"
            id="watchlist-drawer"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Ticket className="h-4.5 w-4.5 text-white" />
                  <h3 className="text-base font-serif italic text-white uppercase tracking-wider">CinePremier / Tickets</h3>
                </div>
                <button 
                  onClick={() => setShowWatchlist(false)}
                  className="p-1 border border-white/10 hover:border-white text-white shadow"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* SECTION: BOOKED SESSIONS */}
              <div className="space-y-4 mb-8">
                <span className="text-[9px] font-sans tracking-[0.2em] font-bold text-neutral-400 block uppercase border-b border-white/5 pb-1">VÉ CỦA TÔI ({bookedTickets.length})</span>
                
                {bookedTickets.length > 0 ? (
                  <div className="space-y-4">
                    {bookedTickets.map((tc) => (
                      <div key={tc.ticketId} className="border border-white/20 bg-neutral-950 p-4 space-y-3 font-sans relative">
                        <div className="absolute top-3 right-3 border border-white/20 px-2 py-0.5 text-[8px] font-mono uppercase bg-black text-white font-bold">
                          Verified
                        </div>
                        
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-serif italic text-white font-bold">{tc.movie.title}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-bold">{tc.movie.englishTitle}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-300">
                          <div>
                            <span className="block text-neutral-400 font-bold text-[8.5px] tracking-wide">RẠP CHIẾU:</span>
                            <span className="font-bold text-white uppercase">{tc.hall.split('(')[0]}</span>
                          </div>
                          <div>
                            <span className="block text-neutral-400 font-bold text-[8.5px] tracking-wide">SUẤT DIỄN:</span>
                            <span className="font-bold text-white font-mono">{tc.showtime} - {tc.date.split(',')[0]}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-neutral-400 font-bold text-[8.5px] tracking-wide">GHẾ ĐỊNH VỊ:</span>
                            <span className="text-white font-mono font-black">{tc.selectedSeats.map(s => s.id).join(', ')}</span>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-white/10 pt-3 flex items-center justify-between">
                          <div>
                            <span className="block text-neutral-400 font-bold text-[8.5px] tracking-wide">THANH TOÁN:</span>
                            <span className="text-xs font-mono font-bold text-white">{tc.totalAmount.toLocaleString()}đ</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-neutral-400 font-bold text-[8.5px] tracking-wide">MÃ VÉ TỬ:</span>
                            <span className="text-[11px] font-mono font-black border border-white bg-black px-1.5 py-0.5 text-white">{tc.ticketId}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-white/5 bg-[#0a0a0a] uppercase text-[9px] tracking-wider text-neutral-600 space-y-2">
                    <p>Chưa có dữ kiện vé đặt trực tuyến gần đây</p>
                    <p className="text-neutral-500 font-sans font-light">Hãy chọn ghế và trải nghiệm hệ thống AI đặt vé tức thì.</p>
                  </div>
                )}
              </div>

              {/* SECTION: WATCHLIST */}
              <div className="space-y-4">
                <span className="text-[10px] font-sans tracking-[0.2em] font-extrabold text-neutral-300 block uppercase border-b border-white/10 pb-1">BẢN LƯU WATCHLIST ({watchlist.length})</span>
                
                {watchlist.length > 0 ? (
                  <div className="space-y-3">
                    {watchlist.map((mv) => (
                      <div key={mv.id} className="flex gap-3 bg-[#0a0a0a] border border-white/10 p-2 items-center justify-between">
                        <div className="flex gap-3 items-center min-w-0">
                          <img 
                            src={mv.posterUrl} 
                            alt={mv.title} 
                            className="w-10 h-14 object-cover border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-serif italic text-white font-bold truncate">{mv.title}</h4>
                            <p className="text-[9.5px] text-neutral-300 font-bold uppercase tracking-widest truncate">{mv.englishTitle}</p>
                            <span className="text-[9.5px] text-white/70 font-semibold border border-white/20 px-1 py-0.5 mt-1 inline-block">{mv.duration} MIN</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          {!mv.isUpcoming ? (
                            <button
                              onClick={() => {
                                handleBookMovie(mv);
                                setShowWatchlist(false);
                              }}
                              className="bg-white hover:bg-neutral-200 text-black px-3 py-1.5 text-[9.5px] uppercase tracking-wider font-sans font-extrabold transition"
                            >
                              Đặt vé
                            </button>
                          ) : (
                            <span className="border border-white/10 text-neutral-300 py-1 px-2.5 font-bold text-[8.5px] uppercase tracking-wider">Upcoming</span>
                          )}
                          <button
                            onClick={() => handleToggleWatchlist(mv)}
                            className="text-[10px] text-neutral-400 hover:text-white uppercase font-sans font-extrabold tracking-wider transition decoration-solid underline decoration-neutral-500 hover:decoration-white underline-offset-2"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-white/5 bg-[#0a0a0a] uppercase text-[9px] tracking-wider text-neutral-400 font-bold">
                    Danh mục lưu trữ điện ảnh trống
                  </div>
                )}
              </div>

            </div>

            <div className="border-t border-white/10 pt-4 mt-8 space-y-3 font-sans">
              <p className="text-[11px] text-neutral-300 leading-relaxed font-semibold">
                Quý khách có thể xuất trình <b>mã vé kĩ thuật số</b> tại phòng kịch rạp để in trực tiếp và hưởng các đặc quyền CinePremier VIP Club.
              </p>
              <button 
                onClick={() => setShowWatchlist(false)}
                className="w-full text-center border-2 border-white bg-black hover:bg-white hover:text-black text-white text-[11px] font-bold uppercase tracking-[0.2em] py-3.5 transition duration-300 cursor-pointer"
              >
                QUAY KHÔNG GIAN CHÍNH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODERN MULTI-EFFECT PREMIUM AUTHENTICATION MODAL */}
      <AuthModal 
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        onLoginSuccess={(userData) => {
          setIsLoggedIn(true);
          if (userData) {
            setCurrentUser(userData);
            setCurrentRole(userData.role || 'user');
            if (userData.role === 'admin') {
              setActiveTab('admin');
            } else {
              setActiveTab('home');
            }
          }
        }}
      />

    </div>
  );
}

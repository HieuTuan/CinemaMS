import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Edit3, ShieldAlert, FileText, Database,
  Calendar, Users, DollarSign, Activity, AlertCircle, CheckCircle2,
  Search, Sliders, ChevronDown, Check, RefreshCw, Layers, ShoppingBag,
  BarChart2, Clock, MapPin, Film, Play, Eye, EyeOff, Sparkles, TrendingUp, Info, Globe, Tags
} from 'lucide-react';

export default function AdminShowtimesPanel({ ctx }) {
  const {
    activeTab,
    setActiveTab,
    selectedAnalysisMovieId,
    setSelectedAnalysisMovieId,
    isReanalyzing,
    setIsReanalyzing,
    analysisScrambleOffset,
    setAnalysisScrambleOffset,
    activeChartPoint,
    setActiveChartPoint,
    searchQuery,
    setSearchQuery,
    filmFilter,
    setFilmFilter,
    adminMoviePagination,
    setAdminMoviePagination,
    editingMovie,
    setEditingMovie,
    showMovieForm,
    setShowMovieForm,
    formData,
    setFormData,
    newShowtime,
    setNewShowtime,
    isAddingShowtime,
    setIsAddingShowtime,
    showtimeSuccessMessage,
    setShowtimeSuccessMessage,
    genres,
    setGenres,
    genreSearch,
    setGenreSearch,
    genreForm,
    setGenreForm,
    genreErrors,
    setGenreErrors,
    editingGenreId,
    setEditingGenreId,
    isGenreLoading,
    setIsGenreLoading,
    isGenreSaving,
    setIsGenreSaving,
    homepageForm,
    setHomepageForm,
    homepageVideoError,
    setHomepageVideoError,
    foodItems,
    setFoodItems,
    foodCombos,
    setFoodCombos,
    foodSearch,
    setFoodSearch,
    foodKind,
    setFoodKind,
    editingFood,
    setEditingFood,
    foodForm,
    setFoodForm,
    foodErrors,
    setFoodErrors,
    isFoodLoading,
    setIsFoodLoading,
    isFoodSaving,
    setIsFoodSaving,
    visibleFoods,
    HALL_OPTIONS,
    TIME_OPTIONS,
    playPulseSound,
    auditLogs,
    setAuditLogs,
    addAuditLog,
    getYoutubeId,
    handleHomepageVideoSubmit,
    resetFoodForm,
    validateFoodForm,
    fetchFoods,
    handleFoodSubmit,
    handleEditFood,
    handleToggleFoodStatus,
    getAdminToken,
    changeAdminSection,
    validateGenreForm,
    fetchGenres,
    resetGenreForm,
    handleGenreSubmit,
    handleEditGenre,
    performDeleteGenre,
    handleDeleteGenre,
    totalBookingsCount,
    calculatedRevenue,
    averageFillRate,
    handleCreateMovieSubmit,
    handleDeleteMovie,
    handleAddShowtimeSubmit,
    handleRefundTicket,
    filteredMovies,
    filteredGenres,
    moviesList,
    setMoviesList,
    bookedTickets,
    setBookedTickets,
    cinemaLocations,
    onSelectMovie,
    showToast,
    initialSection,
    onSectionChange,
    homepageVideoUrl,
    onHomepageVideoUrlChange,
    onFoodCatalogChanged,
    isAdmin
  } = ctx;

  return (
    <>
              {/* TAB 3: SHOWTIMES */}
              {activeTab === 'showtimes' && (
                <motion.div
                  key="panel-showtimes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left controls: Allocate schedule form */}
                    <div className="lg:col-span-2 border border-neutral-850 p-6 bg-gradient-to-b from-[#0a0a0a] to-[#030303] space-y-4">
                      <div className="border-b border-neutral-900 pb-2">
                        <h3 className="text-xs font-sans font-black uppercase text-zinc-300 tracking-wider">ĐIỀU PHỐI SUẤT CHIẾU MỚI</h3>
                        <p className="text-[10px] text-zinc-500">Thiết lập thời gian và rạp trực tuyến</p>
                      </div>

                      {showtimeSuccessMessage && (
                        <div className="p-3 bg-emerald-950/35 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-sans animate-pulse">
                          ✓ {showtimeSuccessMessage}
                        </div>
                      )}

                      <form onSubmit={handleAddShowtimeSubmit} className="space-y-4 text-xs font-sans">

                        <div className="space-y-1.5 focus-within:text-[#EAB308]">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">1. Lựa chọn phim phát hành</label>
                          <select
                            value={newShowtime.movieId}
                            onChange={(e) => setNewShowtime({ ...newShowtime, movieId: e.target.value })}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            {moviesList.filter(m => m.status === 'NOW_SHOWING').map(m => (
                              <option key={m.id} value={m.id}>{m.title}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 focus-within:text-[#EAB308]">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">2. Chi nhánh rạp & Đô thị</label>
                          <select
                            value={newShowtime.city}
                            onChange={(e) => setNewShowtime({ ...newShowtime, city: e.target.value })}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            {cinemaLocations.map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 focus-within:text-[#EAB308]">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">3. Lựa chọn khán phòng chiếu</label>
                          <select
                            value={newShowtime.hall}
                            onChange={(e) => setNewShowtime({ ...newShowtime, hall: e.target.value })}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            {HALL_OPTIONS.map(hall => (
                              <option key={hall} value={hall}>{hall}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-wider text-neutral-500 block">4. Ngày công chiếu</label>
                            <select
                              value={newShowtime.date}
                              onChange={(e) => setNewShowtime({ ...newShowtime, date: e.target.value })}
                              className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                            >
                              <option value="Thứ Bảy, 23/05/2026">Thứ Bảy, 23/05</option>
                              <option value="Chủ Nhật, 24/05/2026">Chủ Nhật, 24/05</option>
                              <option value="Thứ Hai, 25/05/2026">Thứ Hai, 25/05</option>
                              <option value="Thứ Ba, 26/05/2026">Thứ Ba, 26/05</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-wider text-neutral-500 block">5. Khung giờ phát sóng</label>
                            <select
                              value={newShowtime.time}
                              onChange={(e) => setNewShowtime({ ...newShowtime, time: e.target.value })}
                              className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                            >
                              {TIME_OPTIONS.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 block">6. Giá vé cơ bản định giá (VND)</label>
                          <input
                            type="number"
                            required
                            value={newShowtime.price}
                            onChange={(e) => setNewShowtime({ ...newShowtime, price: Number(e.target.value) })}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 bg-white text-black font-sans uppercase text-[10.5px] font-black tracking-widest hover:bg-neutral-250 transition"
                        >
                          KÍCH HOẠT SUẤT CHIẾU LIÊN KẾT
                        </button>
                      </form>
                    </div>

                    {/* Right controls: Active scheduled logs list representation */}
                    <div className="lg:col-span-3 border border-neutral-850 p-6 bg-[#040404] space-y-4">
                      <div className="border-b border-neutral-900 pb-2 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-sans font-black uppercase text-zinc-300 tracking-wider">HẠNG MỤC SUẤT CHIẾU ĐANG CHẠY</h3>
                          <p className="text-[10px] text-zinc-500">Giám sát các khung chương trình đang kích hoạt ghế khách</p>
                        </div>
                        <span className="text-[9.5px] font-mono text-amber-500 font-extrabold uppercase bg-amber-500/5 px-2 py-0.5 border border-amber-500/25">Tổng phân phối: 82 rạp</span>
                      </div>

                      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2" id="managed-active-showtimes">
                        {[
                          { movie: 'NEON HORIZON', hall: 'Phòng Chiếu Thượng Hạng Gold 01', time: '19:15', date: 'Thứ Bảy, 23/05', seats: '32/40 ghế đã chọn', status: 'SẮT KHÁCH' },
                          { movie: 'QUANTUM PULSE', hall: 'Khán Phòng IMAX 3D Theatre', time: '21:30', date: 'Thứ Bảy, 23/05', seats: '58/80 ghế đã chọn', status: 'SẮT KHÁCH' },
                          { movie: 'THE LAST SHADOW', hall: 'Phòng Standard Suite 03', time: '20:00', date: 'Thứ Bảy, 23/05', seats: '38/44 ghế đã chọn', status: 'BOM PHÒNG' },
                          { movie: 'ZENITH OF DREAMS', hall: 'Phòng Trải Nghiệm 4DX Extreme', time: '14:15', date: 'Chủ Nhật, 24/05', seats: '12/40 ghế đã chọn', status: 'NHO NHÃ' },
                          { movie: 'ECHOES OF SILENCE', hall: 'Phòng Standard Suite 03', time: '11:00', date: 'Chủ Nhật, 24/05', seats: '8/44 ghế đã chọn', status: 'TỰ DO' }
                        ].map((st, index) => (
                          <div key={index} className="border border-neutral-900 bg-neutral-950 p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-serif italic text-sm font-black text-white">{st.movie}</span>
                                <span className="text-[8.5px] bg-[#0c0a05] text-amber-400 font-mono p-0.5 px-1.5 border border-amber-500/10 font-bold">{st.time}</span>
                              </div>
                              <div className="text-[10px] text-zinc-400 flex flex-wrap gap-x-3.5 font-sans">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-neutral-500" /> {st.hall}</span>
                                <span className="text-zinc-500 font-medium">Khung chiếu: {st.date}</span>
                              </div>
                            </div>

                            <div className="text-left sm:text-right w-full sm:w-auto self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end border-t border-neutral-900 pt-2 sm:pt-0 sm:border-0">
                              <span className="text-xs font-mono font-bold text-zinc-300">{st.seats}</span>
                              <span className={`text-[8px] tracking-wide px-1.5 py-0.5 font-bold uppercase ${st.status === 'BOM PHÒNG' ? 'bg-rose-950/20 text-rose-400 border border-rose-500/30' :
                                st.status === 'SẮT KHÁCH' ? 'bg-amber-950/20 text-amber-400 border border-amber-500/30' :
                                  'bg-zinc-900 text-zinc-400'
                                }`}>{st.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>

                  </div>

                </motion.div>
              )}
    </>
  );
}

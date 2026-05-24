import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Edit3, ShieldAlert, FileText, Database, 
  Calendar, Users, DollarSign, Activity, AlertCircle, CheckCircle2, 
  Search, Sliders, ChevronDown, Check, RefreshCw, Layers, 
  BarChart2, Clock, MapPin, Film, Play, Eye, EyeOff, Sparkles, TrendingUp, Info, Globe
} from 'lucide-react';

export default function AdminDashboard({
  moviesList,
  setMoviesList,
  bookedTickets,
  setBookedTickets,
  cinemaLocations,
  onSelectMovie
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'movies' | 'showtimes' | 'transactions' | 'ai-analysis'
  const [selectedAnalysisMovieId, setSelectedAnalysisMovieId] = useState(moviesList[0]?.id || 'neon-horizon');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [analysisScrambleOffset, setAnalysisScrambleOffset] = useState({
    overall: 0,
    story: 0,
    acting: 0,
    visual: 0,
    audio: 0
  });
  const [activeChartPoint, setActiveChartPoint] = useState(6);
  
  // Create state for movies so the dashboard can add/update them
  const [searchQuery, setSearchQuery] = useState('');
  const [filmFilter, setFilmFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'UPCOMING'
  
  // Form state for creating/editing movie
  const [editingMovie, setEditingMovie] = useState(null); // null means adding a new one
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    englishTitle: '',
    genre: '',
    duration: 120,
    ageRating: 'T13',
    director: '',
    synopsis: '',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    releaseDate: '2026-06-01',
    isHot: false,
    isUpcoming: false
  });

  // State to add a screening schedule
  const [newShowtime, setNewShowtime] = useState({
    movieId: moviesList[0]?.id || '',
    city: cinemaLocations[0] || '',
    hall: 'Phòng Chiếu Thượng Hạng Gold 01',
    date: 'Thứ Bảy, 23/05/2026',
    time: '19:30',
    price: 120000
  });
  const [isAddingShowtime, setIsAddingShowtime] = useState(false);
  const [showtimeSuccessMessage, setShowtimeSuccessMessage] = useState('');

  // Predefined lists of halls and times for quick selection
  const HALL_OPTIONS = [
    'Phòng Chiếu Thượng Hạng Gold 01',
    'Khán Phòng IMAX 3D Theatre',
    'Phòng Standard Suite 03',
    'Phòng Trải Nghiệm 4DX Extreme'
  ];

  const TIME_OPTIONS = [
    '09:00', '11:30', '14:15', '16:45', '19:15', '21:30', '23:45'
  ];

  // Sounds configuration
  const playPulseSound = (frequency = 440, type = 'sine', duration = 0.08) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Log of simulated changes within session
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'Khởi tạo hệ thống', target: 'Cơ sở dữ liệu CinePremier v2.0', time: '03:15:02', user: 'Quản trị viên' },
    { id: 2, action: 'Đồng bộ API', target: 'Trung tâm phát hành thẻ VIP', time: '03:20:11', user: 'Hệ thống tự động' }
  ]);

  const addAuditLog = (action, target) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setAuditLogs(prev => [
      { id: Date.now(), action, target, time: timeStr, user: 'Quản trị viên' },
      ...prev
    ]);
  };

  // Consolidated simulated metrics
  const totalBookingsCount = bookedTickets.length + 342; // standard offset
  const calculatedRevenue = (bookedTickets.reduce((acc, ticket) => acc + ticket.totalAmount, 0) + 42450000);
  const averageFillRate = 78.4;

  const handleCreateMovieSubmit = (e) => {
    e.preventDefault();
    playPulseSound(587.33, 'sine', 0.2); // D5 success note

    if (!formData.title || !formData.genre) {
      alert("Vui lòng điền tiêu đề và thể loại phim.");
      return;
    }

    const generatedId = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newMovieObj = {
      id: generatedId,
      title: formData.title.toUpperCase(),
      englishTitle: formData.englishTitle || formData.title,
      genre: formData.genre.split(',').map(g => g.trim()),
      synopsis: formData.synopsis || 'Chưa cung cấp mô tả chi tiết phim.',
      duration: Number(formData.duration) || 120,
      ageRating: formData.ageRating,
      posterUrl: formData.posterUrl,
      bannerUrl: formData.bannerUrl,
      releaseDate: formData.releaseDate,
      director: formData.director || 'Chưa rõ',
      ratings: {
        aiOverall: 9.0,
        aiStory: 9.0,
        aiActing: 9.0,
        aiVisual: 9.0,
        aiAudio: 9.0
      },
      aiAnalysisTags: ['Được_Đề_Xuất', 'Phát_Hành_Mới'],
      isHot: formData.isHot,
      isUpcoming: formData.isUpcoming,
      emotionalWaveform: [30, 45, 60, 40, 80, 90, 50, 70, 85, 95]
    };

    setMoviesList([newMovieObj, ...moviesList]);
    addAuditLog('Thêm phim mới', newMovieObj.title);
    
    // Reset form
    setFormData({
      title: '',
      englishTitle: '',
      genre: '',
      duration: 120,
      ageRating: 'T13',
      director: '',
      synopsis: '',
      posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
      releaseDate: '2026-06-01',
      isHot: false,
      isUpcoming: false
    });
    
    setShowMovieForm(false);
    alert(`Đã biên tập thành công và thêm bản ghi phim: ${newMovieObj.title}`);
  };

  const handleDeleteMovie = (id, title) => {
    if (confirm(`Quý quản trị viên có chắc chắn muốn ngừng phát hành bản ghi phim "${title}" không? Hành động này sẽ rút toàn bộ cổng suất chiếu liên quan.`)) {
      playPulseSound(220, 'sawtooth', 0.25);
      setMoviesList(prev => prev.filter(m => m.id !== id));
      addAuditLog('Xóa phim khỏi luồng', title);
      alert(`Đã đình chỉ phát hành bản ghi phim: ${title}`);
    }
  };

  const handleAddShowtimeSubmit = (e) => {
    e.preventDefault();
    playPulseSound(659.25, 'sine', 0.15); // E5 note

    const targetMovie = moviesList.find(m => m.id === newShowtime.movieId);
    if (!targetMovie) {
      alert("Suất chiếu cần tham chiếu một mã phim cụ thể.");
      return;
    }

    setShowtimeSuccessMessage(`Kích hoạt thành công suất chiếu mới của tác phẩm: ${targetMovie.title}`);
    addAuditLog('Phát phối suất chiếu mới', `${targetMovie.title} tại ${newShowtime.city}`);

    setTimeout(() => {
      setShowtimeSuccessMessage('');
      setIsAddingShowtime(false);
    }, 2800);
  };

  const handleRefundTicket = (ticketId, customerName) => {
    if (confirm(`Xác nhận bồi hoàn giao dịch vé mang mã hiệu [${ticketId}] của khách hàng [${customerName}]? Ghế đã chọn sẽ được hoàn trả lại rạp chiếu.`)) {
      playPulseSound(293.66, 'sine', 0.3);
      setBookedTickets(prev => prev.filter(t => t.ticketId !== ticketId));
      addAuditLog('Hoàn tiền giao dịch', `Mã vé ${ticketId}`);
      alert(`Đã hoàn thành thủ tục hủy vé và hoàn trả tiền cho khách hàng ${customerName}.`);
    }
  };

  // Filter movies
  const filteredMovies = moviesList.filter(mv => {
    const matchesSearch = 
      mv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mv.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mv.director.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (filmFilter === 'ALL') return matchesSearch;
    if (filmFilter === 'ACTIVE') return matchesSearch && !mv.isUpcoming;
    if (filmFilter === 'UPCOMING') return matchesSearch && mv.isUpcoming;
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white select-none">
      
      {/* 1. TOP STATS ENGINE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-neutral-950 to-neutral-900 border border-neutral-850 p-6 shadow-xl relative mb-6" id="admin-top-banner">
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-mono tracking-widest text-[#B5C2CA]">HỆ THỐNG TRUNG TÂM PHÒNG CHIẾU CINEPREMIER</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-black tracking-normal uppercase mt-1">
            BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5 max-w-2xl">
            Cơ sở kiểm kê hạ tầng rạp chiếu toàn quốc, điều phối kế hoạch chiếu, kiểm toán giao dịch bán vé và cập nhật thư viện phim độc quyền một cách chuyên nghiệp.
          </p>
        </div>
        
        {/* Quick status counters */}
        <div className="flex gap-4.5 bg-black/60 border border-neutral-850 p-3 items-center">
          <div className="text-center">
            <span className="text-[8px] text-neutral-500 block font-mono">SERVER HEALTH</span>
            <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">99.8% ONLINE</span>
          </div>
          <div className="h-6 w-[1px] bg-neutral-800"></div>
          <div className="text-center">
            <span className="text-[8px] text-neutral-500 block font-mono">HẠNG MỤC</span>
            <span className="text-xs font-bold text-amber-500 font-mono">ĐỒNG BỘ TRỰC TIẾP</span>
          </div>
        </div>
      </div>

      {/* CORE GRID: RESPONSIVE SIDEBAR + ACTIVE VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: THE DASHBOARD SELECTOR BAR (Cols 3) */}
        <div className="lg:col-span-3 space-y-5 lg:sticky lg:top-8" id="admin-sidebar-bar">
          
          {/* Active Admin Profile */}
          <div className="bg-gradient-to-b from-[#0a0a0a] to-[#040404] border border-neutral-850 p-4.5 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 overflow-hidden rounded-sm border border-amber-500 bg-neutral-900 flex items-center justify-center text-amber-400 font-serif italic text-lg font-black">
                A
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-white tracking-wide">QUẢN TRỊ VIÊN</h4>
                <p className="text-[9px] text-[#88959C] font-mono">ID: CP-99210-ADMIN</p>
              </div>
            </div>
            <div className="h-[1px] bg-neutral-850"></div>
            <div className="flex items-center justify-between text-[10px] font-sans">
              <span className="text-neutral-500">Môi trường</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> PRODUCTION
              </span>
            </div>
          </div>

          {/* Navigation Sidebar List (like image layout) */}
          <div className="bg-[#070707] border border-neutral-850 p-4 space-y-1.5" id="nav-sidebar-items">
            <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-neutral-500 block px-2.5 pb-2 font-black">
              CÔNG CỤ PHÂN PHỐI
            </span>

            <button
              onClick={() => { playPulseSound(440, 'sine', 0.05); setActiveTab('overview'); }}
              className={`w-full flex items-center justify-between px-3 py-3 text-[10.5px] font-sans uppercase font-black tracking-widest transition-all duration-300 border ${
                activeTab === 'overview'
                  ? 'border-amber-500/35 bg-amber-500/10 text-amber-400 font-black'
                  : 'border-white/5 bg-black/40 text-neutral-400 hover:text-white hover:border-neutral-850'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Activity className="h-4 w-4 shrink-0 text-amber-500" />
                <span>TỔNG QUAN HỆ THỐNG</span>
              </span>
              {activeTab === 'overview' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
            </button>

            <button
              onClick={() => { playPulseSound(460, 'sine', 0.05); setActiveTab('movies'); }}
              className={`w-full flex items-center justify-between px-3 py-3 text-[10.5px] font-sans uppercase font-black tracking-widest transition-all duration-300 border ${
                activeTab === 'movies'
                  ? 'border-amber-500/35 bg-amber-500/10 text-amber-400 font-black'
                  : 'border-white/5 bg-black/40 text-neutral-400 hover:text-white hover:border-neutral-850'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Film className="h-4 w-4 shrink-0 text-amber-500" />
                <span>THƯ VIỆN PHIM</span>
              </span>
              {activeTab === 'movies' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
            </button>

            <button
              onClick={() => { playPulseSound(480, 'sine', 0.05); setActiveTab('showtimes'); }}
              className={`w-full flex items-center justify-between px-3 py-3 text-[10.5px] font-sans uppercase font-black tracking-widest transition-all duration-300 border ${
                activeTab === 'showtimes'
                  ? 'border-amber-500/35 bg-amber-500/10 text-amber-400 font-black'
                  : 'border-white/5 bg-black/40 text-neutral-400 hover:text-white hover:border-neutral-850'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Calendar className="h-4 w-4 shrink-0 text-amber-500" />
                <span>ĐIỀU PHỐI LỊCH CHIẾU</span>
              </span>
              {activeTab === 'showtimes' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
            </button>

            <button
              onClick={() => { playPulseSound(500, 'sine', 0.05); setActiveTab('transactions'); }}
              className={`w-full flex items-center justify-between px-3 py-3 text-[10.5px] font-sans uppercase font-black tracking-widest transition-all duration-300 border ${
                activeTab === 'transactions'
                  ? 'border-amber-500/35 bg-amber-500/10 text-amber-400 font-black'
                  : 'border-white/5 bg-black/40 text-neutral-400 hover:text-white hover:border-neutral-850'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                <span>SỔ CÁI KIỂM TOÁN VÉ</span>
              </span>
              {activeTab === 'transactions' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
            </button>

            <button
              onClick={() => { playPulseSound(520, 'sine', 0.07); setActiveTab('ai-analysis'); }}
              className={`w-full flex items-center justify-between px-3 py-3 text-[10.5px] font-sans uppercase font-black tracking-widest transition-all duration-300 border ${
                activeTab === 'ai-analysis'
                  ? 'border-purple-500/35 bg-purple-500/10 text-purple-400 font-black'
                  : 'border-white/5 bg-black/40 text-neutral-400 hover:text-white hover:border-neutral-850'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Sparkles className="h-4 w-4 shrink-0 text-purple-400" />
                <span>PHÂN TÍCH AI PHIM</span>
              </span>
              {activeTab === 'ai-analysis' && <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></span>}
            </button>

            <div className="h-[1px] bg-neutral-900 my-3"></div>

            {/* Quick action: Exit / Back */}
            <button
              onClick={() => {
                playPulseSound(300, 'sine', 0.15);
                alert("Hệ thống: Rời khỏi phiên làm việc Quản trị viên.");
                window.location.reload();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-[10.5px] font-sans uppercase font-bold tracking-widest text-[#E57373] hover:text-white hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 transition-all duration-200"
            >
              <RefreshCw className="h-3.5 w-3.5 text-rose-500 animate-spin-slow" />
              <span>ĐỒNG BỘ TRANG CHỦ</span>
            </button>
          </div>

          {/* Infrastructure Metrics indicators */}
          <div className="bg-[#0b0b0b] border border-neutral-850 p-4 space-y-3" id="sidebar-telemetry">
            <span className="text-[7.5px] font-mono tracking-widest text-neutral-500 uppercase block font-black">ĐỒNG BỘ MÁY CHỦ</span>
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Database Sync</span>
                <span className="text-emerald-400 font-bold">OK</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Cloud Run Cores</span>
                <span className="text-zinc-300">04 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: MAIN VIEW DETAILS (Cols 9) */}
        <div className="lg:col-span-9 space-y-6">

          {/* 2. CORPORATE CORE BENTO METRICS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="corporate-bento-metrics">
            
            {/* Metric Card 1 */}
            <div className="bg-gradient-to-b from-[#0c0c0c] to-[#040404] border border-neutral-850 p-5 space-y-2.5 relative overflow-hidden shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[9px] tracking-wider font-extrabold text-[#7E8B93] uppercase font-sans">Tổng doanh thu liên kết</span>
                <div className="p-1 bg-amber-500/10 text-amber-500"><DollarSign className="h-4 w-4" /></div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-mono font-black text-white">{calculatedRevenue.toLocaleString()}đ</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-emerald-400 font-mono">▲ +12.4%</span>
                  <span className="text-[9px] text-[#556268]">so với tuần trước</span>
                </div>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-gradient-to-b from-[#0c0c0c] to-[#040404] border border-neutral-850 p-5 space-y-2.5 relative overflow-hidden shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[9px] tracking-wider font-extrabold text-[#7E8B93] uppercase font-sans">Sản lượng vé xuất xưởng</span>
                <div className="p-1 bg-emerald-500/10 text-emerald-400"><FileText className="h-4 w-4" /></div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-mono font-black text-white">{totalBookingsCount} vé</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-emerald-400 font-mono">▲ +48 vé mới</span>
                  <span className="text-[9px] text-[#556268]">qua giao dịch cổng VIP</span>
                </div>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-gradient-to-b from-[#0c0c0c] to-[#040404] border border-neutral-850 p-5 space-y-2.5 relative overflow-hidden shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[9px] tracking-wider font-extrabold text-[#7E8B93] uppercase font-sans">Hệ số lấp đầy rạp</span>
                <div className="p-1 bg-blue-500/10 text-blue-400"><Activity className="h-4 w-4" /></div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-mono font-black text-white">{averageFillRate}%</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-[#7E8B93] font-mono">Tối ưu hóa:</span>
                  <span className="text-[9px] text-orange-400 font-bold">KHUNG GIỜ VÀNG QUÁ TẢI</span>
                </div>
              </div>
            </div>

            {/* Metric Card 4 */}
            <div className="bg-gradient-to-b from-[#0c0c0c] to-[#040404] border border-neutral-850 p-5 space-y-2.5 relative overflow-hidden shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[9px] tracking-wider font-extrabold text-[#7E8B93] uppercase font-sans">Thư viện phát hành</span>
                <div className="p-1 bg-purple-500/10 text-purple-400"><Film className="h-4 w-4" /></div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-mono font-black text-white">{moviesList.length} tác phẩm</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-neutral-400 font-sans">Phân loại:</span>
                  <span className="text-[9px] text-amber-400 font-mono font-bold">{moviesList.filter(m=>m.isUpcoming).length} sắp chiếu / {moviesList.filter(m=>!m.isUpcoming).length} đang chiếu</span>
                </div>
              </div>
            </div>

          </div>

          {/* 3. SECONDARY CONTROLS OR AUDIT LOG MINI STRIP */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#070707] border border-neutral-850 p-3 px-4.5 gap-3.5" id="audit-log-strip">
            <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-hidden">
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[8.5px] font-mono font-bold border border-amber-500/20 uppercase">Nhật Ký Ghi Nhận</span>
              <p className="text-[10.5px] text-neutral-400 font-sans truncate">
                {auditLogs[0] ? `[${auditLogs[0].time}] ${auditLogs[0].action}: ${auditLogs[0].target} - thực hiện bởi ${auditLogs[0].user}` : 'Không có hoạt động mới ghi nhận'}
              </p>
            </div>
            <button 
              onClick={() => {
                playPulseSound(700, 'sine', 0.1);
                addAuditLog('Làm mới chỉ số rạp chiếu', 'Cập nhật doanh thu tổng');
              }}
              className="shrink-0 flex items-center gap-1.5 text-[9px] font-mono hover:text-white uppercase text-[#88959C] border border-neutral-800 bg-black/40 px-3 py-1 transition"
            >
              <RefreshCw className="h-3 w-3 animate-spin-slow" /> HỒI PHỤC ĐỒNG BỘ
            </button>
          </div>

          {/* TAB SCREENS EXECUTOR */}
          <div>
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="panel-overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Interactive Area Line Chart (Revenue Trend) */}
                <div className="col-span-1 lg:col-span-2 border border-neutral-850 p-5 bg-gradient-to-b from-[#0a0a0a] to-[#030303] space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono tracking-widest text-amber-500 uppercase font-black">LƯU LƯỢNG GIAO DỊCH TRỰC TIẾP</span>
                      <h3 className="text-xs font-sans font-black uppercase tracking-wider text-neutral-300">Biểu đồ biến động doanh thu 7 ngày gần nhất</h3>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-[#88959C]">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      <span>Hàng tuần</span>
                    </div>
                  </div>

                  {/* High fidelity interactive area line chart */}
                  <div className="relative pt-2" id="revenue-line-chart-box">
                    <div className="absolute right-4 top-1 bg-black/80 border border-neutral-800 p-2 text-[10.5px] font-mono rounded shadow-lg text-neutral-300 pointer-events-none z-10">
                      {[
                        { day: 'Thứ Hai', rev: 5200000, desc: 'Lượng vé rạp thường ổn định' },
                        { day: 'Thứ Ba', rev: 6800000, desc: 'Happy Tuesday ưu đãi thành viên' },
                        { day: 'Thứ Tư', rev: 8400000, desc: 'Giờ vàng phim Noir & Art' },
                        { day: 'Thứ Năm', rev: 7900000, desc: 'Suất chiếu sớm sneak show' },
                        { day: 'Thứ Sáu', rev: 12500000, desc: 'Bắt đầu làn sóng cuối tuần' },
                        { day: 'Thứ Bảy', rev: 18900000, desc: 'Cao điểm tối thứ Bảy quá tải' },
                        { day: 'Chủ Nhật', rev: 15450000, desc: 'Gia đình đặt vé giải trí sớm' }
                      ][activeChartPoint] ? (
                        <>
                          <div className="text-amber-400 font-extrabold flex justify-between gap-4">
                            <span>{[
                              { day: 'Thứ Hai' }, { day: 'Thứ Ba' }, { day: 'Thứ Tư' }, { day: 'Thứ Năm' }, { day: 'Thứ Sáu' }, { day: 'Thứ Bảy' }, { day: 'Chủ Nhật' }
                            ][activeChartPoint].day}</span>
                            <span>▲ {(([
                              5200000, 6800000, 8400000, 7900000, 12500000, 18900000, 15450000
                            ][activeChartPoint] / calculatedRevenue) * 100).toFixed(1)}% Tổng</span>
                          </div>
                          <div className="text-white text-xs font-bold font-mono mt-0.5">
                            {([
                              5200000, 6800000, 8400000, 7900000, 12500000, 18900000, 15450000
                            ][activeChartPoint]).toLocaleString()}đ
                          </div>
                          <p className="text-[9px] text-[#556268] mt-0.5">
                            {[
                              { desc: 'Lượng vé rạp thường ổn định' },
                              { desc: 'Happy Tuesday ưu đãi thành viên' },
                              { desc: 'Giờ vàng phim Noir & Art' },
                              { desc: 'Suất chiếu sớm sneak show' },
                              { desc: 'Bắt đầu làn sóng cuối tuần' },
                              { desc: 'Cao điểm tối thứ Bảy quá tải' },
                              { desc: 'Gia đình đặt vé giải trí sớm' }
                            ][activeChartPoint].desc}
                          </p>
                        </>
                      ) : (
                        <span className="text-neutral-500">Rê chuột lên điểm biểu đồ</span>
                      )}
                    </div>

                    <svg viewBox="0 0 600 200" className="w-full h-auto overflow-visible select-none">
                      <defs>
                        {/* Area gradient */}
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                        </linearGradient>
                        {/* Glow Filter */}
                        <filter id="neonGlowLine" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* X and Y grid lines */}
                      <line x1="40" y1="30" x2="570" y2="30" stroke="#1d1d21" strokeDasharray="3,3" />
                      <line x1="40" y1="70" x2="570" y2="70" stroke="#1d1d21" strokeDasharray="3,3" />
                      <line x1="40" y1="110" x2="570" y2="110" stroke="#1d1d21" strokeDasharray="3,3" />
                      <line x1="40" y1="150" x2="570" y2="150" stroke="#1d1d21" strokeDasharray="3,3" />
                      <line x1="40" y1="180" x2="570" y2="180" stroke="#2a2a30" strokeWidth="1" />

                      {/* Y-axis Label notations */}
                      <text x="12" y="34" className="text-[8px] font-mono fill-neutral-600 text-right">24Mđ</text>
                      <text x="12" y="74" className="text-[8px] font-mono fill-neutral-600">16Mđ</text>
                      <text x="12" y="114" className="text-[8px] font-mono fill-neutral-600">8Mđ</text>
                      <text x="12" y="154" className="text-[8px] font-mono fill-neutral-600">4Mđ</text>
                      <text x="12" y="184" className="text-[8px] font-mono fill-neutral-500">0đ</text>

                      {/* AREA FILL */}
                      <path 
                        d="M 50 180 L 50 165 L 130 152 L 210 135 L 290 140 L 370 95 L 450 45 L 530 68 L 530 180 Z" 
                        fill="url(#chartGradient)" 
                      />

                      {/* GLOWING LINE GRAPH */}
                      <path 
                        d="M 50 165 L 130 152 L 210 135 L 290 140 L 370 95 L 450 45 L 530 68" 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="2.5" 
                        filter="url(#neonGlowLine)"
                      />

                      {/* Interactive active line vertical bar */}
                      {activeChartPoint !== -1 && (
                        <line 
                          x1={[50, 130, 210, 290, 370, 450, 530][activeChartPoint]} 
                          y1="30" 
                          x2={[50, 130, 210, 290, 370, 450, 530][activeChartPoint]} 
                          y2="180" 
                          stroke="#eab308" 
                          strokeWidth="1" 
                          strokeDasharray="2,2" 
                        />
                      )}

                      {/* DOTS of days and hover anchors */}
                      {[
                        { x: 50, y: 165, idx: 0, label: 'Th.2' },
                        { x: 130, y: 152, idx: 1, label: 'Th.3' },
                        { x: 210, y: 135, idx: 2, label: 'Th.4' },
                        { x: 290, y: 140, idx: 3, label: 'Th.5' },
                        { x: 370, y: 95, idx: 4, label: 'Th.6' },
                        { x: 450, y: 45, idx: 5, label: 'Th.7' },
                        { x: 530, y: 68, idx: 6, label: 'CN' }
                      ].map((dot) => (
                        <g key={dot.idx}>
                          {/* Inner circle anchor point */}
                          <circle 
                            cx={dot.x} 
                            cy={dot.y} 
                            r={activeChartPoint === dot.idx ? "6" : "3.5"} 
                            fill={activeChartPoint === dot.idx ? "#ffffff" : "#f59e0b"} 
                            stroke="#000000"
                            strokeWidth="1.5"
                            className="transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => {
                              playPulseSound(500 + dot.idx * 50, 'sine', 0.03);
                              setActiveChartPoint(dot.idx);
                            }}
                          />
                          {/* invisible safe hover area for touch screens */}
                          <circle 
                            cx={dot.x} 
                            cy={dot.y} 
                            r="15" 
                            fill="transparent" 
                            className="cursor-pointer"
                            onMouseEnter={() => {
                              setActiveChartPoint(dot.idx);
                            }}
                          />
                          {/* X-axis labels */}
                          <text 
                            x={dot.x} 
                            y="194" 
                            textAnchor="middle" 
                            className={`text-[9.5px] font-mono font-bold ${activeChartPoint === dot.idx ? 'fill-amber-400 font-extrabold' : 'fill-neutral-500'}`}
                          >
                            {dot.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Regional breakdown chart under the line graph */}
                  <div className="pt-2 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[8.5px] font-mono text-neutral-500 uppercase block font-bold mb-2">Phân bổ doanh thu theo địa hạt đô thị</span>
                      <div className="space-y-3 pt-1">
                        {[
                          { city: 'Hà Nội (CineWest Lake & Royal)', revenue: 15450000, percentage: 80, color: 'bg-amber-400' },
                          { city: 'TP. Hồ Chí Minh (CineLandmark 81 & IMAX)', revenue: 18900000, percentage: 100, color: 'bg-cyan-400' },
                          { city: 'Đà Nẵng & Nha Trang rạp liên kết', revenue: 9200000, percentage: 55, color: 'bg-rose-500' }
                        ].map((row) => (
                          <div key={row.city} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-sans">
                              <span className="text-zinc-400">{row.city}</span>
                              <span className="font-mono text-zinc-200 font-bold">{row.revenue.toLocaleString()}đ</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-950 border border-neutral-900 relative">
                              <div 
                                className={`h-full ${row.color} transition-all duration-1000`} 
                                style={{ width: `${row.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center bg-amber-950/5 border border-amber-500/10 p-3 text-[11px] leading-relaxed text-neutral-300">
                      <div className="flex items-center space-x-1 mb-1 font-bold text-amber-400">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>KIỂM TOÁN TƯ VẤN CỦA TRÍ TUỆ AI</span>
                      </div>
                      Điểm trũng doanh thu rơi vào <span className="underline font-bold text-white">Thứ Hai đầu tuần</span>. Khuyến nghị thiết lập suất chiếu ưu đãi <b>"Cinephile Night" sau 21h</b> để khai thác hạ tầng nhàn rỗi thu lợi nhuận rạp tối đa.
                    </div>
                  </div>
                </div>

                {/* 2. Donut Chart - Ticket Class Purchases */}
                <div className="border border-neutral-850 p-5 bg-gradient-to-b from-[#0a0a0a] to-[#030303] space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-zinc-900 pb-3 mb-4">
                      <span className="text-[8px] font-mono tracking-widest text-[#a855f7] uppercase font-black">PHÂN DÒNG SẢN LƯỢNG VÉ</span>
                      <h3 className="text-xs font-sans font-black uppercase tracking-wider text-neutral-300">Tỷ lệ phân hạng ghế bán ra</h3>
                    </div>

                    {/* Core SVG Donut Chart */}
                    <div className="flex flex-col items-center justify-center my-2 space-y-4">
                      <div className="relative h-32 w-32 flex items-center justify-center" id="donut-ticket-tier-box">
                        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                          {/* Track ring */}
                          <circle cx="60" cy="60" r="44" fill="transparent" stroke="#0e0e11" strokeWidth="8" />

                          {/* VIP (45%) Segment */}
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="44" 
                            fill="transparent" 
                            stroke="#f59e0b" 
                            strokeWidth="8" 
                            strokeDasharray="124.4 276.4" 
                            strokeDashoffset="0"
                            className="transition-all duration-500"
                          />

                          {/* Standard (35%) Segment */}
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="44" 
                            fill="transparent" 
                            stroke="#10b981" 
                            strokeWidth="8" 
                            strokeDasharray="96.7 276.4" 
                            strokeDashoffset="-124.4"
                            className="transition-all duration-500"
                          />

                          {/* Couple/Premium Suite (20%) Segment */}
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="44" 
                            fill="transparent" 
                            stroke="#06b6d4" 
                            strokeWidth="8" 
                            strokeDasharray="55.3 276.4" 
                            strokeDashoffset="-221.1"
                            className="transition-all duration-500"
                          />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[7.5px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Hệ số lấp</span>
                          <span className="text-sm font-mono font-black text-white">{averageFillRate}%</span>
                          <span className="text-[8px] text-emerald-400 font-mono font-bold">CHỈ SỐ SẠCH</span>
                        </div>
                      </div>

                      {/* Legend keys mapping */}
                      <div className="w-full grid grid-cols-3 gap-1 pt-2">
                        <div className="bg-black/40 border border-neutral-900 p-1.5 text-center rounded">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            <span className="text-[8px] font-mono text-zinc-400 font-bold">VIP</span>
                          </div>
                          <span className="block text-xs font-mono font-black text-white mt-1">45%</span>
                          <span className="text-[7.5px] text-neutral-500 font-mono block">168 vé</span>
                        </div>
                        <div className="bg-black/40 border border-neutral-900 p-1.5 text-center rounded">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[8px] font-mono text-zinc-400 font-bold">Chuẩn</span>
                          </div>
                          <span className="block text-xs font-mono font-black text-white mt-1">35%</span>
                          <span className="text-[7.5px] text-neutral-500 font-mono block">131 vé</span>
                        </div>
                        <div className="bg-black/40 border border-neutral-900 p-1.5 text-center rounded">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                            <span className="text-[8px] font-mono text-zinc-400 font-bold">Đôi</span>
                          </div>
                          <span className="block text-xs font-mono font-black text-white mt-1">20%</span>
                          <span className="text-[7.5px] text-neutral-500 font-mono block">75 vé</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0b0c10] border border-neutral-900 p-2.5 rounded text-[10px] text-zinc-400 font-mono">
                    <span className="font-bold text-amber-500">★ CO CẤU DOANH THU KỶ LỤC</span>
                    <span className="block mt-0.5 text-[8.5px] text-neutral-500 leading-normal">Ghế VIP đóng góp trên 54% tổng doanh thu rạp CinePremier nhờ hệ thống phòng chiếu Gold Lounge & IMAX.</span>
                  </div>
                </div>

              </div>

              {/* Server Audit logs in pristine terminal view */}
              <div className="border border-neutral-850 bg-black p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                  <span className="text-[9.5px] font-black text-amber-500 tracking-widest uppercase">ĐỒNG HỒ GIAO DỊCH VÀ KIỂM TOÁN HỆ THỐNG</span>
                  <span className="text-[8.5px] text-zinc-500 uppercase">SYSTEM LOG PROTOCOL</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2" id="terminal-audit-box">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="text-[11px] flex justify-between gap-4 text-zinc-400">
                      <div>
                        <span className="text-[#6272A4] font-bold">[{log.time}]</span>{' '}
                        <span className="text-amber-400 font-extrabold">{log.action}:</span>{' '}
                        <span className="text-zinc-200">{log.target}</span>
                      </div>
                      <span className="text-zinc-500 shrink-0 uppercase text-[9.5px]">[{log.user}]</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: MOVIES */}
          {activeTab === 'movies' && (
            <motion.div
              key="panel-movies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* Filter tools */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#070707] border border-neutral-850 p-4">
                
                {/* Custom input search */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-neutral-600" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm phim theo tiêu đề hoặc đạo diễn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black border border-neutral-800 focus:border-amber-400 p-2.5 pl-10 text-xs text-white focus:outline-none focus:ring-0 placeholder-neutral-700 font-sans"
                    id="search-all-movies-input"
                  />
                </div>

                {/* Grid categories for status filter */}
                <div className="flex gap-2 w-full md:w-auto" id="film-filter-container">
                  {[
                    { id: 'ALL', name: 'TẤT CẢ PHIM' },
                    { id: 'ACTIVE', name: 'ĐANG PHÁT HÀNH' },
                    { id: 'UPCOMING', name: 'SẮP PHÁT HÀNH (SẮP CHIẾU)' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => { playPulseSound(420, 'sine', 0.05); setFilmFilter(filter.id); }}
                      className={`px-3 py-2 text-[9.5px] uppercase font-bold transition-all ${
                        filmFilter === filter.id
                          ? 'bg-amber-500 text-black font-extrabold'
                          : 'bg-black text-neutral-400 border border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => { playPulseSound(600, 'sine', 0.1); setShowMovieForm(true); }}
                    className="ml-auto md:ml-0 px-4 py-2 bg-white text-black font-sans uppercase text-[9.5px] font-black tracking-wider hover:bg-neutral-250 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="h-4 w-4" /> THÊM BẢN GHI MỚI
                  </button>
                </div>
              </div>

              {/* MOVIE FORM MODAL (ADD OR EDIT RECORD) */}
              <AnimatePresence>
                {showMovieForm && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-amber-500/20 bg-gradient-to-b from-[#0e0c05] to-[#040404] p-5.5 space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1">
                        <Play className="h-3 w-3" /> THIẾT LẬP HỒ SƠ PHÁT HÀNH CHI TIẾT
                      </span>
                      <button 
                        onClick={() => { playPulseSound(300, 'sine', 0.05); setShowMovieForm(false); }}
                        className="text-xs text-neutral-500 hover:text-white uppercase font-bold"
                      >
                        HỦY THAO TÁC
                      </button>
                    </div>

                    <form onSubmit={handleCreateMovieSubmit} className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-extrabold block">Tên tác phẩm (Tiếng Việt viết Hoa)</label>
                          <input 
                            type="text"
                            required
                            placeholder="VÍ DỤ: CHIẾN BINH ÁNH SÁNG"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-extrabold block">Tên tiếng Anh hoặc tiêu đề gốc</label>
                          <input 
                            type="text"
                            placeholder="VÍ DỤ: Dawn of Light"
                            value={formData.englishTitle}
                            onChange={(e) => setFormData({...formData, englishTitle: e.target.value})}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-[#A1B0B8] block">Đạo diễn</label>
                          <input 
                            type="text"
                            placeholder="Trần Anh Hùng"
                            value={formData.director}
                            onChange={(e) => setFormData({...formData, director: e.target.value})}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-[#A1B0B8] block">Thể loại (Ngăn nhau bởi dấu phẩy)</label>
                          <input 
                            type="text"
                            required
                            placeholder="Hành Động, Khoa Học"
                            value={formData.genre}
                            onChange={(e) => setFormData({...formData, genre: e.target.value})}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-[#A1B0B8] block">Thời lượng (Số phút)</label>
                          <input 
                            type="number"
                            required
                            value={formData.duration}
                            onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-[#A1B0B8] block">Độ tuổi phân loại</label>
                          <select 
                            value={formData.ageRating}
                            onChange={(e) => setFormData({...formData, ageRating: e.target.value})}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                          >
                            <option value="P">P (Mọi lứa tuổi)</option>
                            <option value="T13">T13 (Dưới 13 hạn chế)</option>
                            <option value="T16">T16 (Dưới 16 hạn chế)</option>
                            <option value="T18">T18 (Chỉ dành cho người trưởng thành)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 block">Địa chỉ ảnh Poster đứng (URL)</label>
                          <input 
                            type="text"
                            value={formData.posterUrl}
                            onChange={(e) => setFormData({...formData, posterUrl: e.target.value})}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 block">Địa chỉ ảnh Banner ngang (URL)</label>
                          <input 
                            type="text"
                            value={formData.bannerUrl}
                            onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                            className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#A1B0B8] block">Tóm tắt cốt truyện cốt lõi</label>
                        <textarea 
                          rows={3}
                          value={formData.synopsis}
                          onChange={(e) => setFormData({...formData, synopsis: e.target.value})}
                          placeholder="Mô tả tóm tắt nội dung để hấp dẫn khách mua vé..."
                          className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                        />
                      </div>

                      <div className="flex gap-6 p-1 border-t border-neutral-900 pt-3">
                        <label className="flex items-center space-x-2 cursor-pointer text-zinc-300 text-xs">
                          <input 
                            type="checkbox"
                            checked={formData.isHot}
                            onChange={(e) => setFormData({...formData, isHot: e.target.checked})}
                            className="accent-amber-500 h-3.5 w-3.5"
                          />
                          <span>Đánh dấu tác phẩm <b>BOM TẤN HOT</b></span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer text-zinc-300 text-xs">
                          <input 
                            type="checkbox"
                            checked={formData.isUpcoming}
                            onChange={(e) => setFormData({...formData, isUpcoming: e.target.checked})}
                            className="accent-amber-500 h-3.5 w-3.5"
                          />
                          <span>Gắn nhãn tác phẩm <b>SẮP CHIẾU (CHƯA PHỤC VỤ ĐẶT GHẾ)</b></span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4.5 bg-amber-500 hover:bg-amber-400 text-black font-sans font-black text-xs uppercase tracking-widest transition shadow-lg"
                      >
                        GHI BẢN GHI PHIM & PHÁT HÀNH TRÊN CỔNG TRỰC TUYẾN
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LIST OF MOVIES IN DATABASE - Pristine table layout */}
              <div className="border border-neutral-850 bg-neutral-950 overflow-x-auto shadow-md">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-neutral-850 bg-black text-[#7E8B93] text-[9.5px] uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Hình ảnh</th>
                      <th className="py-3 px-4">Tên phim & Thời lượng</th>
                      <th className="py-3 px-4">Thể loại</th>
                      <th className="py-3 px-4">Đạo diễn</th>
                      <th className="py-3 px-4">Trạng thái phát hành</th>
                      <th className="py-3 px-4 text-right">Thao tác dữ liệu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-xs">
                    {filteredMovies.map(mv => (
                      <tr key={mv.id} className="hover:bg-neutral-900/35 transition-all">
                        <td className="py-3.5 px-4 shrink-0">
                          <img 
                            src={mv.posterUrl} 
                            alt={mv.title} 
                            className="w-10 h-14 object-cover border border-zinc-800"
                            referrerPolicy="no-referrer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-serif italic text-sm text-white font-black">{mv.title}</div>
                          <div className="text-[10px] text-zinc-500 truncate max-w-xs">{mv.englishTitle}</div>
                          <div className="flex gap-2 items-center mt-1">
                            <span className="text-[9.5px] border border-neutral-850 bg-[#060606] px-1.5 py-0.5 text-zinc-400 font-mono">{mv.duration} phút</span>
                            <span className={`text-[9.5px] px-1.5 py-0.5 font-bold ${
                              mv.ageRating === 'T18' ? 'bg-red-950/20 text-red-400 border border-red-500/20' : 'bg-neutral-900 text-zinc-400'
                            }`}>{mv.ageRating}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10.5px] text-zinc-300 font-medium">{mv.genre.join(' • ')}</span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 font-semibold">
                          {mv.director}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {mv.isUpcoming ? (
                              <span className="inline-flex items-center px-2 py-1 bg-amber-950/40 text-amber-400 border border-amber-500/30 text-[9px] uppercase font-bold tracking-wider rounded-sm select-none shrink-0 h-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                                SẮP CHIẾU
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-emerald-950/30 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold tracking-wider rounded-sm select-none shrink-0 h-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                                ĐANG CHIẾU
                              </span>
                            )}
                            {mv.isHot && (
                              <span className="inline-flex items-center px-1.5 py-1 bg-red-600 text-white text-[8px] font-black tracking-widest uppercase rounded-sm select-none shrink-0 h-6">
                                HOT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => onSelectMovie(mv.id)}
                              className="p-1 px-2 text-[9px] border border-neutral-800 hover:border-white transition uppercase font-sans text-neutral-400 hover:text-white"
                              title="Xem trang chi tiết bên ngoài"
                            >
                              Xem trang
                            </button>
                            <button
                              onClick={() => handleDeleteMovie(mv.id, mv.title)}
                              className="p-1.5 text-rose-400 hover:bg-rose-950/10 border border-transparent hover:border-rose-500/30 transition shadow-sm"
                              title="Tước quyền phát hành phim"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMovies.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono uppercase tracking-wider">
                          Không tìm thấy bản ghi phim phù hợp tiêu chí truy vấn
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

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
                        onChange={(e) => setNewShowtime({...newShowtime, movieId: e.target.value})}
                        className="w-full bg-black border border-neutral-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {moviesList.filter(m=>!m.isUpcoming).map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 focus-within:text-[#EAB308]">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">2. Chi nhánh rạp & Đô thị</label>
                      <select
                        value={newShowtime.city}
                        onChange={(e) => setNewShowtime({...newShowtime, city: e.target.value})}
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
                        onChange={(e) => setNewShowtime({...newShowtime, hall: e.target.value})}
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
                          onChange={(e) => setNewShowtime({...newShowtime, date: e.target.value})}
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
                          onChange={(e) => setNewShowtime({...newShowtime, time: e.target.value})}
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
                        onChange={(e) => setNewShowtime({...newShowtime, price: Number(e.target.value)})}
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
                          <span className={`text-[8px] tracking-wide px-1.5 py-0.5 font-bold uppercase ${
                            st.status === 'BOM PHÒNG' ? 'bg-rose-950/20 text-rose-400 border border-rose-500/30' :
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

          {/* TAB 4: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <motion.div
              key="panel-transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              <div className="border border-neutral-850 bg-neutral-950 overflow-hidden shadow-md">
                <div className="p-4.5 bg-black border-b border-neutral-850 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="space-y-0.5 self-start">
                    <h3 className="text-xs font-sans font-black uppercase text-zinc-300 tracking-wider">THƯ SỔ CÁI TOÀN BỘ GIAO DỊCH KHÁCH HÀNG</h3>
                    <p className="text-[10px] text-zinc-500">Giám sát các cổng thanh toán liên bang, hoàn bồi ghế ngồi</p>
                  </div>

                  {/* Transaction counters indicator */}
                  <div className="text-[10px] text-zinc-400 font-mono tracking-wider bg-zinc-900/40 border border-neutral-800 p-2 uppercase flex gap-4">
                    <span>Đã giải quyết: <b>{bookedTickets.length} trực tuyến</b></span>
                    <span>Tồn quỹ rạp: <b className="text-amber-400">{calculatedRevenue.toLocaleString()}đ</b></span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-neutral-950 bg-neutral-950 text-[#7E8B93] text-[9.5px] uppercase font-bold tracking-wider whitespace-nowrap select-none">
                        <th className="py-3 px-4">Khách hàng / Mã vé</th>
                        <th className="py-3 px-4">Tác phẩm điện ảnh</th>
                        <th className="py-3 px-4">Rạp chiếu / Khung giờ</th>
                        <th className="py-3 px-4 font-mono text-center">Định vị ghế</th>
                        <th className="py-3 px-4 text-right">Tổng tiền thanh toán</th>
                        <th className="py-3 px-4 text-right">Cơ chế quản trị</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 text-xs">
                      {bookedTickets.map(tc => (
                        <tr key={tc.ticketId} className="hover:bg-neutral-900/35 transition-all">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-white font-sans flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500"></span> Minh Hồng VIP
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 tracking-wider">{tc.ticketId}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-serif italic font-black text-xs text-white">{tc.movie.title}</div>
                            <span className="text-[9px] text-[#7E8B93] font-mono block uppercase">{tc.movie.englishTitle}</span>
                          </td>
                          <td className="py-3.5 px-4 font-sans text-neutral-300 whitespace-nowrap">
                            <div className="font-bold">{tc.hall.split('(')[0]}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{tc.showtime} - {tc.date.split(',')[0]}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1 flex-wrap max-w-[120px] mx-auto">
                              {tc.selectedSeats.map(s => (
                                <span key={s.id} className="inline-flex items-center px-1.5 py-0.5 bg-zinc-950 border border-neutral-850 font-mono font-black text-rose-400 text-[10px] rounded-sm shadow-inner">
                                  {s.id}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-white font-black text-sm whitespace-nowrap">
                            {tc.totalAmount.toLocaleString()}đ
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleRefundTicket(tc.ticketId, 'Minh Hồng VIP')}
                              className="px-2.5 py-1 bg-rose-950/20 text-rose-400 border border-rose-500/25 hover:bg-rose-500 hover:text-black transition uppercase text-[9.5px] font-sans font-bold rounded-sm"
                              title="Hủy vé bồi hoàn dòng tiền"
                            >
                              HỦY KHÓA VÀ HOÀN TIỀN
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Mocked historical seed transactions for premium simulation screen matching screenshot */}
                      <tr className="hover:bg-neutral-900/35 transition-all opacity-85">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-zinc-400 font-sans flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-zinc-500"></span> Nguyễn Văn Nam
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 tracking-wider">CP-748293</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-serif italic font-black text-xs text-zinc-400">NEON HORIZON</div>
                          <span className="text-[9px] text-[#556268] font-mono block uppercase">Neon Horizon: Future Retrogression</span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-zinc-400 whitespace-nowrap">
                          <div className="font-semibold">CinePremier Landmark 81</div>
                          <div className="text-[10px] text-zinc-500 font-mono">19:15 - Thứ Bảy, 23/05</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 flex-wrap max-w-[120px] mx-auto">
                            {["C12", "C14"].map(s => (
                              <span key={s} className="inline-flex items-center px-1.5 py-0.5 bg-neutral-900 border border-neutral-850 font-mono text-zinc-500 text-[10px] rounded-sm">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-300 font-bold text-sm whitespace-nowrap">
                          240.000đ
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 bg-zinc-900 text-zinc-600 text-[9.5px] uppercase font-bold tracking-widest border border-neutral-800 rounded-sm">
                            HOÀN THÀNH TẠI QUẦY
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-neutral-900/35 transition-all opacity-85">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-zinc-400 font-sans flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-zinc-500"></span> Đặng Thuỳ Trang
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 tracking-wider">CP-491028</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-serif italic font-black text-xs text-zinc-400">ZENITH OF DREAMS</div>
                          <span className="text-[9px] text-[#556268] font-mono block uppercase">Zenith of Dreams</span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-zinc-400 whitespace-nowrap">
                          <div className="font-semibold">CinePremier West Lake</div>
                          <div className="text-[10px] text-zinc-500 font-mono">14:15 - Chủ Nhật, 24/05</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 flex-wrap max-w-[120px] mx-auto">
                            {["F8", "F9", "F10"].map(s => (
                              <span key={s} className="inline-flex items-center px-1.5 py-0.5 bg-neutral-900 border border-neutral-850 font-mono text-zinc-500 text-[10px] rounded-sm">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-300 font-bold text-sm whitespace-nowrap">
                          360.000đ
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 bg-zinc-900 text-zinc-600 text-[9.5px] uppercase font-bold tracking-widest border border-neutral-800 rounded-sm">
                            HOÀN THÀNH TẠI QUẦY
                          </span>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 5: AI ANALYSIS OF MOVIES */}
          {activeTab === 'ai-analysis' && (() => {
            const m = moviesList.find(x => x.id === selectedAnalysisMovieId) || moviesList[0];
            if (!m) return null;

            // Generate dynamic ratings based on movie database plus any requested calibration offsets
            const overallScore = Math.min(10.0, Math.max(1.0, Number((m.ratings?.aiOverall || 9.2) + analysisScrambleOffset.overall))).toFixed(1);
            const storyScore = Math.min(10.0, Math.max(1.0, Number((m.ratings?.aiStory || 9.0) + analysisScrambleOffset.story))).toFixed(1);
            const actingScore = Math.min(10.0, Math.max(1.0, Number((m.ratings?.aiActing || 8.8) + analysisScrambleOffset.acting))).toFixed(1);
            const visualScore = Math.min(10.0, Math.max(1.0, Number((m.ratings?.aiVisual || 9.4) + analysisScrambleOffset.visual))).toFixed(1);
            const audioScore = Math.min(10.0, Math.max(1.0, Number((m.ratings?.aiAudio || 8.9) + analysisScrambleOffset.audio))).toFixed(1);

            // Compute circular SVG dashoffset
            const radius = 38;
            const strokeDasharray = 2 * Math.PI * radius; // ~238.7
            const strokeDashoffset = strokeDasharray - (strokeDasharray * Number(overallScore)) / 10;

            const handleReanalyzeClick = () => {
              if (isReanalyzing) return;
              playPulseSound(200, 'triangle', 0.2);
              setTimeout(() => playPulseSound(400, 'triangle', 0.1), 150);
              setTimeout(() => playPulseSound(600, 'sawtooth', 0.1), 300);
              
              setIsReanalyzing(true);
              addAuditLog('Tiến trình CineAI-M3', `Bắt đầu máy quét quang phổ phân biệt cho: ${m.title}`);

              setTimeout(() => {
                setIsReanalyzing(false);
                // Random walk recalculation
                const offsetOverall = (Math.random() * 0.8 - 0.4);
                const offsetStory = (Math.random() * 0.8 - 0.4);
                const offsetActing = (Math.random() * 0.8 - 0.4);
                const offsetVisual = (Math.random() * 0.8 - 0.4);
                const offsetAudio = (Math.random() * 0.8 - 0.4);
                
                setAnalysisScrambleOffset({
                  overall: offsetOverall,
                  story: offsetStory,
                  acting: offsetActing,
                  visual: offsetVisual,
                  audio: offsetAudio
                });

                playPulseSound(880, 'sine', 0.15); // High success sound
                addAuditLog('Cập nhật chỉ số quang học', `CineAI hiệu biến cho: ${m.title} (Tổng quan hiệu chỉnh: ${offsetOverall > 0 ? '+' : ''}${offsetOverall.toFixed(1)})`);
              }, 1500);
            };

            const handlePublishAIApprove = () => {
              playPulseSound(523.25, 'sine', 0.1); // C5
              setTimeout(() => playPulseSound(659.25, 'sine', 0.1), 100); // E5
              setTimeout(() => playPulseSound(783.99, 'sine', 0.2), 200); // G5
              
              addAuditLog('Phê duyệt chỉ số AI', `Công bố báo cáo phê duyệt bản dịch tác phẩm: ${m.title}`);
              alert(`Hệ thống CineAI v4.2:\nTác phẩm "${m.title}" đã được duyệt điểm AI (${overallScore}/10) hoàn tất. Bản kiểm định số hóa đã được nén & đồng bộ vào Thư viện phát hành công cộng.`);
            };

            return (
              <motion.div
                key="panel-ai-analysis"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Visual Header styled like the uploaded photo */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#070707] border border-neutral-850 p-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => { playPulseSound(350, 'sine', 0.05); setActiveTab('overview'); }}
                      className="p-2 border border-neutral-800 bg-black text-neutral-400 hover:text-white hover:border-neutral-700 transition"
                      title="Quay lại Tổng quan"
                    >
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </button>
                    <div>
                      <span className="text-[8px] font-mono tracking-widest text-[#a855f7] uppercase font-black block">HẠ TẦNG KHO QUANG PHỔ COGNITIVE</span>
                      <h2 className="text-sm font-sans font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                        Chi tiết Phân tích AI Phim
                      </h2>
                    </div>
                  </div>

                  {/* Dropdown selector */}
                  <div className="flex items-center space-x-2 bg-black border border-neutral-850 px-3 py-1.5 rounded">
                    <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase shrink-0">Chọn Phim Khảo Sát:</span>
                    <select
                      value={selectedAnalysisMovieId}
                      onChange={(e) => {
                        playPulseSound(440, 'sine', 0.05);
                        setSelectedAnalysisMovieId(e.target.value);
                        setAnalysisScrambleOffset({ overall: 0, story: 0, acting: 0, visual: 0, audio: 0 });
                      }}
                      className="bg-[#0b0b0c] text-xs font-mono text-purple-400 px-2.5 py-1 outline-none border border-transparent focus:border-purple-500 rounded font-black max-w-xs transition-colors"
                    >
                      {moviesList.map(item => (
                        <option key={item.id} value={item.id}>{item.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub Metadata block */}
                <div className="border border-neutral-850 bg-gradient-to-r from-[#0d0914] to-[#04040a] p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[8.5px] font-mono font-bold border border-purple-500/20 uppercase">
                        {(m.genre && m.genre[0]) ? m.genre[0].toUpperCase() : 'CYBERPUNK'}
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-900 text-neutral-500 text-[8.5px] font-mono border border-neutral-800 uppercase font-bold">
                        {m.ageRating || 'T18'}
                      </span>
                      {m.isHot && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                      {m.isHot && <span className="text-[8.5px] font-mono text-rose-500 font-bold uppercase">Mở bán trước</span>}
                    </div>
                    <h1 className="text-2xl font-sans font-black uppercase tracking-tight text-white leading-tight">
                      {m.title}
                    </h1>
                    <p className="text-[10px] font-mono text-neutral-500">
                      TIÊU ĐỀ QUỐC TẾ: <span className="text-zinc-400 font-bold italic">{m.englishTitle || m.title}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs font-sans text-neutral-400 border-t md:border-t-0 md:border-l border-neutral-900 pt-3 md:pt-0 md:pl-6 shrink-0 w-full md:w-auto">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">Thời Lượng</span>
                      <p className="text-white font-mono font-bold mt-0.5">{m.duration || 124} Phút</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">Lịch Công Chiếu</span>
                      <p className="text-[#a855f7] font-mono font-extrabold mt-0.5">Dự kiến: {m.releaseDate || '24/12/2026'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">Quốc Gia / P.Đề</span>
                      <p className="text-white font-sans mt-0.5">Việt Nam / EN Sub</p>
                    </div>
                  </div>
                </div>

                {/* Main 12 Columns Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT PANELS COLUMN (4 COLUMNS SPAN) - AI ANALYTICS SCORE */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Panel 1: ĐIỂM SỐ AI ANALYTICS */}
                    <div className="border border-neutral-850 p-5 bg-gradient-to-b from-[#0e0a12] to-[#040407] space-y-5 rounded">
                      <div className="flex justify-between items-center border-b border-purple-950/40 pb-3">
                        <span className="text-[9px] font-mono uppercase text-[#a855f7] tracking-wider font-bold">Đánh giá cấu trúc</span>
                        <h3 className="text-xs font-sans font-black uppercase text-zinc-300">ĐIỂM SỐ AI ANALYTICS</h3>
                      </div>

                      {/* Radial Score Gauge */}
                      <div className="flex flex-col items-center justify-center py-2 relative">
                        {isReanalyzing ? (
                          <div className="h-32 w-32 flex flex-col items-center justify-center text-center">
                            <RefreshCw className="h-10 w-10 text-purple-500 animate-spin" />
                            <span className="text-[9px] font-mono text-purple-400 mt-2 animate-pulse uppercase tracking-widest">Đang tính toán tuyến tính...</span>
                          </div>
                        ) : (
                          <div className="relative h-32 w-32 flex items-center justify-center">
                            {/* SVG Gauge */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle 
                                cx="50" 
                                cy="50" 
                                r={radius} 
                                fill="transparent" 
                                stroke="#110e19" 
                                strokeWidth="6" 
                              />
                              <circle 
                                cx="50" 
                                cy="50" 
                                r={radius} 
                                fill="transparent" 
                                stroke="url(#aiGaugeGrad)" 
                                strokeWidth="6" 
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                              />
                              <defs>
                                <linearGradient id="aiGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#ec4899" />
                                  <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                              </defs>
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-[32px] font-mono font-black text-white leading-none tracking-tighter">
                                {overallScore}
                              </span>
                              <span className="text-[8px] font-serif italic text-zinc-400 mt-1 uppercase tracking-widest">TỔNG QUÁT</span>
                            </div>
                          </div>
                        )}
                        <p className="text-[9.5px] text-zinc-500 text-center font-mono mt-3">
                          • Trọng số phân tích dựa trên phản ứng nhấp nháy đồng tử mẫu thử
                        </p>
                      </div>

                      {/* Sub-ratings structure */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-[#0c0910] border border-neutral-900 px-3 py-2 rounded text-center">
                          <span className="text-[8.5px] font-mono text-neutral-500 block">CỐT TRUYỆN</span>
                          <span className="block text-xs font-mono font-black text-white mt-0.5">{storyScore} <span className="text-[9px] text-neutral-600">/10</span></span>
                        </div>
                        <div className="bg-[#0c0910] border border-neutral-900 px-3 py-2 rounded text-center">
                          <span className="text-[8.5px] font-mono text-neutral-500 block">DIỄN XUẤT</span>
                          <span className="block text-xs font-mono font-black text-white mt-0.5">{actingScore} <span className="text-[9px] text-neutral-600">/10</span></span>
                        </div>
                        <div className="bg-[#0c0910] border border-neutral-900 px-3 py-2 rounded text-center">
                          <span className="text-[8.5px] font-mono text-neutral-500 block">HÌNH ẢNH</span>
                          <span className="block text-xs font-mono font-black text-white mt-0.5">{visualScore} <span className="text-[9px] text-neutral-600">/10</span></span>
                        </div>
                        <div className="bg-[#0c0910] border border-neutral-900 px-3 py-2 rounded text-center">
                          <span className="text-[8.5px] font-mono text-neutral-500 block">ÂM THANH</span>
                          <span className="block text-xs font-mono font-black text-white mt-0.5">{audioScore} <span className="text-[9px] text-neutral-600">/10</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Panel 2: KHÁN GIẢ MỤC TIÊU */}
                    <div className="border border-neutral-850 p-5 bg-gradient-to-b from-[#0a0a0d] to-[#030305] space-y-4 rounded">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                        <h3 className="text-xs font-sans font-black uppercase text-zinc-300">KHÁN GIẢ MỤC TIÊU</h3>
                        <Users className="h-3.5 w-3.5 text-zinc-500" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-black/50 border border-neutral-900 p-3 rounded">
                          <div className="h-7 w-7 rounded bg-purple-950/30 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold font-sans text-neutral-200 block">Thành niên trẻ (18 - 35 tuổi)</span>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Mức độ lan truyền và tỷ lệ nhận thức nội dung đạt 94% thông qua các kênh số.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-black/50 border border-neutral-900 p-3 rounded">
                          <div className="h-7 w-7 rounded bg-purple-950/30 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold font-sans text-neutral-200 block">Fan thể loại khoa học giả tưởng</span>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Khảo sát yêu cầu đặc biệt cho trải nghiệm thị giác bùng nổ và âm thanh vòm Dolby.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT PANELS COLUMN (8 COLUMNS SPAN) - GRAPH AND SUMMARIES */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Panel 1: BIỂU ĐỒ CẢM XÚC (EMOTION TIMELINE) */}
                    <div className="border border-neutral-850 p-5 bg-gradient-to-b from-[#0a0a0c] to-[#030303] space-y-4 rounded">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3.5 border-b border-neutral-900 pb-3">
                        <div>
                          <span className="text-[8px] font-mono tracking-widest text-[#a855f7] uppercase font-black block">CẤU TRÚC PHẢN ỨNG TIMELINE</span>
                          <h3 className="text-xs font-sans font-black uppercase text-zinc-300">BIỂU ĐỒ CẢM XÚC (EMOTION TIMELINE)</h3>
                        </div>
                        
                        {/* Legend series Indicators */}
                        <div className="flex flex-wrap items-center gap-3 text-[9.5px] font-mono font-bold">
                          <span className="flex items-center gap-1.5 text-rose-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444]"></span> CĂNG THẲNG
                          </span>
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span> BI KỊCH / BUỒN
                          </span>
                          <span className="flex items-center gap-1.5 text-pink-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_6px_#f472b6]"></span> HÀO HƯNG
                          </span>
                        </div>
                      </div>

                      {/* Glow Curved Waveform of emotion */}
                      <div className="relative pt-2" id="motion-graph-stage">
                        {isReanalyzing ? (
                          <div className="h-44 w-full bg-black/30 flex items-center justify-center text-xs font-mono text-purple-400 uppercase tracking-widest animate-pulse">
                            [TÁI CÂN PHỔ ĐỒ THỊ NHỊP ĐỒNG ĐIỆU]
                          </div>
                        ) : (
                          <div className="relative">
                            <svg viewBox="0 0 600 160" className="w-full h-auto overflow-visible select-none">
                              {/* Horizontal guidelines */}
                              <line x1="10" y1="20" x2="590" y2="20" stroke="#161619" />
                              <line x1="10" y1="70" x2="590" y2="70" stroke="#161619" />
                              <line x1="10" y1="120" x2="590" y2="120" stroke="#161619" />
                              
                              {/* Vertical markers for minutes */}
                              {[
                                { x: 40, label: '0 Phút' },
                                { x: 180, label: '30 Phút' },
                                { x: 320, label: '60 Phút' },
                                { x: 460, label: '90 Phút' },
                                { x: 560, label: '120 Phút' }
                              ].map((mLine, i) => (
                                <g key={i}>
                                  <line x1={mLine.x} y1="0" x2={mLine.x} y2="140" stroke="#1f1f23" strokeDasharray="3,4" strokeWidth="0.8" />
                                  <text x={mLine.x} y="152" textAnchor="middle" className="text-[8.5px] font-mono fill-neutral-600 uppercase font-black">
                                    {mLine.label}
                                  </text>
                                </g>
                              ))}

                              {/* SMOOTH CURVED PATH 1: Căng thẳng (Crimson Red) */}
                              <path 
                                d="M 20 120 C 80 130, 110 30, 180 40 C 250 50, 280 130, 350 120 C 420 110, 480 20, 530 15 C 570 12, 580 80, 590 84" 
                                fill="none" 
                                stroke="#f43f5e" 
                                strokeWidth="2.5" 
                                filter="url(#glowPathRed)"
                              />
                              
                              {/* SMOOTH CURVED PATH 2: Bi kịch / Buồn (Soft Cyan) */}
                              <path 
                                d="M 20 80 C 70 40, 130 110, 190 120 C 250 130, 310 30, 370 40 C 430 50, 490 140, 550 135 C 570 133, 580 90, 590 60" 
                                fill="none" 
                                stroke="#06b6d4" 
                                strokeWidth="2.0" 
                                strokeDasharray="1.5,1.5"
                                filter="url(#glowPathBlue)"
                              />

                              {/* SMOOTH CURVED PATH 3: Hào hứng (Glow Violet/Pink) */}
                              <path 
                                d="M 20 140 C 50 100, 100 20, 160 30 C 220 40, 270 90, 330 110 C 390 130, 430 40, 480 35 C 530 30, 570 140, 590 10" 
                                fill="none" 
                                stroke="#ec4899" 
                                strokeWidth="3" 
                                filter="url(#glowPathPink)"
                              />

                              {/* Glow Filters */}
                              <defs>
                                <filter id="glowPathRed" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                                  <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                  </feMerge>
                                </filter>
                                <filter id="glowPathBlue" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                                  <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                  </feMerge>
                                </filter>
                                <filter id="glowPathPink" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="3" result="blur" />
                                  <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                  </feMerge>
                                </filter>
                              </defs>
                            </svg>

                            {/* Interactive tooltip floating element */}
                            <div className="absolute left-[70%] top-[25%] bg-black/90 text-[10px] font-mono border border-purple-500/30 p-2 text-neutral-300 pointer-events-none rounded shadow-lg">
                              <span className="text-[#a855f7] font-bold block mb-0.5">MỐC CAO TRÀO [92 PHÚT]</span>
                              <div className="space-y-0.5 text-[9.5px]">
                                <div className="text-rose-400">Căng thẳng: Khống chế 87%</div>
                                <div className="text-pink-400">Hào hứng: Tăng vọt 95%</div>
                                <div className="text-[#88959C]">Định vị: Phân cảnh đảo chiều</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Panel 2: TÓM TẮT AI */}
                    <div className="border border-neutral-850 p-5 bg-gradient-to-b from-[#0a0a0c] to-[#030303] space-y-3.5 rounded">
                      <div className="border-b border-neutral-900 pb-2 flex justify-between items-center">
                        <span className="text-xs font-sans font-black uppercase text-zinc-300">TÓM TẮT THỦ THUẬT QUANG HỌC AI</span>
                        <Sparkles className="h-3.5 w-3.5 text-[#a855f7]" />
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                        Tác phẩm <span className="font-bold text-white uppercase">"{m.title}"</span> đã được mô hình máy học kiểm định cấu trúc phân kịch. Hệ thống đánh giá cực kỳ cao cấu trúc nhịp dẫn nén chặt vào 40 phút đầu và bùng nổ xung lực căng thẳng tột độ tại mốc phút 92. Hình ảnh đạt sự hòa hợp đáng kinh ngạc trong tệp mẫu nhờ áp dụng bộ màu neon tương phản độc đáo, thúc đẩy mạnh mẽ quyết định mua sắm của thế hệ hội viên trẻ tuổi sành điện ảnh.
                      </p>
                    </div>

                    {/* Row 3: NHÃN NỘI DUNG & DANH SÁCH PHÂN CẢNH ĐẶC TRƯNG */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Sub-panel 3A: NHÃN NỘI DUNG */}
                      <div className="border border-neutral-850 p-5 bg-black space-y-3.5 rounded">
                        <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-bold">NHÃN NỘI DUNG AI CHO PHÉP CHỈ THUẬT</span>
                        
                        <div className="flex flex-wrap gap-2 pt-1">
                          {m.aiAnalysisTags ? m.aiAnalysisTags.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-1 bg-neutral-950 border border-neutral-850 hover:border-purple-500/40 text-neutral-400 text-[10.5px] font-mono tracking-wide rounded hover:bg-[#120e1a] transition duration-200"
                            >
                              #{tag.replace(/_/g, ' ')}
                            </span>
                          )) : (
                            ['Bạo_lực_nhẹ', 'Visual_Peak', 'Căng_Não', 'Cảnh_quay_đẹp'].map(tag => (
                              <span key={tag} className="px-2.5 py-1 bg-neutral-950 border border-neutral-850 text-neutral-400 text-[10.5px] font-mono rounded">
                                #{tag.replace(/_/g, ' ')}
                              </span>
                            ))
                          )}
                          <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-850 text-neutral-400 text-[10.5px] font-mono rounded">
                            #Âm thanh vòm
                          </span>
                          <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-850 text-neutral-400 text-[10.5px] font-mono rounded">
                            #Phản ứng bùng nổ
                          </span>
                        </div>
                      </div>

                      {/* Sub-panel 3B: DANH SÁCH PHÂN CẢNH ĐẶC TRƯNG */}
                      <div className="border border-neutral-850 p-5 bg-black space-y-3 rounded">
                        <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-bold">CẢNH QUAY ĐẶC TRƯNG TIÊU BIỂU</span>
                        
                        <div className="grid grid-cols-3 gap-2 pt-1" id="scenic-capture-thumbnails">
                          {[
                            { label: 'Cảnh 42', sub: 'Visual Peak', desc: 'Thị giác' },
                            { label: 'Cảnh 105', sub: 'Emotion High', desc: 'Cao trào' },
                            { label: 'Cảnh 13', sub: 'Atmospheric', desc: 'Mở màn' }
                          ].map((scn, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => {
                                playPulseSound(400 + idx * 110, 'sine', 0.05);
                                alert(`Hệ thống CineAI:\nĐang trích xuất cảnh quay đặc trưng [${scn.label}: ${scn.sub}].`);
                              }}
                              className="group cursor-pointer bg-neutral-950 border border-neutral-850 hover:border-purple-500 p-2 text-center rounded transition hover:bg-neutral-900 duration-200"
                            >
                              <div className="text-[10px] font-mono text-purple-400 font-bold tracking-tight">
                                {scn.label}
                              </div>
                              <div className="text-[8.5px] text-zinc-500 font-bold truncate mt-0.5">
                                {scn.sub}
                              </div>
                              <div className="mt-1 px-1 py-0.5 bg-neutral-900 text-neutral-400 text-[7px] font-sans font-bold uppercase rounded group-hover:bg-purple-950/40">
                                {scn.desc}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* BOTTOM COMPLIANCE FOOTER STATUS ROW */}
                <div className="border border-neutral-850 p-4 bg-black flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Phân tích hoàn tất bởi máy học độc quyền <span className="text-emerald-400 font-extrabold shadow-emerald-500">CineAI Engine v4.2 PRO</span></span>
                  </div>

                  <div className="flex items-center space-x-3.5">
                    <button
                      onClick={handleReanalyzeClick}
                      disabled={isReanalyzing}
                      className="px-4 py-2 border border-purple-500/35 bg-purple-500/10 text-purple-300 font-mono text-xs uppercase hover:bg-purple-500 hover:text-black font-extrabold transition-all duration-300 disabled:opacity-55 rounded"
                    >
                      {isReanalyzing ? 'Đang phân tích lại...' : 'Yêu cầu phân tích lại'}
                    </button>
                    <button
                      onClick={handlePublishAIApprove}
                      className="px-5 py-2 bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 text-white font-sans text-xs uppercase hover:opacity-90 font-black tracking-widest transition-all duration-300 rounded shadow-[0_0_12px_rgba(236,72,153,0.25)]"
                    >
                      Phê duyệt & Xuất bản
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })()}

        </AnimatePresence>
      </div>
    </div>
  </div>
</div>
  );
}

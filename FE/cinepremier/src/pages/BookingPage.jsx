import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, ArrowLeft, Ticket, ShoppingBag, Tag, Plus, Minus, CheckCircle, XCircle, CreditCard, QrCode, Wallet, AlertTriangle, Loader2, Printer, Check } from 'lucide-react';
import { comboItems, showdates, showtimes, halls } from '../services/cinemaData';
import { generateSeats } from '../utils/seatMap';

export default function BookingView({ movie, onBack, onConfirmBooking, showToast = () => {}, foodCatalog = [] }) {
  // Seat scroll helper ref
  const seatScrollRef = useRef(null);

  const scrollSeats = (direction) => {
    if (seatScrollRef.current) {
      const scrollAmount = 180;
      seatScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Booking states
  const concessions = foodCatalog.length > 0 ? foodCatalog : comboItems;
  const [selectedDate, setSelectedDate] = useState(showdates[0].label);
  const [selectedTime, setSelectedTime] = useState(showtimes[4]); // Defaults to 19:30
  const [selectedHall, setSelectedHall] = useState(halls[0]);

  // Generate layout seats once on date/time change
  const [seats, setSeats] = useState(() => generateSeats());
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Selected Combinations - format: { [itemIdStr]: qtyNum }
  const [selectedCombos, setSelectedCombos] = useState({});

  // Discount variables
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Current active step sub-view: 'seats' | 'combos'
  const [bookingStep, setBookingStep] = useState('seats');

  // Age confirmation check state
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Payment simulated process states: 
  // 'booking' (seat map/combos choosing)
  // 'payment_method' (payment method selection & confirm trigger)
  // 'payment_processing' (simulated loading process spinner)
  // 'payment_success' (success receipt screen layout)
  // 'payment_failed' (failed transaction alert error page)
  const [paymentState, setPaymentState] = useState('booking');
  const [paymentMethod, setPaymentMethod] = useState('momo'); // 'momo' | 'visa' | 'vietqr'
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('MINH HONG VIP');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Trigger seat selection
  const handleSelectSeat = (seat) => {
    if (seat.isBooked) return;

    const isAlreadySelected = selectedSeats.find(s => s.id === seat.id);
    
    if (isAlreadySelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 8) {
        showToast("Bạn chỉ có thể đặt tối đa 8 ghế cùng một lúc.");
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  // F&B Quantity modifier helper
  const handleModifyCombo = (id, operator) => {
    setSelectedCombos((prev) => {
      const currentQty = prev[id] || 0;
      let newQty = currentQty;

      if (operator === '+') {
        if (currentQty >= 3) {
          showToast('Mỗi vé chỉ được mua tối đa 3 phần cho một sản phẩm.');
        }
        newQty = Math.min(3, currentQty + 1);
      } else if (operator === '-') {
        newQty = Math.max(0, currentQty - 1);
      }

      const updated = { ...prev };
      if (newQty === 0) {
        delete updated[id];
      } else {
        updated[id] = newQty;
      }
      return updated;
    });
  };

  // Promo Code trigger - allows mock code "CINEAI", "IMAXVIP", "WELCOME"
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.toUpperCase().trim();

    if (code === 'CINEAI') {
      setAppliedPromo('CINEAI');
      setDiscountPercent(20);
      setPromoCode('');
    } else if (code === 'IMAXVIP') {
      setAppliedPromo('IMAXVIP');
      setDiscountPercent(30);
      setPromoCode('');
    } else if (code === 'WELCOME') {
      setAppliedPromo('WELCOME');
      setDiscountPercent(15);
      setPromoCode('');
    } else {
      showToast("Mã giảm giá không hợp lệ. Hãy thử các mã: CINEAI, IMAXVIP, WELCOME");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountPercent(0);
  };

  // Financial calculations
  const priceTickets = selectedSeats.reduce((total, seat) => total + seat.price, 0);
  
  const priceCombos = Object.entries(selectedCombos).reduce((total, [id, qty]) => {
    const item = concessions.find(item => item.id === id);
    return total + (item ? item.price * qty : 0);
  }, 0);

  const subTotal = priceTickets + priceCombos;
  const discountAmount = Math.round(subTotal * (discountPercent / 100));
  const totalAmount = Math.max(0, subTotal - discountAmount);

  // Trigger payment view delivery
  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      showToast("Vui lòng chọn ít nhất một ghế để tiếp tục đặt vé.");
      return;
    }

    if (!ageConfirmed) {
      showToast(`QUY ĐỊNH ĐỘ TUỔI TỪ CHỐI GIAO DỊCH:\nBạn vui lòng tích chọn xác nhận đủ điều kiện độ tuổi tối thiểu (${movie.ageRating}) để xem bộ phim này trước khi thực hiện thanh toán.`);
      return;
    }

    // Go to payment gateway screen step
    setPaymentState('payment_method');
  };

  const triggerSimulatePaymentSuccess = () => {
    setPaymentState('payment_processing');
    setTimeout(() => {
      setPaymentState('payment_success');
    }, 1500);
  };

  const triggerSimulatePaymentFailure = () => {
    setPaymentState('payment_processing');
    setTimeout(() => {
      setPaymentState('payment_failed');
    }, 1500);
  };

  const handleFinalSuccessSubmit = () => {
    const bookingPayload = {
      movie,
      selectedSeats,
      selectedCombos,
      showtime: selectedTime,
      date: selectedDate,
      hall: selectedHall,
      priceTickets,
      priceCombos,
      discountCode: appliedPromo || '',
      discountAmount,
      totalAmount
    };
    onConfirmBooking(bookingPayload);
  };

  const handleShowtimeChange = (time) => {
    setSelectedTime(time);
    setSeats(generateSeats());
    setSelectedSeats([]);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSeats(generateSeats());
    setSelectedSeats([]);
  };

  // If we are in any simulated payment state (payment_method, processing, success, failed),
  // we render a beautiful, responsive, fully dedicated billing gateway UI
  if (paymentState !== 'booking') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 pb-24">
        
        {/* Gateway Security Header banner */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h1 className="text-lg font-mono text-zinc-300 uppercase tracking-widest font-black flex items-center gap-2">
                CỔNG THANH TOÁN AN TOÀN • CINEPREMIER GATEWAY
              </h1>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Hệ thống mã hoá bảo mật SSL 256-bit được chứng thực</p>
            </div>
          </div>
          
          {paymentState === 'payment_method' && (
            <button
              onClick={() => setPaymentState('booking')}
              className="text-[10px] text-zinc-400 hover:text-white border border-white/10 hover:border-white px-3 py-1.5 uppercase font-mono tracking-wider transition bg-neutral-950"
            >
              ← Trở lại sơ đồ ghế
            </button>
          )}
        </div>

        {/* ⏳ SUB-VIEW: PAYMENT ONGOING PROCESSING LOADER */}
        {paymentState === 'payment_processing' && (
          <div className="border border-white/10 bg-black p-12 text-center my-12 space-y-6 max-w-xl mx-auto flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
            <div className="space-y-2">
              <h3 className="text-sm font-mono text-white tracking-widest uppercase font-black">Mã hoá & Xử lý Giao dịch...</h3>
              <p className="text-[11px] text-zinc-500 leading-normal max-w-xs mx-auto">Vui lòng không tắt trình duyệt hoặc tải lại trang trong khi hệ thống bảo mật kết nối với dịch vụ thanh toán ngân hàng.</p>
            </div>
            <div className="w-48 bg-neutral-900 h-1.5 overflow-hidden rounded-full border border-white/5 relative">
              <div className="bg-amber-500 h-full w-2/3 rounded-full absolute left-0 top-0 animate-infinite-loading"></div>
            </div>
          </div>
        )}

        {/* ❌ SUB-VIEW: PAYMENT FAILED SCREEN */}
        {paymentState === 'payment_failed' && (
          <div className="border border-red-500/20 bg-neutral-950 p-8 my-8 max-w-xl mx-auto text-center space-y-6" id="payment-failed-layout">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <XCircle className="h-10 w-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-serif italic text-red-500 uppercase tracking-wider font-bold">Thanh Toán Thất Bại</h3>
              <p className="text-[11px] text-zinc-400 max-w-sm mx-auto leading-relaxed uppercase tracking-wider">
                Giao dịch của bạn bị huỷ hoặc không thể kết nối tới tài khoản nguồn ngân hàng liên kết.
              </p>
            </div>

            <div className="bg-black border border-white/5 p-4 rounded-none text-left space-y-2">
              <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest block mb-1">CÁC LÝ DO PHỔ BIẾN:</span>
              <ul className="text-[10px] text-zinc-500 list-disc pl-4 space-y-1.5 font-sans">
                <li>Tài khoản ví điện tử hoặc số dư thẻ ngân hàng không đủ thanh toán.</li>
                <li>Xác thực mật khẩu ứng dụng OTP quá thời gian quy định (Timeout).</li>
                <li>Quá trình truyền thông bị gián đoạn giữa trình duyệt và Gateway.</li>
                <li>Thao tác từ chối giao dịch chủ động thực hiện bởi chủ tài khoản.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => setPaymentState('payment_method')}
                className="w-full bg-white text-black hover:bg-neutral-200 py-3.5 text-xs font-bold uppercase tracking-widest font-sans transition"
              >
                Thử thanh toán lại
              </button>
              <button
                onClick={() => setPaymentState('booking')}
                className="w-full border border-white/20 hover:border-white text-white hover:bg-neutral-900 py-3.5 text-xs font-bold uppercase tracking-widest font-sans transition"
              >
                Quay lại thay đổi ghế
              </button>
            </div>
          </div>
        )}

        {/* 🎉 SUB-VIEW: PAYMENT SUCCESS TICKET SCREEN */}
        {paymentState === 'payment_success' && (
          <div className="border border-emerald-500/20 bg-neutral-950/60 p-6 max-w-xl mx-auto space-y-8 relative overflow-hidden" id="payment-success-layout">
            
            {/* Direct green glow aura effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-gradient-to-b from-emerald-500/10 to-transparent blur-xl pointer-events-none" />

            <div className="text-center space-y-3 relative z-10">
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-full bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-[0.25em] text-emerald-400 uppercase font-black block">Giao Dịch Đã Khớp Hoàn Tất</span>
                <h3 className="text-lg font-serif italic text-white uppercase tracking-wider font-bold">Đặt Vé Thành Công!</h3>
              </div>
            </div>

            {/* HIGH-END SIMULATED DOTTED MOVIE TICKET RECIPT */}
            <div className="border border-white/10 bg-black relative p-6 space-y-6 rounded-sm shadow-xl">
              
              {/* Top tear-off visual semi-circles representing cinematic stub feel */}
              <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4.5 h-4.5 bg-[#080808] border-r border-white/10 rounded-full z-20"></div>
              <div className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-4.5 h-4.5 bg-[#080808] border-l border-white/10 rounded-full z-20"></div>

              {/* Movie info banner header */}
              <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="h-16 w-12 object-cover border border-white/10 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <span className="text-[8px] tracking-widest bg-red-950 text-red-400 px-1.5 py-0.5 border border-red-500/30 font-bold">{movie.ageRating}</span>
                  <h4 className="text-xs font-serif italic text-white uppercase font-black leading-tight">{movie.title}</h4>
                  <p className="text-[9.5px] text-zinc-300 font-bold truncate uppercase tracking-widest">{movie.englishTitle}</p>
                </div>
              </div>

              {/* Show detail specifications */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-[10px] uppercase tracking-wider font-mono text-zinc-400 border-b border-white/5 pb-4">
                <div>
                  <span className="text-zinc-600 block text-[8px] font-sans">PHÒNG CHIẾU / HALL:</span>
                  <span className="text-white font-bold">{selectedHall.split('(')[0]}</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[8px] font-sans">THỜI GIAN / SHOWTIME:</span>
                  <span className="text-white font-bold">{selectedTime} • {selectedDate.split(',')[0]}</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[8px] font-sans">VỊ TRÍ GHẾ / SEATS:</span>
                  <span className="text-amber-400 font-bold">{selectedSeats.map(s => s.id).join(', ')}</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[8px] font-sans">VÉ TICKET ID:</span>
                  <span className="text-white font-bold text-neutral-200">CP-MINHHONG-VIP</span>
                </div>
              </div>

              {/* Combos included details */}
              {Object.entries(selectedCombos).length > 0 && (
                <div className="text-[10px] uppercase font-sans text-zinc-400 border-b border-white/5 pb-4 space-y-2">
                  <span className="text-zinc-600 block text-[8px] tracking-widest font-mono">DỊCH VỤ ĐI KÈM / F&B CONCESSIONS:</span>
                  {Object.entries(selectedCombos).map(([id, q]) => {
                    const it = concessions.find(item => item.id === id);
                    if (!it) return null;
                    return (
                      <div key={id} className="flex justify-between text-[10px]">
                        <span className="truncate max-w-[200px] text-zinc-400 font-light">{it.name} <span className="text-white font-bold ml-1 font-mono">x{q}</span></span>
                        <span className="text-white font-mono font-medium">✔️ ĐÃ DUYỆT</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total amount paid block */}
              <div className="flex justify-between items-center bg-[#0a0a0a] p-3 border border-white/5 text-[10px]">
                <span className="font-sans text-zinc-500 tracking-widest font-bold">TỔNG TIỀN ĐÃ THANH TOÁN (PAID)</span>
                <span className="text-sm font-mono font-black text-emerald-400 tracking-tight leading-none bg-emerald-950/20 px-2.5 py-1.5 border border-emerald-500/10">
                  {totalAmount.toLocaleString()}đ
                </span>
              </div>

              {/* Stub barcode / QR representation */}
              <div className="flex flex-col items-center justify-center pt-2 space-y-2 border-t border-dashed border-white/10">
                <div className="bg-white p-2.5 inline-block">
                  {/* High quality pixel mockup of QR code using styled spans */}
                  <div className="grid grid-cols-6 gap-0.5 w-24 h-24 bg-white select-none">
                    {/* Visual QR code mockup pattern */}
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-full h-full ${
                          (i < 6 && i % 5 === 0) || 
                          (i > 30 && i % 3 === 0) || 
                          (i % 7 === 1) || 
                          (i % 11 === 0) || 
                          (i > 10 && i < 18) 
                            ? 'bg-black' 
                            : 'bg-white'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-400">TICKET_TOKEN: #CINEPREMIER_{Math.floor(100000 + Math.random()*900000)}</span>
              </div>

            </div>

            {/* Actions for success ticket screen */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleFinalSuccessSubmit}
                className="flex-1 bg-white text-black hover:bg-neutral-200 py-4 text-xs font-bold uppercase tracking-widest font-sans transition-all text-center flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Xác nhận & lưu vé
              </button>
              <button
                onClick={() => showToast('Đang khởi động kết nối máy in hóa đơn nhiệt CinePremier...\nIn thành công! Hãy lấy hóa đơn giấy tại cổng rạp trước khi vào phòng chiếu.')}
                className="border border-white/20 hover:border-white text-white hover:bg-neutral-900 py-4 px-6 text-xs font-bold uppercase tracking-widest font-sans transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4 text-zinc-400" />
                In vé giấy
              </button>
            </div>
            
          </div>
        )}

        {/* 💳 SUB-VIEW: SELECT PAYMENT METHOD VIEW */}
        {paymentState === 'payment_method' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Block: Receipt Summary */}
            <div className="lg:col-span-5 border border-white/10 bg-black p-6 space-y-5 shadow-xl">
              <span className="text-[10px] font-sans tracking-[0.2em] font-black text-amber-500 block uppercase">THÔNG TIN HOÁ ĐƠN THANH TOÁN</span>
              
              <div className="flex items-start gap-3.5 border-b border-white/5 pb-4">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="h-16 w-11 object-cover border border-white/15 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <span className="text-[8px] tracking-widest bg-red-950 text-red-400 px-1 py-0.5 border border-red-500/30 font-bold">{movie.ageRating}</span>
                  <h4 className="text-xs font-serif italic text-white uppercase font-black tracking-wider leading-tight">{movie.title}</h4>
                  <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider truncate">{movie.englishTitle}</p>
                </div>
              </div>

              {/* List booking details */}
              <div className="space-y-3.5 text-[10px] uppercase tracking-wider font-mono text-zinc-400">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Phòng chiếu:</span>
                  <span className="text-white font-bold">{selectedHall.split('(')[0]}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Ngày chiếu:</span>
                  <span className="text-white font-bold">{selectedDate.split(',')[0]}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Giờ chiếu:</span>
                  <span className="text-white font-bold">{selectedTime}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Số ghế đã chọn ({selectedSeats.length}):</span>
                  <span className="text-amber-400 font-bold">{selectedSeats.map(s => s.id).join(', ')}</span>
                </div>

                {Object.entries(selectedCombos).length > 0 && (
                  <div className="space-y-2 pt-2 text-[9px] font-sans tracking-tight text-zinc-500">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-600 block">Combo dính kèm:</span>
                    {Object.entries(selectedCombos).map(([id, q]) => {
                      const it = concessions.find(item => item.id === id);
                      if (!it) return null;
                      return (
                        <div key={id} className="flex justify-between">
                          <span className="truncate max-w-[150px]">{it.name} <span className="text-white font-bold">x{q}</span></span>
                          <span className="text-zinc-300">{(it.price * q).toLocaleString()}đ</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Financial calculations recap */}
              <div className="pt-4 border-t border-white/10 space-y-3 text-[10px] uppercase tracking-wider font-mono">
                <div className="flex justify-between text-zinc-500">
                  <span>Tiền vé ghế xem:</span>
                  <span>{priceTickets.toLocaleString()}đ</span>
                </div>
                {priceCombos > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Tiền bắp hoa nước:</span>
                    <span>{priceCombos.toLocaleString()}đ</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Mã giảm giá áp dụng:</span>
                    <span>-{discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between items-end border-t border-white/10 pt-3 text-xs">
                  <span className="text-white font-sans font-bold tracking-widest text-[10px]">TỔNG THÀNH TIỀN</span>
                  <span className="text-base font-black text-white bg-[#0e0e0e] p-2 border border-white/15">
                    {totalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>

            </div>

            {/* Right Block: Select Payment Method details & Simulators */}
            <div className="lg:col-span-7 border border-white/10 bg-neutral-950 p-6 space-y-6">
              
              <div>
                <h3 className="text-sm font-mono text-white tracking-widest uppercase font-black">PHƯƠNG THỨC THANH TOÁN</h3>
                <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Vui lòng chọn kênh thanh toán phù hợp nhất để thực hiện giao dịch của bạn.</p>
              </div>

              {/* Selector Tabs mapping */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('momo')}
                  className={`p-3 border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-pink-500/50 bg-pink-950/20 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.15)] scale-102 font-bold'
                      : 'border-white/5 bg-black text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Wallet className="h-5 w-5" />
                  <span className="text-[9px] uppercase tracking-widest font-mono">Ví MoMo Zalo</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('vietqr')}
                  className={`p-3 border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                    paymentMethod === 'vietqr'
                      ? 'border-blue-500/50 bg-blue-950/20 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)] scale-102 font-bold'
                      : 'border-white/5 bg-black text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-[9px] uppercase tracking-widest font-mono">Quét VietQR</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('visa')}
                  className={`p-3 border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                    paymentMethod === 'visa'
                      ? 'border-amber-500/50 bg-amber-950/20 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] scale-102 font-bold'
                      : 'border-white/5 bg-black text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-[9px] uppercase tracking-widest font-mono">Sử dụng Visa</span>
                </button>
              </div>

              {/* Dynamic instruction details for active paymentMethod */}
              <div className="bg-black border border-white/5 p-5 min-h-[160px] flex flex-col justify-center">
                
                {paymentMethod === 'momo' && (
                  <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                      <div className="h-10 w-10 bg-pink-950/20 border border-pink-500/30 rounded-full flex items-center justify-center text-pink-500 animate-pulse">
                        <Wallet className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="text-xs uppercase font-bold text-white font-mono tracking-wider">Thanh toán tức thì qua ví điện tử</h4>
                      <p className="text-[10px] text-zinc-500 font-sans leading-normal">
                        Mở ví điện tử MoMo hoặc ZaloPay của bạn, chọn quét mã và bắt đầu giao dịch thanh toán trực tuyến siêu bảo mật.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'vietqr' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-4 flex justify-center">
                      <div className="bg-white p-2 border border-white/10 flex items-center justify-center">
                        <div className="grid grid-cols-5 gap-0.5 w-20 h-20 bg-white">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-full h-full ${
                                (i < 5 && i % 4 === 0) || 
                                (i > 18 && i % 2 === 0) || 
                                (i % 5 === 1) || 
                                (i % 7 === 0) 
                                  ? 'bg-black' 
                                  : 'bg-white'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-8 space-y-2 text-left text-[10px] uppercase font-mono text-zinc-400">
                      <div>
                        <span className="text-zinc-600 block text-[8px] font-sans">THÔNG TIN NGÂN HÀNG:</span>
                        <span className="text-white font-bold">Techcombank - Ngân hàng Kỹ Thương</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block text-[8px] font-sans">SỐ TÀI KHOẢN TRUNG CHUYỂN:</span>
                        <span className="text-white font-bold font-mono">2026-IMAX-PREMIER-99</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block text-[8px] font-sans">SỐ TIỀN / AMOUNT:</span>
                        <span className="text-amber-400 font-bold">{totalAmount.toLocaleString()}đ</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'visa' && (
                  <div className="space-y-4">
                    {/* Simulated digital Card preview layout */}
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 p-4 relative overflow-hidden rounded-sm text-left max-w-sm mx-auto space-y-4 shadow-xl">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono tracking-widest text-zinc-500 font-bold">CINEPREMIER VIP CARD</span>
                        <CreditCard className="h-5 w-5 text-amber-500/60" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] tracking-wider text-zinc-600 block">CARD NUMBER:</span>
                        <input 
                          type="text" 
                          placeholder="4111 2222 3333 4444" 
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="bg-transparent text-white font-mono text-xs tracking-widest border-b border-transparent focus:border-white/10 w-full focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[7px] tracking-wider text-zinc-600 block">HOLDER:</span>
                          <span className="text-[10px] text-white font-mono truncate block uppercase">{cardHolder || 'MINH HONG VIP'}</span>
                        </div>
                        <div>
                          <span className="text-[7px] tracking-wider text-zinc-600 block">EXPIRY / CVV:</span>
                          <span className="text-[10px] text-white font-mono block">12 / 29 • ***</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* SIMULATED GATEWAY TEST DRIVER MODES (Beautiful Outcome selectors per feedback) */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-500 font-bold block uppercase">
                  TRÌNH CHỌN MÔ PHỎNG THANH TOÁN (SIMULATOR DRIVERS):
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <button
                    onClick={triggerSimulatePaymentSuccess}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold uppercase tracking-wider text-[11px] py-4 transition shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mô phỏng Thanh toán Thành công</span>
                  </button>

                  <button
                    onClick={triggerSimulatePaymentFailure}
                    className="w-full flex items-center justify-center space-x-2 bg-red-950/25 hover:bg-red-950/45 border border-red-500/30 text-red-400 font-sans font-bold uppercase tracking-wider text-[11px] py-4 transition"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Mô phỏng Thanh toán Thất bại</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10 pb-24">
      
      {/* Upper header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center space-x-3 mt-1">
          <button
            onClick={onBack}
            className="border border-white/20 hover:border-white bg-black hover:bg-neutral-900 text-white p-2.5 transition"
            id="booking-back-button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-serif text-white uppercase tracking-wider font-light italic">Đặt Vé Trực Tuyến</h1>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">TÁC PHẨM: {movie.title} • {movie.ageRating}</p>
          </div>
        </div>

        {/* Process progress indicators */}
        <div className="flex items-center space-x-2 text-[10px] font-sans uppercase tracking-[0.2em]">
          <button 
            onClick={() => setBookingStep('seats')}
            className={`px-3 py-1.5 transition ${bookingStep === 'seats' ? 'text-white border-b border-white font-bold' : 'text-neutral-500 hover:text-white'}`}
          >
            1. CHỖ NGỒI
          </button>
          <ChevronRight className="h-3 w-3 text-neutral-700" />
          <button 
            disabled={selectedSeats.length === 0}
            onClick={() => setBookingStep('combos')}
            className={`px-3 py-1.5 transition ${bookingStep === 'combos' ? 'text-white border-b border-white font-bold' : 'text-neutral-500 hover:text-white disabled:opacity-30'}`}
          >
            2. BẮP NƯỚC
          </button>
        </div>
      </div>

      {/* Primary columns split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Block: Seat Map or F&B selection */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Schedule options layout */}
          <div className="border border-white/10 bg-black p-5 space-y-5">
            <span className="text-[9px] font-sans tracking-[0.2em] font-bold text-neutral-400 block uppercase">CHỌN PHÒNG & THÌ GIỜ CHIẾU</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              
              {/* Dates Row */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-sans">Chọn ngày:</span>
                <div className="flex flex-wrap gap-2">
                  {showdates.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => handleDateChange(d.label)}
                      className={`px-3 py-2 text-[10px] font-sans font-bold tracking-wider uppercase border transition-all ${
                        selectedDate === d.label
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-neutral-400 border-white/10 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {d.label.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Showtimes Row */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-sans">Chọn giờ:</span>
                <div className="flex flex-wrap gap-2">
                  {showtimes.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleShowtimeChange(t)}
                      className={`px-3 py-2 text-[10px] font-mono font-bold border transition ${
                        selectedTime === t
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-neutral-400 border-white/10 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Render Step 1: SEATS SCREEN */}
          {bookingStep === 'seats' ? (
            <div className="border border-white/10 bg-black p-4 sm:p-6 space-y-8 overflow-hidden relative">
              
              {/* BACKLIGHT PROJECTION REFLECTION SHINING ONTO THE SEATS */}
              {/* Cinematic projector light cone streaming down directly towards the seat rows */}
              <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[110%] h-[100%] bg-[conic-gradient(from_150deg_at_50%_0%,transparent_0deg,rgba(255,255,255,0.15)_20deg,rgba(255,255,255,0.2)_30deg,rgba(255,255,255,0.15)_40deg,transparent_60deg)] opacity-60 pointer-events-none z-0 mix-blend-screen blur-xl animate-pulse" style={{ animationDuration: '6s' }}></div>
              {/* Radial ambient glow focused directly on the rows of seat map */}
              <div className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[90%] h-[80%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_50%,transparent_90%)] pointer-events-none z-0"></div>
              
              {/* Curved Glowing screen representer */}
              <div className="relative text-center mx-auto max-w-xl mb-6 pt-4 z-10" id="cinema-screen">
                {/* Simulated curved ambient cinema screen with realistic glow directed downwards toward seats */}
                <div className="relative h-5 w-full rounded-[50%] border-t-[4px] border-white/95 shadow-[0_18px_35px_rgba(255,255,255,0.85),0_3px_12px_rgba(255,255,255,0.45)] bg-gradient-to-b from-white/20 to-transparent"></div>
                {/* Cinematic light shine beam projection simulation shining downwards */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[92%] h-32 bg-gradient-to-b from-white/25 via-white/5 to-transparent blur-xl pointer-events-none rounded-b-xl opacity-95"></div>
                <span className="text-[10.5px] font-sans font-black uppercase tracking-[0.45em] block mt-5 text-zinc-300 animate-pulse">
                  MÀN HÌNH CHÍNH • CINEPREMIER IMAX VIP VIEW
                </span>
              </div>

              {/* Responsive Scroll and Navigation Helper */}
              <div className="flex items-center justify-center gap-2 text-[10.5px] bg-[#12121c] border border-violet-500/30 text-violet-300 font-extrabold tracking-wider px-4 py-2.5 rounded max-w-md mx-auto relative z-10 animate-pulse">
                <span className="text-sm">⇆</span>
                <span>VUỐT TRÁI / PHẢI HOẶC DÙNG MŨI TÊN ĐỂ DI CHUYỂN PHÒNG GHẾ</span>
              </div>

              {/* Seats Matrix Layout with Scroll Buttons Container */}
              <div className="relative z-10 group/seats select-none">
                
                {/* Floating Left Navigation Button */}
                <button
                  type="button"
                  onClick={() => scrollSeats('left')}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-30 bg-black/90 hover:bg-white text-white hover:text-black border border-white/20 rounded-full p-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-all cursor-pointer opacity-80 hover:opacity-100 flex items-center justify-center scale-90 sm:scale-100 active:scale-95"
                  title="Di chuyển sang trái"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Main Overflow Scroll Container */}
                <div 
                  ref={seatScrollRef}
                  className="overflow-x-auto pb-4 max-w-full scrollbar-thin scroll-smooth"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="w-max mx-auto flex flex-col items-center space-y-3.5 px-10 md:px-14 pb-2" id="seats-map-grid">
                    
                    {/* Rows Mapping */}
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((rowLetter) => {
                      const rowSeats = seats.filter(s => s.row === rowLetter);
                      const isCoupleRow = rowLetter === 'L';

                      return (
                        <div key={rowLetter} className="flex items-center space-x-5">
                          
                          {/* Left Row Label: bigger and highly legible */}
                          <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm bg-[#121212] border border-white/10 text-xs sm:text-sm font-black font-mono text-zinc-300 shrink-0">{rowLetter}</span>

                          {isCoupleRow ? (
                            // Couple row sweetbox representation
                            <div className="flex items-center space-x-5">
                              {Array.from({ length: 7 }).map((_, pairIdx) => {
                                const seat1 = rowSeats[pairIdx * 2];
                                const seat2 = rowSeats[pairIdx * 2 + 1]; if (!seat1 || !seat2) return null;
                                
                                const s1Selected = !!selectedSeats.find(s => s.id === seat1.id);
                                const s2Selected = !!selectedSeats.find(s => s.id === seat2.id);
                                const isAnySelected = s1Selected || s2Selected;

                                return (
                                  <div 
                                    key={pairIdx}
                                    className={`flex p-1 border transition-all rounded-sm ${
                                      isAnySelected 
                                        ? 'border-rose-500 bg-rose-950/30 shadow-[0_0_12px_rgba(244,63,94,0.4)] scale-105' 
                                        : 'border-rose-950 bg-[#0c0506]'
                                    }`}
                                  >
                                    {/* Left member seat with large clear sequence numbering */}
                                    <button
                                      disabled={seat1.isBooked}
                                      onClick={() => handleSelectSeat(seat1)}
                                      className={`h-9 w-9 sm:h-10.5 sm:w-10.5 text-xs sm:text-[14px] font-black font-mono flex items-center justify-center transition-all ${
                                        seat1.isBooked
                                          ? 'bg-neutral-950 text-neutral-800 cursor-not-allowed line-through border-transparent'
                                          : s1Selected
                                            ? 'bg-rose-500 text-white font-black'
                                            : 'bg-transparent text-rose-400 hover:bg-rose-950/20'
                                      }`}
                                    >
                                      {seat1.col}
                                    </button>
                                    <div className="w-[1px] bg-rose-950 h-9 sm:h-10"></div>
                                    {/* Right member seat with large clear sequence numbering */}
                                    <button
                                      disabled={seat2.isBooked}
                                      onClick={() => handleSelectSeat(seat2)}
                                      className={`h-9 w-9 sm:h-10.5 sm:w-10.5 text-xs sm:text-[14px] font-black font-mono flex items-center justify-center transition-all ${
                                        seat2.isBooked
                                          ? 'bg-neutral-950 text-neutral-800 cursor-not-allowed line-through border-transparent'
                                          : s2Selected
                                            ? 'bg-rose-500 text-white font-black'
                                            : 'bg-transparent text-rose-400 hover:bg-rose-950/20'
                                      }`}
                                    >
                                      {seat2.col}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            // Standard & VIP row with larger seat buttons
                            <div className="flex items-center space-x-2 sm:space-x-2.5">
                              {rowSeats.map((seat) => {
                                const isSelected = !!selectedSeats.find(s => s.id === seat.id);
                                const isVip = seat.type === 'vip';

                                return (
                                  <button
                                    key={seat.id}
                                    disabled={seat.isBooked}
                                    onClick={() => handleSelectSeat(seat)}
                                    className={`h-9 w-9 sm:h-10.5 sm:w-10.5 text-[11.5px] sm:text-[14.5px] font-black font-mono transition-all duration-150 rounded-none border ${
                                      seat.isBooked
                                        ? 'bg-neutral-950 border-neutral-900 text-neutral-800 cursor-not-allowed line-through'
                                        : isSelected
                                          ? 'bg-white text-black border-white font-black scale-110 shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                                          : isVip
                                            ? 'border-yellow-500/40 bg-yellow-950/30 text-yellow-400 hover:border-yellow-300 hover:bg-yellow-950/50 hover:scale-105'
                                            : 'border-white/15 bg-[#121212] text-neutral-200 hover:border-white/50 hover:text-white hover:scale-105'
                                    }`}
                                  >
                                    {seat.col}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Right Row Label: replica for easy tracking */}
                          <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm bg-[#121212] border border-white/10 text-xs sm:text-sm font-black font-mono text-zinc-300 shrink-0">{rowLetter}</span>

                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Floating Right Navigation Button */}
                <button
                  type="button"
                  onClick={() => scrollSeats('right')}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 bg-black/90 hover:bg-white text-white hover:text-black border border-white/20 rounded-full p-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-all cursor-pointer opacity-80 hover:opacity-100 flex items-center justify-center scale-90 sm:scale-100 active:scale-95"
                  title="Di chuyển sang phải"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

              </div>

              {/* Legends section */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-6 border-t border-white/5 pt-6 font-semibold text-[10px] text-neutral-400" id="seat-legends">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border border-white/10 bg-black" />
                  <span className="uppercase tracking-wider">STANDARD</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border border-neutral-400/40 bg-black text-neutral-300 flex items-center justify-center font-bold font-mono text-[8px]">VIP</div>
                  <span className="uppercase tracking-wider">VIP ({Number(145000).toLocaleString()}đ)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-10 border border-white bg-black text-[7px] text-white flex items-center justify-center font-bold tracking-widest">SWEET</div>
                  <span className="uppercase tracking-wider">SWEETBOX ({Number(280000).toLocaleString()}đ)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-white border border-white" />
                  <span className="uppercase tracking-wider text-white">ĐANG CHỌN</span>
                </div>
              </div>

              {/* Fully interactive, gorgeous gourmet inline F&B Concessions grid */}
              <div className="border border-white/10 bg-neutral-950 p-6 space-y-6" id="inline-concessions-section">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-serif italic text-white uppercase tracking-widest flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-amber-500 animate-pulse" /> THỰC ĐƠN BẮP NƯỚC CINEPREMIER
                    </h3>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Sử dụng bắp bơ thượng hạng và các vị sốt nhập khẩu. Ưu đãi đặt trước trực tuyến tiết kiệm đến 15% so với mua tại quầy.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 border border-amber-500/20 bg-amber-950/10 px-3.5 py-2 text-[10px] text-amber-400 font-mono tracking-wider font-bold">
                    <span>GIÁ TRỊ CONCESSIONS: {priceCombos.toLocaleString()}đ</span>
                  </div>
                </div>

                {/* Grid layout of actual product items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="inline-combos-grid">
                  {concessions.map((item) => {
                    const qty = selectedCombos[item.id] || 0;

                    return (
                      <div 
                        key={item.id}
                        className={`group flex flex-col justify-between border p-3.5 bg-black transition-all duration-300 ${
                          qty > 0 
                            ? 'border-amber-400/40 bg-[#0e0a05] shadow-[0_0_15px_rgba(245,158,11,0.06)]' 
                            : 'border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="space-y-3">
                          
                          {/* Rich graphic display container */}
                          <div className="h-28 w-full overflow-hidden bg-neutral-950 border border-white/5 relative">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-500 pointer-events-none"
                              referrerPolicy="no-referrer"
                            />

                            {/* Circular badge indicators */}
                            {qty > 0 && (
                              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-amber-400 text-black text-[10px] font-mono font-black flex items-center justify-center animate-bounce">
                                {qty}
                              </div>
                            )}

                            {/* Elegant tag showing concessions type */}
                            <span className="absolute bottom-2 left-2 text-[8px] font-mono tracking-widest uppercase bg-black/8 w-fit text-zinc-400 px-1.5 py-0.5 border border-white/10">
                              {item.category === 'combo' ? 'Trọn gói' : item.category === 'item' ? 'Món lẻ' : item.category === 'popcorn' ? 'Bắp ngô' : item.category === 'snack' ? 'Ăn vặt' : 'Đồ uống'}
                            </span>
                          </div>

                          {/* Concessions labels */}
                          <div className="space-y-1">
                            <span className="text-[7.5px] font-mono text-zinc-600 block tracking-widest uppercase">CINE-CONCESSION</span>
                            <h4 className="text-[11.5px] font-serif italic font-bold text-white group-hover:text-amber-300 transition-colors leading-tight line-clamp-1">{item.name}</h4>
                            <p className="text-[9px] text-[#8e8e8e] leading-snug line-clamp-2 h-7">{item.description}</p>
                          </div>

                        </div>

                        {/* Interactive operations row */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                          <span className="text-[11px] font-mono font-bold text-white group-hover:text-amber-300 transition-colors">
                            {item.price.toLocaleString()}đ
                          </span>

                          <div className="flex items-center space-x-2.5 bg-neutral-950 px-2.5 py-1.5 border border-white/10">
                            <button
                              disabled={qty === 0}
                              onClick={() => handleModifyCombo(item.id, '-')}
                              className="text-zinc-500 hover:text-white disabled:opacity-20 transition-colors"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            
                            <span className="w-3 text-center text-[10.5px] font-mono font-bold text-white">{qty}</span>
                            
                            <button
                              onClick={() => handleModifyCombo(item.id, '+')}
                              className="text-zinc-500 hover:text-amber-400 transition-colors"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          ) : (
            
            // Render Step 2: DYNAMIC COMBO ITEMS F&B LIST SCREEN
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-serif text-white uppercase flex items-center gap-2 italic">
                    <ShoppingBag className="h-4 w-4 text-white" /> CinePremier Concessions
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Bắp sấy bơ Pháp nóng giòn và thức uống ga mạnh mát lạnh sảng khoái.</p>
                </div>

                <button
                  onClick={() => setBookingStep('seats')}
                  className="border border-white/20 hover:border-white bg-black hover:bg-neutral-900 text-white text-[10px] uppercase tracking-wider px-4 py-2 transition"
                >
                  SƠ ĐỒ GHẾ
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="combos-list">
                {concessions.map((item) => {
                  const qty = selectedCombos[item.id] || 0;

                  return (
                    <div 
                      key={item.id}
                      className="group flex gap-4 border border-white/5 bg-[#0a0a0a] p-4 hover:border-white/10 transition"
                    >
                      <div className="h-20 w-20 overflow-hidden flex-shrink-0 bg-neutral-950 border border-white/5">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="text-xs font-serif italic text-white group-hover:text-zinc-300 transition-colors leading-snug">{item.name}</h4>
                          <p className="text-[10px] text-neutral-500 leading-normal line-clamp-2">{item.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-white font-mono font-bold">
                            {item.price.toLocaleString()}đ
                          </span>

                          {/* Control increase / decrease qty buttons */}
                          <div className="flex items-center space-x-3 bg-black px-2.5 py-1.5 border border-white/10">
                            <button
                              disabled={qty === 0}
                              onClick={() => handleModifyCombo(item.id, '-')}
                              className="text-neutral-500 hover:text-white disabled:opacity-20 transition"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            
                            <span className="w-4 text-center text-[11px] font-mono font-bold text-white">{qty}</span>
                            
                            <button
                              onClick={() => handleModifyCombo(item.id, '+')}
                              className="text-neutral-500 hover:text-white transition"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Right Block: Receipt Sticky Booking summary card */}
        <div className="lg:col-span-4 border border-white/10 bg-black p-6 space-y-6 shadow-2xl relative" id="booking-receipt-sidebar">
          
          <div className="flex items-start gap-4 border-b border-white/5 pb-4">
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className="h-20 w-14 object-cover flex-shrink-0 border border-white/5"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 space-y-1.5 pt-0.5">
              <span className="text-[8px] tracking-[0.1em] border border-red-500/50 bg-red-950/20 px-1.5 py-0.5 text-red-400 font-bold">{movie.ageRating}</span>
              <h3 className="text-sm font-serif italic text-white truncate uppercase">{movie.title}</h3>
              <p className="text-[9.5px] text-neutral-300 font-bold truncate leading-none uppercase tracking-widest">{movie.englishTitle}</p>
            </div>
          </div>

          {/* Ticket Information specs list */}
          <div className="space-y-3 text-[11px] uppercase tracking-wider font-sans text-neutral-400 border-b border-white/5 pb-4">
            
            <div className="flex justify-between">
              <span>Phòng chiếu:</span>
              <span className="text-white font-bold truncate max-w-[140px] text-right">{selectedHall.split('(')[0] || 'IMAX VIP 03'}</span>
            </div>

            <div className="flex justify-between">
              <span>Thì giờ:</span>
              <span className="text-white font-mono font-bold text-right">{selectedTime} • {selectedDate}</span>
            </div>

            <div className="flex justify-between items-start">
              <span>Vị trí ghế:</span>
              <span className="text-white font-mono font-bold max-w-[140px] break-words text-right text-xs">
                {selectedSeats.length > 0 
                  ? selectedSeats.map(s => s.id).join(', ') 
                  : 'Chưa chọn'
                }
              </span>
            </div>
            
            {/* Show selected combos details */}
            {Object.entries(selectedCombos).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5 text-[9px] lowercase tracking-wide text-neutral-400">
                <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-600 block font-sans">Dịch vụ đi kèm</span>
                {Object.entries(selectedCombos).map(([id, q]) => {
                  const it = concessions.find(item => item.id === id);
                  if (!it) return null;
                  return (
                    <div key={id} className="flex justify-between uppercase">
                      <span className="truncate max-w-[140px] font-sans">{it.name} <span className="text-white font-bold font-mono">x{q}</span></span>
                      <span className="text-neutral-300 font-mono">{(it.price * q).toLocaleString()}đ</span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Voucher system promo code form */}
          <div className="space-y-3">
            <span className="text-[9px] font-sans tracking-[0.2em] font-bold text-neutral-400 block uppercase">MÃ KHUYẾN MÃI CINEPREMIER</span>
            
            {appliedPromo ? (
              <div className="flex items-center justify-between border border-emerald-500/20 bg-emerald-950/20 px-3 py-2 text-[10px] text-emerald-400 tracking-wider">
                <div className="flex items-center space-x-1.5 uppercase">
                  <span>ÁP DỤNG: {appliedPromo} (-{discountPercent}%)</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-neutral-500 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Mã coupon..."
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 border border-white/10 bg-neutral-950 px-3 py-2 text-[11px] text-white tracking-wider uppercase placeholder-neutral-700 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  disabled={!promoCode.trim()}
                  className="bg-white hover:bg-neutral-200 border border-white text-black text-[10px] tracking-wider uppercase px-4 py-2 text-xs font-bold transition disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
                >
                  ÁP DỤNG
                </button>
              </form>
            )}

            <span className="text-[8px] tracking-wider text-neutral-600 block uppercase">MẸO CODE THỬ: <span className="text-white font-bold">CINEAI</span> (-20%) • <span className="text-white font-bold">IMAXVIP</span> (-30%)</span>
          </div>

          {/* Checkout receipts final value indicator */}
          <div className="space-y-3 pt-4 border-t border-white/5 text-[10px] uppercase tracking-wider font-sans text-neutral-400">
            
            <div className="flex justify-between">
              <span>Hóa đơn ghế xem:</span>
              <span className="font-mono text-zinc-300">{priceTickets.toLocaleString()}đ</span>
            </div>

            <div className="flex justify-between">
              <span>Hóa đơn bắp hoa:</span>
              <span className="font-mono text-zinc-300">{priceCombos.toLocaleString()}đ</span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Khẩu giảm coupon:</span>
                <span className="font-mono">-{discountAmount.toLocaleString()}đ</span>
              </div>
            )}

            <div className="flex justify-between items-end border-t border-white/10 pt-3">
              <span className="text-white font-sans tracking-widest text-[10px] font-bold">TỔNG CỘNG HOÁ ĐƠN</span>
              <span className="text-lg font-black text-white font-mono tracking-tight leading-none bg-[#101010] p-2 border border-white/20">
                {totalAmount.toLocaleString()}đ
              </span>
            </div>

          </div>

          {/* Age Rating Warning and Checkbox verification */}
          <div className={`p-4 border transition-all text-left space-y-3.5 ${
            ageConfirmed 
              ? 'border-emerald-500/20 bg-emerald-950/5' 
              : 'border-amber-500/30 bg-amber-950/10'
          }`}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="age-verification-checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                style={{ contentVisibility: 'auto' }}
                className="mt-1 h-4 w-4 rounded-none bg-neutral-900 border-white/20 text-amber-500 focus:ring-transparent accent-amber-500 cursor-pointer"
              />
              <label 
                htmlFor="age-verification-checkbox" 
                className="text-[10.5px] leading-relaxed text-neutral-300 font-sans cursor-pointer select-none block flex-1"
              >
                <span className="text-amber-400 font-black tracking-wider uppercase block mb-1 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block"></span>
                  XÁC NHẬN ĐỦ ĐỘ TUỔI {movie.ageRating}
                </span>
                Xác nhận tôi đã đạt từ <span className="underline text-white font-bold">{movie.ageRating === 'T18' ? '18 tuổi trở lên' : movie.ageRating === 'T16' ? '16 tuổi trở lên' : movie.ageRating === 'T13' ? '13 tuổi trở lên' : 'đủ độ tuổi quy định'}</span> ứng với phân loại phim này để vào rạp thưởng thức tác phẩm.
              </label>
            </div>
          </div>

          {/* CTA Proceed triggers */}
          <button
            onClick={handleProceedToPayment}
            className={`w-full flex items-center justify-center space-x-2 py-4 text-xs font-bold font-sans uppercase tracking-[0.2em] transition-all border ${
              selectedSeats.length === 0
                ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed opacity-30'
                : !ageConfirmed
                  ? 'bg-amber-500/10 border-amber-500/35 text-amber-500 hover:bg-amber-500 hover:text-black hover:border-amber-500'
                  : 'bg-white hover:bg-black hover:text-white border-white text-black'
            }`}
            id="proceed-payment-submit"
          >
            <Ticket className="h-4.5 w-4.5" />
            <span>
              {selectedSeats.length === 0 
                ? 'CHƯA CHỌN GHẾ' 
                : !ageConfirmed 
                  ? 'XÁC NHẬN TUỔI ĐỂ THANH TOÁN' 
                  : 'TIẾP TỤC THANH TOÁN'
              }
            </span>
          </button>

        </div>

      </div>

    </div>
  );
}

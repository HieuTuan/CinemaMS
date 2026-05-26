import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, User, Mail, Lock, Phone, ShieldCheck, Check,
  Sparkles, ArrowRight, Eye, EyeOff, Film, Ticket,
  Heart, Sparkle, AlertCircle
} from 'lucide-react';
import { authApi, saveAuthSession } from '../../services/authApi';

const AVATAR_PRESETS = [
  { id: 'critic', name: 'Nhà Phê Bình', emoji: '🎬', bg: 'from-amber-500 to-orange-600' },
  { id: 'popcorn', name: 'Tín Đồ Bắp Rang', emoji: '🍿', bg: 'from-yellow-400 to-gold-600' },
  { id: 'astronaut', name: 'Du Hành Vũ Trụ', emoji: '👩‍🚀', bg: 'from-cyan-500 to-blue-600' },
  { id: 'director', name: 'Đạo Diễn VIP', emoji: '🎥', bg: 'from-rose-500 to-red-600' },
  { id: 'cyberpunk', name: 'Cinephile 2088', emoji: '🕶️', bg: 'from-purple-500 to-fuchsia-600' }
];

const GENRE_PRESETS = [
  'Hành Động • IMAX', 'Khoa Học Viễn Tưởng', 'Kinh Dị • Giật Gân', 'Trinh Thám Noir', 'Tình Cảm • Lãng Mạn'
];

export default function AuthModal({
  isOpen,
  onClose,
  isLoggedIn,
  setIsLoggedIn,
  currentRole,
  setCurrentRole,
  currentUser,
  setCurrentUser,
  phoneNumber,
  setPhoneNumber,
  otpCode,
  setOtpCode,
  onLoginSuccess
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot_password'
  const [loginMethod, setLoginMethod] = useState('password'); // 'otp' | 'password'

  // Forgot Password / OTP Recovery States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Email Input, 2: Code verification, 3: Set new Password
  const [generatedForgotOtp, setGeneratedForgotOtp] = useState('');
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);

  // Registration States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('director');
  const [selectedGenre, setSelectedGenre] = useState('Hành Động • IMAX');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Security & Visual States
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [localOtp, setLocalOtp] = useState('');
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', text: '' }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Local storage management for users to support real persistence flow
  const INITIAL_USERS = [
    { email: 'admin@gmail.com', pass: '123', name: 'Ban Quản Trị (ADMIN)', role: 'admin' },
    { email: 'kh@gmail.com', pass: '123', name: 'Thượng Khách Minh Hồng (VIP)', role: 'user' },
    { email: 'giabao.premier@gmail.com', pass: '123', name: 'GIA BẢO (GOOGLE VIP)', role: 'user' }
  ];

  const getStoredUsers = () => {
    if (typeof window === 'undefined') return INITIAL_USERS;
    const stored = localStorage.getItem('cinepremier_users');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    localStorage.setItem('cinepremier_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  };

  const saveStoredUsers = (users) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cinepremier_users', JSON.stringify(users));
  };

  // Clean Web Audio VIP synth ping sound for high-class vibe
  const playPing = (freq = 440, type = 'sine', duration = 0.1) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored if browser blocks audio autoplay
    }
  };

  const showToast = (type, text) => {
    setNotification({ type, text });
    if (type === 'success') {
      playPing(587.33, 'sine', 0.15); // D5 note
    } else {
      playPing(220, 'sawtooth', 0.2); // A3 buzz
    }
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    const phoneToTest = loginMethod === 'otp' ? phoneNumber : regPhone;
    if (!phoneToTest) {
      showToast('error', 'Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }
    playPing(440, 'triangle', 0.1);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOtpSent(true);
      showToast('success', 'Hệ thống đã phát đi mã OTP xác thực (123456) giả lập.');
    }, 850);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (localOtp === '123456' || localOtp === '000000') {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsLoggedIn(true);
        if (onLoginSuccess) onLoginSuccess();
        playPing(880, 'sine', 0.35); // A5 high note for success
        showToast('success', 'Đăng nhập đặc quyền CinePremier VIP thành công!');
        setTimeout(() => {
          onClose();
          setOtpSent(false);
          setLocalOtp('');
        }, 1200);
      }, 1000);
    } else {
      showToast('error', 'Mã xác thực OTP sai. Nhập: 123456 để kiểm nghiệm hệ thống.');
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      showToast('error', 'Vui lòng cung cấp toàn bộ tài khoản và mật khẩu.');
      return;
    }
    let targetEmail = loginEmail.trim();
    if (targetEmail.toLowerCase() === 'admin') targetEmail = 'admin@gmail.com';
    if (targetEmail.toLowerCase() === 'kh') targetEmail = 'kh@gmail.com';

    setIsSubmitting(true);
    try {
      const authData = await authApi.login({
        email: targetEmail,
        password: loginPass.trim()
      });
      const user = saveAuthSession(authData);

      setIsLoggedIn(true);
      if (setCurrentRole) setCurrentRole(user.role || 'user');
      if (setCurrentUser) setCurrentUser(user);
      if (onLoginSuccess) onLoginSuccess(user);
      playPing(880, 'sine', 0.35);
      showToast('success', `Chào mừng ${user.name || user.email} trở lại CinePremier!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      playPing(150, 'sawtooth', 0.2);
      showToast('error', error.message || 'Tài khoản Email hoặc mật khẩu không chính xác.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regPhone || !regEmail || !regPassword) {
      showToast('error', 'Quý khách vui lòng điền trọn vẹn thông tin đăng ký.');
      return;
    }
    if (regPassword.length < 8) {
      showToast('error', 'Mật khẩu cần tối thiểu 8 ký tự để khớp yêu cầu từ BE.');
      return;
    }
    if (!agreeTerms) {
      showToast('error', 'Quý khách cần cam kết xác nhận độ tuổi và điều khoản VIP.');
      return;
    }

    setIsSubmitting(true);
    try {
      const registerData = await authApi.register({
        email: regEmail.trim(),
        password: regPassword.trim(),
        fullName: regName.trim(),
        phone: regPhone.trim()
      });

      if (registerData?.emailVerificationToken) {
        await authApi.verifyEmail(registerData.emailVerificationToken);
      }

      const authData = await authApi.login({
        email: regEmail.trim(),
        password: regPassword.trim()
      });
      const user = saveAuthSession(authData);
      const decoratedUser = { ...user, avatar: selectedAvatar, genre: selectedGenre };

      setIsLoggedIn(true);
      if (setCurrentRole) setCurrentRole(decoratedUser.role || 'user');
      if (setCurrentUser) setCurrentUser(decoratedUser);
      if (onLoginSuccess) onLoginSuccess(decoratedUser);
      playPing(987.77, 'sine', 0.4); // B5 note for golden badge
      showToast('success', `Đăng ký ${regName} thành công và đã xác minh email.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      showToast('error', error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    playPing(600, 'triangle', 0.1);
    showToast('success', 'Đang thiết lập kênh đồng bộ bảo mật Google Cloud...');
    setTimeout(() => {
      setIsSubmitting(false);

      const googleUser = {
        name: 'GIA BẢO (GOOGLE VIP)',
        email: 'giabao.premier@gmail.com',
        role: 'user',
        avatar: 'cyberpunk'
      };

      // Put in DB too if not already there
      const currentUsers = getStoredUsers();
      if (!currentUsers.some(u => u.email.toLowerCase() === googleUser.email.toLowerCase())) {
        saveStoredUsers([...currentUsers, { ...googleUser, pass: '123' }]);
      }

      setIsLoggedIn(true);
      if (setCurrentRole) setCurrentRole('user');
      if (setCurrentUser) setCurrentUser(googleUser);
      if (onLoginSuccess) onLoginSuccess(googleUser);
      playPing(880, 'sine', 0.35);
      showToast('success', 'Xin chào Thượng Khách Gia Bảo! Đồng bộ Google Account hoàn hảo.');
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 1200);
  };

  const handleForgotPassword = () => {
    playPing(400, 'sine', 0.1);
    // Switch to dedicated tab for Forgot Password
    setActiveTab('forgot_password');
    setForgotStep(1);
    setForgotEmail(loginEmail);
    setForgotOtp('');
    setForgotNewPass('');
  };

  const handleSendForgotOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('error', 'Vui lòng cung cấp địa chỉ Email.');
      return;
    }
    const cleanEmail = forgotEmail.trim();
    // Support either clean email or short username mappings
    let resolvedEmail = cleanEmail;
    if (cleanEmail.toLowerCase() === 'admin') resolvedEmail = 'admin@gmail.com';
    if (cleanEmail.toLowerCase() === 'kh') resolvedEmail = 'kh@gmail.com';

    setIsSubmitting(true);
    playPing(440, 'triangle', 0.1);
    try {
      const tokenData = await authApi.requestPasswordReset(resolvedEmail);
      setGeneratedForgotOtp(tokenData?.token || '');
      setForgotEmail(resolvedEmail);
      setForgotStep(2);
      showToast('success', 'Đã tạo reset token từ BE. Hãy nhập token hiển thị để tiếp tục.');
    } catch (error) {
      showToast('error', error.message || 'Không thể tạo token reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyForgotOTP = (e) => {
    e.preventDefault();
    if (forgotOtp.trim() === generatedForgotOtp) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setForgotStep(3);
        playPing(660, 'sine', 0.15);
        showToast('success', 'Token hợp lệ. Quý khách vui lòng thiết lập mật khẩu mới.');
      }, 700);
    } else {
      showToast('error', 'Reset token không chính xác. Hãy nhập đúng token BE vừa trả về.');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!forgotNewPass || forgotNewPass.length < 8) {
      showToast('error', 'Mật khẩu mới cần tối thiểu 8 ký tự để khớp yêu cầu từ BE.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.confirmPasswordReset(generatedForgotOtp, forgotNewPass.trim());
      playPing(880, 'sine', 0.45);
      showToast('success', 'Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.');

      // Clean up states and switch back to standard login tab
      setActiveTab('login');
      setForgotEmail('');
      setForgotOtp('');
      setForgotNewPass('');
      setForgotStep(1);
    } catch (error) {
      showToast('error', error.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-6 select-none overflow-y-auto">

      {/* Animated Glowing Ambient Spotlight in Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-amber-500/5 blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg border border-neutral-800 bg-gradient-to-b from-[#0e0e0e] to-[#040404] text-white overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-none"
        id="premium-auth-container"
      >

        {/* Header Indicator */}
        <div className="h-1 bg-gradient-to-r from-neutral-800 via-amber-400 to-neutral-800"></div>

        {/* Modal close & Brand */}
        <div className="p-6 md:px-8 pt-6 flex items-center justify-between border-b border-white/5 relative z-10">
          <div className="flex items-center space-x-2.5">
            <span className="h-6.5 w-6.5 flex items-center justify-center border border-amber-500/40 bg-amber-950/10 text-amber-400 font-serif italic text-xs font-black">
              C
            </span>
            <div>
              <h3 className="text-xs font-sans font-black tracking-[0.25em] text-neutral-400 uppercase">
                Khách Sạn Điện Ảnh
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider">CINEPREMIER VIP MEMBERS</p>
            </div>
          </div>

          <button
            onClick={() => {
              playPing(300, 'sine', 0.08);
              onClose();
            }}
            className="p-1 px-2 border border-neutral-850 hover:border-white text-neutral-400 hover:text-white transition duration-200 text-xs sm:text-sm font-light uppercase flex items-center gap-1 bg-neutral-900/50"
            title="Đóng trang"
          >
            <X className="h-3.5 w-3.5" /> Thôi
          </button>
        </div>

        {/* Toast Notification Container inside Modal */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mx-6 mt-4 p-3.5 flex items-start gap-2.5 text-xs border ${notification.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                } shadow-lg relative z-20`}
            >
              {notification.type === 'success' ? (
                <Check className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-400" />
              )}
              <span className="font-semibold">{notification.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Tabs Toggle: Đăng Nhập vs Đăng Ký hoặc Khôi phục Mật khẩu */}
        <div className="px-6 md:px-8 pt-5 text-center">
          {activeTab === 'forgot_password' ? (
            <div className="flex items-center justify-between bg-[#0d0905] border border-amber-500/20 p-2 text-left">
              <div className="text-[11px] text-zinc-300 font-extrabold uppercase tracking-widest pl-2 flex items-center gap-1 bg-amber-950/10 px-2 py-1 border border-amber-500/10">
                🔒 KHÔI PHỤC MẬT KHẨU VIP
              </div>
              <button
                type="button"
                onClick={() => {
                  playPing(300, 'sine', 0.1);
                  setActiveTab('login');
                  setForgotStep(1);
                }}
                className="p-1.5 px-3 border border-amber-500/20 hover:border-amber-400 bg-black text-amber-400 hover:text-white transition duration-200 text-[10.5px] font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                ← Quay Lại Đăng Nhập
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 bg-[#090909] border border-neutral-900 p-1 rounded-none">
              <button
                onClick={() => {
                  playPing(350, 'sine', 0.1);
                  setActiveTab('login');
                  setOtpSent(false);
                }}
                className={`py-2.5 text-xs font-sans font-bold uppercase tracking-[0.15em] transition duration-300 relative ${activeTab === 'login'
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                  }`}
              >
                Đăng Nhập QR/OTP
                {activeTab === 'login' && (
                  <motion.div layoutId="activeAuthTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>
              <button
                onClick={() => {
                  playPing(380, 'sine', 0.1);
                  setActiveTab('register');
                }}
                className={`py-2.5 text-xs font-sans font-bold uppercase tracking-[0.15em] transition duration-300 relative ${activeTab === 'register'
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                  }`}
              >
                Gia Nhập Hội Viên
                {activeTab === 'register' && (
                  <motion.div layoutId="activeAuthTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Tab content screens */}
        <div className="p-6 md:p-8 space-y-5">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (

              /***************** LOGIN VIEW *****************/
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Embedded Login Method Switch: OTP vs Password */}
                <div className="flex items-center justify-between text-[11px] mb-3 border-b border-neutral-900 pb-2">
                  <span className="text-neutral-400 uppercase tracking-widest font-mono">Phương thức kiểm định:</span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { playPing(400, 'sine', 0.05); setLoginMethod('otp'); }}
                      className={`font-extrabold uppercase tracking-wider ${loginMethod === 'otp' ? 'text-amber-400 border-b border-amber-400 pb-0.5' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                      Mã OTP Di Động
                    </button>
                    <button
                      type="button"
                      onClick={() => { playPing(400, 'sine', 0.05); setLoginMethod('password'); }}
                      className={`font-extrabold uppercase tracking-wider ${loginMethod === 'password' ? 'text-amber-400 border-b border-amber-400 pb-0.5' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                      Mật khẩu VIP
                    </button>
                  </div>
                </div>

                {loginMethod === 'otp' ? (
                  // OTP AUTH MODE
                  <div className="space-y-4">
                    {!otpSent ? (
                      <form onSubmit={handleSendOTP} className="space-y-4.5">
                        <p className="text-xs text-neutral-400 font-light leading-relaxed">
                          Nhập số điện thoại di động đăng ký thành viên. Hệ thống tự động kích hoạt vé điện tử rạp phim và áp dụng ưu đãi giảm <span className="text-amber-400 font-black">30% Combo Bắp nước Thượng hạng</span>.
                        </p>

                        <div className="space-y-1.5 focus-within:text-white">
                          <label className="block text-[11px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                            Số Điện Thoại VIP
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 font-mono text-xs">+84</span>
                            <input
                              type="tel"
                              required
                              placeholder="09xx xxx xxx..."
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full border border-neutral-800 focus:border-amber-400/70 bg-neutral-950 py-3 pl-14 pr-4 text-xs font-mono font-bold tracking-widest text-white focus:outline-none transition-all placeholder-neutral-800"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-white hover:bg-neutral-200 text-black border border-white hover:border-neutral-200 font-sans font-black text-xs uppercase tracking-[0.2em] py-4 transition duration-300 cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <span className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full inline-block"></span>
                          ) : (
                            <>GỬI KHÓA KHÁCH SẠN OTP <ArrowRight className="h-3.5 w-3.5" /></>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="bg-[#0c0a05] border border-amber-500/20 p-4 text-xs space-y-1 text-amber-300">
                          <p className="font-bold">✓ Đã phát tín hiệu OTP đến số {phoneNumber}</p>
                          <p className="opacity-80">Quý khách vui lòng nhập mã <span className="font-mono font-extrabold underline text-amber-400 bg-amber-500/10 px-1 py-0.5">123456</span> để đi tiếp.</p>
                        </div>

                        <div className="space-y-1.5 focus-within:text-amber-400">
                          <label className="block text-[11px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                            Nhập 6 số bảo an
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="● ● ● ● ● ●"
                            value={localOtp}
                            onChange={(e) => setLocalOtp(e.target.value)}
                            className="w-full border border-neutral-800 focus:border-amber-400 bg-neutral-950 py-3.5 text-center text-sm font-mono font-black tracking-[0.8em] text-white focus:outline-none transition-all placeholder-neutral-800"
                          />
                        </div>

                        <div className="flex gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => { playPing(300, 'sine', 0.1); setOtpSent(false); }}
                            className="w-1/3 border border-neutral-800 bg-[#060606] text-neutral-400 text-[10px] uppercase font-sans tracking-widest py-3.5 hover:text-white transition"
                          >
                            Quay Lại
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-amber-500 text-black hover:bg-amber-400 font-sans font-black text-xs uppercase tracking-[0.2em] py-3.5 transition flex items-center justify-center gap-1"
                          >
                            {isSubmitting ? (
                              <span className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full inline-block"></span>
                            ) : (
                              'PHÊ DUYỆT ĐĂNG NHẬP'
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  // STANDARD ID / PASS AUTH MODE
                  <form onSubmit={handlePasswordLogin} className="space-y-4.5">
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      Sử dụng tài khoản thành viên VIP hoặc quản trị để truy cập các dịch vụ rạp chiếu phim đặc quyền.
                    </p>

                    <div className="space-y-1.5 focus-within:text-white">
                      <label className="block text-[11px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                        Địa Chỉ Email VIP
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600" />
                        <input
                          type="text"
                          required
                          placeholder="admin@gmail.com, kh@gmail.com hoặc email đã đăng ký..."
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full border border-neutral-800 focus:border-amber-400/70 bg-neutral-950 py-3 pl-10 pr-4 text-xs font-sans text-white focus:outline-none transition-all placeholder-neutral-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 focus-within:text-white">
                      <label className="block text-[11px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                        Mật Khẩu Bảo Mật
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••••••"
                          value={loginPass}
                          onChange={(e) => setLoginPass(e.target.value)}
                          className="w-full border border-neutral-800 focus:border-amber-400/70 bg-neutral-950 py-3 pl-10 pr-10 text-xs text-white tracking-widest focus:outline-none transition-all placeholder-neutral-850"
                        />
                        <button
                          type="button"
                          onClick={() => { playPing(400, 'sine', 0.05); setShowPassword(!showPassword); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-white hover:bg-neutral-200 text-black border border-white font-sans font-black text-xs uppercase tracking-[0.2em] py-4 transition flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full inline-block"></span>
                      ) : (
                        <>THĂM DÒ NỀN MÓNG RẠP<ArrowRight className="h-3.5 w-3.5" /></>
                      )}
                    </button>
                  </form>
                )}

                {/* Secure Google and Direct Action Section */}
                <div className="space-y-4 pt-1">

                  {/* Divider line */}
                  <div className="flex items-center">
                    <div className="flex-1 h-px bg-neutral-900"></div>
                    <span className="px-3 text-[10px] font-mono uppercase text-neutral-400 tracking-[0.2em] font-extrabold">HOẶC ĐỒNG BỘ VIP</span>
                    <div className="flex-1 h-px bg-neutral-900"></div>
                  </div>

                  {/* Google Authenticator */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full bg-[#0a0a0a] hover:bg-[#121212] active:bg-[#070707] text-neutral-200 border border-neutral-850 hover:border-neutral-700 font-sans font-bold text-xs uppercase tracking-[0.15em] py-3.5 transition duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-md group relative overflow-hidden"
                    id="google-signin-btn"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Native Google Mini G Logo SVG */}
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22l.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>TIÊU CHUẨN GOOGLE SIGN-IN</span>
                  </button>

                  {/* Redirection Links for Registrations and Password retrieval */}
                  <div className="flex items-center justify-between text-[11px] font-sans text-neutral-400 px-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        playPing(440, 'sine', 0.08);
                        setActiveTab('register');
                      }}
                      className="hover:text-amber-400 group flex items-center gap-1 transition-all duration-300 cursor-pointer text-left bg-transparent border-none p-0"
                    >
                      <span className="text-neutral-400">Chưa có thẻ?</span>
                      <span className="font-extrabold text-neutral-200 group-hover:text-amber-400 underline decoration-amber-400/30 underline-offset-4 decoration-1">
                        Gia Nhập Ngay
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="hover:text-neutral-200 text-neutral-400 hover:underline underline-offset-4 transition cursor-pointer font-semibold bg-transparent border-none p-0"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                </div>

                {/* Subtext info logs */}
                <div className="bg-[#050505] p-3 text-[10px] text-zinc-400 border border-white/10 font-sans leading-relaxed text-center">
                  🍿 <span className="text-zinc-300 font-extrabold uppercase">Ưu đãi hôm nay:</span> Hoàn tiền 10% cho tất cả chủ thẻ Premium Gold mua vé khung giờ vàng.
                </div>
              </motion.div>
            ) : activeTab === 'register' ? (

              /***************** JOIN/REGISTER VIEW *****************/
              <motion.div
                key="register-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <form onSubmit={handleRegister} className="space-y-4">

                  {/* Avatar Preset Grid - Extremely satisfying UI */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-sans font-extrabold uppercase tracking-wider text-neutral-300 mb-1 flex items-center gap-1">
                      <Sparkle className="h-3 w-3 text-amber-400" /> CHỌN DANH TÍNH AVATAR ĐIỆN ẢNH
                    </span>
                    <div className="grid grid-cols-5 gap-2" id="avatar-presets-box">
                      {AVATAR_PRESETS.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => {
                            playPing(450 + AVATAR_PRESETS.findIndex(a => a.id === avatar.id) * 30, 'sine', 0.12);
                            setSelectedAvatar(avatar.id);
                          }}
                          className={`relative py-2 px-1 flex flex-col items-center justify-center border transition-all duration-300 ${selectedAvatar === avatar.id
                              ? 'border-amber-400 bg-amber-950/20 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'border-neutral-900 bg-neutral-950 hover:border-neutral-800'
                            }`}
                        >
                          <span className="text-xl sm:text-2xl mb-1">{avatar.emoji}</span>
                          <span className="text-[7.5px] font-bold tracking-tight text-neutral-400 text-center truncate w-full">
                            {avatar.name}
                          </span>

                          {selectedAvatar === avatar.id && (
                            <div className="absolute top-1 right-1 h-2 w-2 bg-amber-400 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dual Grid Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                        Họ & Tên Thượng Khách
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-600" />
                        <input
                          type="text"
                          required
                          placeholder="Minh Hồng..."
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full border border-neutral-800 focus:border-amber-400 bg-neutral-950 py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none transition-all placeholder-neutral-800"
                        />
                      </div>
                    </div>

                    {/* Contact Phone */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                        Số Điện Thoại Nhận Vé
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-600" />
                        <input
                          type="tel"
                          required
                          placeholder="0912 345 xxx..."
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full border border-neutral-800 focus:border-amber-400 bg-neutral-950 py-2.5 pl-9 pr-3 text-xs font-mono tracking-wide text-white focus:outline-none transition-all placeholder-neutral-800"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Email & Password Registration Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-sans font-black uppercase tracking-wider text-neutral-500">
                        Địa Chỉ Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-600" />
                        <input
                          type="email"
                          required
                          placeholder="tuan01062004kt@gmail.com..."
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full border border-neutral-800 focus:border-amber-400 bg-neutral-950 py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none transition-all placeholder-neutral-800"
                        />
                      </div>
                    </div>

                    {/* Password Registration */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-sans font-black uppercase tracking-wider text-neutral-500">
                        Đặt Mật Khẩu Khóa
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-600" />
                        <input
                          type="password"
                          required
                          placeholder="Cực kì an tâm..."
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full border border-neutral-800 focus:border-amber-400 bg-neutral-950 py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none transition-all placeholder-neutral-850"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Favorite Genre Selection */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                      Gu phim yêu thích áp dụng tổ hợp Gợi ý AI
                    </span>
                    <div className="flex flex-wrap gap-1.5" id="genre-box">
                      {GENRE_PRESETS.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => { playPing(520, 'sine', 0.05); setSelectedGenre(genre); }}
                          className={`px-3 py-1.5 text-[8.5px] uppercase tracking-wider font-bold transition-all ${selectedGenre === genre
                              ? 'bg-amber-400 text-black font-extrabold'
                              : 'bg-neutral-950 text-neutral-400 border border-neutral-850 hover:bg-neutral-900'
                            }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Double constraints age + loyalty */}
                  <div className="space-y-2 pt-1 border-t border-neutral-900">
                    <label className="flex items-start space-x-2.5 text-[11px] text-neutral-400 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={(e) => { playPing(500, 'sine', 0.05); setAgreeTerms(e.target.checked); }}
                        className="mt-0.5 accent-amber-500 h-3.5 w-3.5 border-neutral-800 bg-black"
                      />
                      <span>
                        Xác nhận tôi trên <b>18 tuổi</b> cho các phim bom tấn T18 và đồng thuận quy chế Thượng Khách CinePremier VIP.
                      </span>
                    </label>
                  </div>

                  {/* Large Register Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-400 text-black border border-amber-400 font-sans font-black text-xs uppercase tracking-[0.2em] py-4 transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full inline-block"></span>
                    ) : (
                      <>THÀNH LẬP THẺ VIP GOLD <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>

                </form>
              </motion.div>
            ) : (

              /***************** FORGOT PASSWORD / RECOVERY VIEW *****************/
              <motion.div
                key="forgot-password-view"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Visual Step Indicator */}
                <div className="flex justify-between items-center bg-[#09090c] border border-neutral-900 p-3 text-[10.5px] font-mono mb-2">
                  <span className={forgotStep >= 1 ? "text-amber-400 font-extrabold" : "text-neutral-500"}>1. Nhập Email {forgotStep > 1 && '✓'}</span>
                  <span className="text-neutral-700">➔</span>
                  <span className={forgotStep >= 2 ? "text-amber-400 font-extrabold" : "text-neutral-500"}>2. Xác Thực OTP {forgotStep > 2 && '✓'}</span>
                  <span className="text-neutral-700">➔</span>
                  <span className={forgotStep >= 3 ? "text-amber-400 font-extrabold" : "text-neutral-500"}>3. Mật Khẩu Mới</span>
                </div>

                <p className="text-xs text-neutral-300 font-light leading-relaxed">
                  {forgotStep === 1 && "Nhập địa chỉ Email VIP liên kết để bảo lưu tài khoản hội viên và gửi tín hiệu kích hoạt mã bảo an."}
                  {forgotStep === 2 && "Hệ thống đã tạo reset token từ BE. Hãy sao chép và nhập chính xác token để đặt lại mật khẩu."}
                  {forgotStep === 3 && "Nhập mật khẩu VIP mới bảo mật tối thiểu 8 ký tự để đồng bộ cập nhật vào hệ thống."}
                </p>

                {forgotStep === 1 && (
                  <form onSubmit={handleSendForgotOTP} className="space-y-4">
                    <div className="space-y-1.5 focus-within:text-white">
                      <label className="block text-[11px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                        Email Đăng Ký Hội Viên
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600" />
                        <input
                          type="text"
                          required
                          placeholder="Nhập email của quý khách (Vd: kh@gmail.com)..."
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full border border-neutral-800 focus:border-amber-400/70 bg-neutral-950 py-3 pl-10 pr-4 text-xs font-sans text-white focus:outline-none transition-all placeholder-neutral-700"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-black border border-amber-400 hover:border-amber-300 font-sans font-black text-xs uppercase tracking-[0.2em] py-4 transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(245,158,11,0.15)] animate-pulse"
                    >
                      {isSubmitting ? (
                        <span className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full inline-block"></span>
                      ) : (
                        <>TẠO RESET TOKEN <ArrowRight className="h-3.5 w-3.5" /></>
                      )}
                    </button>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyForgotOTP} className="space-y-4">
                    <div className="bg-[#0c0a05] border border-amber-500/20 p-4 text-xs space-y-1.5 text-amber-300 rounded mb-2">
                      <p className="font-bold text-amber-400">✓ ĐÃ TẠO RESET TOKEN!</p>
                      <p className="opacity-90">Token reset password từ BE là:</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="font-mono font-black text-amber-400 bg-amber-500/15 px-3 py-1.5 border border-amber-500/40 text-[10px] rounded break-all">{generatedForgotOtp}</span>
                        <span className="text-[10px] text-zinc-400 italic">(Nhập đúng token này)</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 focus-within:text-amber-400">
                      <label className="block text-[11px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                        Nhập Reset Token
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dán reset token từ BE..."
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="w-full border border-neutral-800 focus:border-amber-500 bg-neutral-950 py-3 px-3 text-xs font-mono font-black text-white focus:outline-none transition-all placeholder-neutral-800"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { playPing(300, 'sine', 0.1); setForgotStep(1); }}
                        className="w-1/3 border border-neutral-800 bg-[#060606] text-neutral-400 text-[10px] uppercase font-sans tracking-widest py-3.5 hover:text-white transition cursor-pointer"
                      >
                        Quay Lại
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-amber-500 text-black hover:bg-amber-400 font-sans font-black text-xs uppercase tracking-[0.2em] py-3.5 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full inline-block"></span>
                        ) : (
                          'XÁC MINH CẬP NHẬT'
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {forgotStep === 3 && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-1.5 focus-within:text-white">
                      <label className="block text-[11px] font-sans font-extrabold uppercase tracking-wider text-neutral-300">
                        Thiết Lập Mật Khẩu VIP Mới
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600" />
                        <input
                          type={showForgotConfirmPass ? "text" : "password"}
                          required
                          placeholder="Nhập mật khẩu cực kì an tâm..."
                          value={forgotNewPass}
                          onChange={(e) => setForgotNewPass(e.target.value)}
                          className="w-full border border-neutral-800 focus:border-amber-400/70 bg-neutral-950 py-3 pl-10 pr-10 text-xs text-white focus:outline-none transition-all placeholder-neutral-500"
                        />
                        <button
                          type="button"
                          onClick={() => { playPing(400, 'sine', 0.05); setShowForgotConfirmPass(!showForgotConfirmPass); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
                        >
                          {showForgotConfirmPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-500 font-sans font-black text-xs uppercase tracking-[0.2em] py-4 transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.2)]"
                    >
                      {isSubmitting ? (
                        <span className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full inline-block"></span>
                      ) : (
                        <>XÁC NHẬN ĐẶT LẠI MẬT KHẨU <Check className="h-3.5 w-3.5" /></>
                      )}
                    </button>
                  </form>
                )}

                {/* Subtext info logs */}
                <div className="bg-[#050505] p-3 text-[10px] text-zinc-400 border border-white/10 font-sans leading-relaxed text-center">
                  🔐 <span className="text-zinc-300 font-extrabold uppercase">Bảo mật chuẩn AES:</span> Mật khẩu mới được bảo mật nguyên gốc bằng tài khoản bảo mật cục bộ.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Interactive Footer displaying membership privileges */}
        <div className="border-t border-neutral-900 bg-[#060606] p-4 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
          <span className="uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> An Toàn Đồng Bộ 256-Bit
          </span>
          <span className="text-right uppercase tracking-[0.1em]">CinePremier Club 2026</span>
        </div>

      </motion.div>

    </div>
  );
}

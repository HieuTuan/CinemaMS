import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-white/10 bg-black text-neutral-500 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          
          {/* Column 1: Info and Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="border border-white/30 h-8 w-8 flex items-center justify-center text-white font-serif italic text-base tracking-widest bg-black">
                C
              </div>
              <span className="font-serif tracking-[0.25em] text-sm uppercase text-white">
                Cine<span className="font-serif italic font-light text-neutral-400">Premier</span>
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500 font-sans font-light">
              Trải nghiệm chiếu bóng chuẩn mực, tích hợp tối tân bộ đánh giá xung động cảm tính AI Rating cùng hệ thống phòng chiếu IMAX tinh thuần bộc phát từng sát-na giác cảm.
            </p>
          </div>

          {/* Column 2: Quick navigation */}
          <div>
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white mb-4">DANH MỤC CHIẾU BÓNG</h3>
            <ul className="space-y-2 text-[10px] uppercase tracking-wider font-sans">
              <li><span className="hover:text-white cursor-pointer transition-colors duration-250">Phim Đang Chiếu</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors duration-250">Phim Sắp Chiếu</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors duration-250">Phòng Chiếu IMAX VIP</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors duration-250">Lịch Chiếu Toàn Quốc</span></li>
            </ul>
          </div>

          {/* Column 3: Policy & Support */}
          <div>
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white mb-4">HỖ TRỢ & ĐIỀU CHẾ</h3>
            <ul className="space-y-2 text-[10px] uppercase tracking-wider font-sans">
              <li><span className="hover:text-white cursor-pointer transition-colors duration-250">Liên hệ phòng vé</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors duration-250">Chính sách bảo mật</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors duration-250">Điều hành sử dụng vé</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors duration-250">Quy chuẩn hoạt động</span></li>
            </ul>
          </div>

          {/* Column 4: Newsletter sign-up */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white">THƯ CHIÊU ĐÃI VIP</h3>
            <p className="text-[11px] text-neutral-500 font-sans font-light leading-relaxed">Nhập email để nhận thư thông cáo về điện ảnh độc sắc và các đặc quyền voucher rạp mật.</p>
            
            {subscribed ? (
              <div className="border border-white/20 bg-neutral-950 p-3 text-[10px] uppercase tracking-wider text-white">
                ✓ Thiết lập đăng ký thành công.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex max-w-sm items-center">
                <input
                  type="email"
                  required
                  placeholder="EMAIL CỦA BẠN..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-white/10 bg-[#0A0A0A] py-2.5 pl-3 pr-10 text-[10px] tracking-wider text-white uppercase placeholder-neutral-700 focus:border-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bg-white text-black hover:bg-neutral-200 p-1.5 transition duration-250"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom copyright barrier */}
        <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-[9px] uppercase tracking-[0.15em] text-neutral-600">
          <p>© 2026 CINEPREMIER STUDIOS. ALL RIGHTS RESERVED.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <span>Powered by Smart AI Rating Engine</span>
            <span>•</span>
            <span>Thế Điện Ảnh Tinh Hoa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

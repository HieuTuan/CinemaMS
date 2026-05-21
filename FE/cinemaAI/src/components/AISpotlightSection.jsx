export default function AISpotlightSection() {
  return (
    <section className="py-24 bg-surface-container-lowest relative overflow-hidden">
      {/* Background AI image – right side */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
        <div className="absolute inset-0 bg-gradient-to-l from-surface-container-lowest to-transparent z-10" />
        <img
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnLEU035MERSzCkLsgsmzMSCvuAEZTEGe9BZw5XeEfqIH5D7ctAdzgZgc2QueNK94vUntYkfcMWMtoq6ziwJgXeVevk1F3QxCvSKGlEQaK1cPs3rA5k25yjUxPLJobGCTUYBG9TUP4XbdCzVqUHGAvaYaTfilcXpofS1f4zja1xuicq0HmEd0LAX-2TX36aSdhEbhkp5br555ZJ-l6qYotT2vMY-GpPxW6mGS0MnFHaLy6bKHeUYTcag7-mSBJkUyxHPezBWeNJh8A"
          alt="AI analysis"
        />
      </div>

      {/* Content */}
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-20">
        <div className="max-w-xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-secondary text-headline-xl">smart_toy</span>
            <h2 className="font-display-lg text-headline-xl text-gradient">PHIM NỔI BẬT AI</h2>
          </div>

          <p className="font-body-lg text-body-lg text-on-surface mb-8">
            Công nghệ AI của CINEPREMIER phân tích hàng triệu phản hồi để gợi ý những tác phẩm chạm
            đến cảm xúc sâu sắc nhất của bạn.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-10">
            {['#Gợi_Cảm_Hứng', '#Đỉnh_Cao_Thị_Giác', '#Căng_Não', '#Kiệt_Tác_Hành_Động'].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-surface-container rounded-full border border-white/5 font-label-sm text-label-sm text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Featured movie card */}
          <div className="glass-card p-6 rounded-2xl flex items-center gap-6 group cursor-pointer border-l-4 border-l-primary-container">
            <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwznVFPy7IeYqzdGDGkDfUBrTx0JBFGNhqCwNStyrJurpIo_B9seQSI-hdFVCP3SJo_9EiIMHLWP-OCoQdnfhapkYuWo3ZAJ-uRZe2AN_ZIi-HZ2hoHBC4riTT_6Xad79hkJQiSTBlzl6ovucL7vCBFhAh-ARQdsrnR37PJK4No5SeDy8J0vugDSjDpfNUftQRQUuEqowuz20Or0M7blOQHc_wqt7m8c_-magJpmvWOgK2dABCnMDDJzJoaMUkBQTUdjM7ZRy1wTLF"
                alt="Interstellar Horizons"
              />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-primary-container text-xs font-bold uppercase tracking-widest">
                  Đề cử từ AI
                </span>
                <span className="bg-secondary-container/20 text-secondary text-[10px] px-2 py-0.5 rounded">
                  99% MATCH
                </span>
              </div>
              <h4 className="font-headline-lg text-on-surface mb-2">Interstellar Horizons</h4>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                Khám phá giới hạn của tình yêu và thời gian trong một kiệt tác viễn tưởng đầy cảm xúc.
              </p>
            </div>
            <span className="material-symbols-outlined text-primary-container group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0">
              play_circle
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

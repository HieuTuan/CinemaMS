export default function HeroSection() {
  return (
    <section className="relative w-full h-[819px] min-h-[600px] flex items-end pb-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover animate-float"
          style={{ animationDuration: '20s' }}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8I1z3sYsNAYU7Z_FAfSquIH7RVwHEC3B0GNEQZf_bE_lokgLIPcukkkMDf9gOueiBI8DIC_MinfnCLrJccN8AtrEQiDKcLvlDqfp8kurSF_AthkbYoIwK188-dnZ-Jm5BGUOK24ceSeK1JSFsYs3MvDsX8HrgHXTRgJ9yVZEsD-ZJLmdh-H8P6LqasQ81eO8qOxG_yKh1CwME22YnQtYJ40x4YOJBQ6S7Bvf1xhMResTL2sCzKRQG956P6DlKjs_6-5OUr1A_A7QV"
          alt="Hero background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="particles-bg" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-margin-desktop max-w-container-max mx-auto md:px-margin-mobile">
        <div className="max-w-2xl opacity-0 animate-fade-in-up">
          <span className="inline-block bg-secondary-container/30 text-white font-label-sm text-label-sm px-3 py-1 rounded-full border border-white/10 mb-4 backdrop-blur-md hover:bg-secondary-container/50 transition-colors duration-300 cursor-default">
            KHỞI CHIẾU ĐỘC QUYỀN
          </span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-4 drop-shadow-2xl">
            NEON HORIZON
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface/80 mb-8 line-clamp-3 opacity-0 animate-fade-in-up stagger-1">
            Trong một tương lai rực rỡ nhưng đầy bóng tối, một đặc vụ phải đối mặt với những bí mật
            bị chôn vùi dưới lòng thành phố ánh sáng. Trải nghiệm điện ảnh đỉnh cao chỉ có tại
            CinePremier.
          </p>
          <div className="flex space-x-4 opacity-0 animate-fade-in-up stagger-2">
            <button
              className="bg-gradient-to-r from-primary-container to-secondary-container text-white px-8 py-3 rounded-lg font-headline-lg text-headline-lg hover:chroma-shadow-primary transition-all duration-300 flex items-center hover:scale-105 active:scale-95"
              onClick={() => (window.location.href = '/booking')}
            >
              <span
                className="material-symbols-outlined mr-2"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
              ĐẶT VÉ NGAY
            </button>
            <button
              className="glass-panel text-white px-8 py-3 rounded-lg font-headline-lg text-headline-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center hover:scale-105 active:scale-95"
              onClick={() => (window.location.href = '/movies/1')}
            >
              <span className="material-symbols-outlined mr-2">info</span>
              CHI TIẾT
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

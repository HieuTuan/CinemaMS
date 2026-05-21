export default function HeroSection() {
  return (
    <section className="relative h-[870px] w-full overflow-hidden flex items-end pb-32">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent z-10" />
        <img
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvkNj6vsun946r7ZwXfRpCw7HkVrPa0K8uQR4Jk4LnuKOcy_r80BvioExaIju_GSVxRz3v7DDK6CBpXzOCdGvkmqlJGiyQsVk7VuA195GvQmqC_86JDdAQ04CJqzxrxvQd0szSHemWBVHAW42yowznqJWRicpVZ8WG9PIE-vquEBH2y5wXuZ65qoNQFmlgbSxje3aRqqd-hVAxu5FkLaEMTpj8GTYevSf2G8mMLNxoxgmM-rI_qtbxfyY1vJ3JpYzama14LKg6ccp-"
          alt="Hero background – Neon Horizon"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="max-w-2xl animate-float">
          <span className="inline-block px-4 py-1 rounded-full bg-primary-container/20 border border-primary-container/40 text-primary-container font-semibold mb-6 font-label-sm text-label-sm uppercase tracking-widest">
            Bom tấn cuối tuần
          </span>
          <h1 className="font-display-lg text-display-lg mb-4 text-on-surface leading-none drop-shadow-lg">
            NEON HORIZON
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
            Hành trình xuyên qua chiều không gian thứ tư của một thám tử tư lai máy móc. Khi ranh giới
            giữa con người và thuật toán bị xóa nhòa, ai sẽ là người định đoạt tương lai?
          </p>
          <div className="flex gap-4">
            <button className="primary-gradient px-8 py-4 rounded-xl font-headline-lg text-on-primary-container flex items-center gap-3 hover:shadow-[0_0_25px_rgba(229,9,20,0.5)] transition-all duration-300">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                confirmation_number
              </span>
              Đặt Vé Ngay
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-xl font-headline-lg text-on-surface hover:bg-white/20 transition-all duration-300">
              Chi Tiết
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

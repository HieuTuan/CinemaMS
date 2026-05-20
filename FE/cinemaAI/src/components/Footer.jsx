const LINKS = ['Privacy Policy', 'Terms of Service', 'Careers', 'Press Kit', 'Contact Us']

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest text-primary font-body-md text-body-md w-full py-16 border-t border-white/5 opacity-80 hover:opacity-100 transition-opacity duration-300 mt-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop max-w-container-max mx-auto md:px-margin-mobile">
        {/* Brand */}
        <div className="col-span-1 mb-8 md:mb-0">
          <div
            className="font-display-lg text-headline-lg text-primary mb-4 animate-shimmer bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            style={{ backgroundSize: '200% auto' }}
          >
            CINEPREMIER
          </div>
          <p className="text-on-surface-variant text-sm pr-4">
            Trải nghiệm điện ảnh đỉnh cao với hệ thống rạp chiếu phim hiện đại bậc nhất. Mang thế
            giới điện ảnh đến gần bạn hơn.
          </p>
        </div>

        {/* Links */}
        <div className="col-span-1 md:col-span-2 flex flex-wrap gap-x-8 gap-y-4">
          {LINKS.map((link) => (
            <a
              key={link}
              className="text-on-surface-variant hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all duration-300 hover:translate-x-1 inline-block"
              href="#"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Language + copyright */}
        <div className="col-span-1 flex flex-col items-start md:items-end justify-between mt-8 md:mt-0">
          <div className="flex space-x-4 mb-4">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors duration-300 hover:rotate-90">
              language
            </span>
            <span className="text-on-surface-variant">Tiếng Việt</span>
          </div>
          <div className="text-on-surface-variant text-xs">
            © 2024 CINEPREMIER STUDIOS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  )
}

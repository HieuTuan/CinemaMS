import { useState } from 'react'
import { isWishlisted, toggleWishlist } from '../utils/wishlist'

const UPCOMING = [
  {
    id:           201,
    title:        "The Dragon's Wake",
    releaseLabel: 'RA MẮT 25.12',
    genres:       ['Hành Động', 'Kỳ Ảo'],
    imageUrl:     'https://lh3.googleusercontent.com/aida-public/AB6AXuB303-D3BtsidUwMK0XE5fgWv-VB-F1fJfEKV42Y5HMua8TZlg5_zVSJDbn_Ls9IMTQYWyDv8n9-sFBfdxQN1BUlDt_3vWFMG2AB20ku9048rpzSdkv6r142UV16r0plg96Mn08uazAGrO_IOGgkvIXNkzIL6jh-0xoM5spQ9LZkw2LgG4U2limBevUehtftl9N9RiM39h1rBj-4Of-FPae3HmJ1DX9xARslcOFb0C5glXB7ADefpPqbOzlwdt601XyQ7mkwAqdZjDe',
  },
  {
    id:           202,
    title:        'Midnight Melodies',
    releaseLabel: 'RA MẮT 10.01',
    genres:       ['Âm Nhạc', 'Lãng Mạn'],
    imageUrl:     'https://lh3.googleusercontent.com/aida-public/AB6AXuC7NLCGlI3kfOF0zzfnRxitAI5hWnoSIlmD_HZ-Uf7-Df17RZPp3ZpDBqRYLru9ASwp_TGms4ZrU3NK9DMr-737C_EIMP894kSaJgAPlcVzKiPx7PG-AWshOQ-aj4R-cg6Tz7AwFp7UUQ6LLVKR0HQZNU3AuFo_-WF5ds-o04apwip26Hrik5r1gy8qm7Rnk76hSRTuUxmyAVdvNXysEq44cvrm1Yeo9zVTngyp2ycRVNCIVPIfVSbClPsze3_T1-3FY5pDz0Vd-Arg',
  },
  {
    id:           203,
    title:        'Code: Genesis',
    releaseLabel: 'RA MẮT 15.01',
    genres:       ['Khoa Học Viễn Tưởng', 'Hành Động'],
    imageUrl:     'https://lh3.googleusercontent.com/aida-public/AB6AXuCNoz70XWK-4zGrni8R81ukEFcc8yjtDmvqxBQK1UczEmPmRrPiCFo5DDmZDjSa1evnUDIW1R_u4_pwfoP1NGwLyE43902y6RIllluE_VvRxzeoAPOiKKMpCGtT3IRVMDzckoNYHdyPPCCPaAPayGvXUhBBCgsXej2iXO_PNoHcCd-4BbJiKmRKSBKhu7B32jfSzSueNNl006K4GGWA4eXS4FL9P5P740jD8XzPhpka9Mf-sxbkdZeMfB8X-hKBStF301d28KwfKGdV',
  },
]

// Export for WishlistPage to look up coming-soon movies by id
export { UPCOMING as UPCOMING_MOVIES }

function HeartBtn({ movie }) {
  const [liked, setLiked] = useState(() => isWishlisted(movie.id))

  function handleClick(e) {
    e.stopPropagation()
    toggleWishlist({ ...movie, posterUrl: movie.imageUrl, status: 'coming_soon' })
    setLiked(p => !p)
  }

  return (
    <button
      onClick={handleClick}
      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all hover:scale-110 active:scale-95"
    >
      <span
        className={`material-symbols-outlined text-[18px] transition-colors ${liked ? 'text-primary-container' : 'text-white'}`}
        style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        favorite
      </span>
    </button>
  )
}

export default function ComingSoonSection() {
  return (
    <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <h2 className="font-display-lg text-headline-xl text-on-surface mb-12">PHIM SẮP CHIẾU</h2>

      <div className="flex gap-gutter overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-4">
        {UPCOMING.map((item) => (
          <div
            key={item.id}
            className="min-w-[400px] h-64 rounded-3xl overflow-hidden relative group cursor-pointer shadow-xl flex-shrink-0"
          >
            <img
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              src={item.imageUrl}
              alt={item.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
              <span className="text-primary-container text-xs font-bold mb-2 font-label-sm tracking-widest">
                {item.releaseLabel}
              </span>
              <h4 className="font-headline-lg text-headline-lg font-bold text-white">{item.title}</h4>
              <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-lg text-sm border border-white/30 text-white hover:bg-white/30 transition-colors">
                  Xem Trailer
                </button>
                <button className="text-white text-sm flex items-center gap-1 hover:text-primary transition-colors">
                  Nhận thông báo{' '}
                  <span className="material-symbols-outlined text-sm">notifications</span>
                </button>
              </div>
            </div>

            {/* Heart button */}
            <HeartBtn movie={item} />
          </div>
        ))}
      </div>
    </section>
  )
}

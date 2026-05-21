import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { MOVIES_LIST } from '../data/movies'

const GENRES = ['Tất Cả', 'Action', 'Drama', 'Sci-Fi', 'Horror', 'Animation', 'Documentary']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới Nhất' },
  { value: 'rating', label: 'Đánh Giá Cao' },
  { value: 'ai', label: 'AI Gợi Ý' },
]
const PAGE_SIZE = 10

function MovieListCard({ id, title, genres, duration, aiScore, posterUrl }) {
  const navigate = useNavigate()
  return (
    <div
      className="group relative rounded-2xl overflow-hidden border border-white/5 chroma-shadow-red cursor-pointer"
      onClick={() => navigate(`/movies/${id}`)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={posterUrl}
          alt={title}
        />

        {/* AI badge — top right */}
        {aiScore && (
          <div className="absolute top-3 right-3 bg-primary-container/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white shadow-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            {aiScore}
          </div>
        )}

        {/* Bottom gradient */}
        <div className="poster-gradient absolute inset-0" />

        {/* Hover overlay — Book Now button */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <button className="w-full py-2.5 primary-gradient text-white rounded-xl font-bold text-sm translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            Đặt Vé
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-surface-container">
        <h3 className="font-headline-lg text-on-surface truncate group-hover:text-primary-container transition-colors duration-300 text-sm">
          {title}
        </h3>
        <p className="text-on-surface-variant text-xs mt-1 truncate">
          {genres[0]}{duration ? ` • ${duration}` : ''}
        </p>
      </div>
    </div>
  )
}

export default function MoviesPage() {
  const navigate = useNavigate()
  const [activeGenre, setActiveGenre] = useState('Tất Cả')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = activeGenre === 'Tất Cả'
      ? MOVIES_LIST
      : MOVIES_LIST.filter((m) => m.genres.some((g) => g === activeGenre))

    if (sort === 'rating' || sort === 'ai') {
      list = [...list].sort((a, b) => parseFloat(b.aiScore) - parseFloat(a.aiScore))
    }
    return list
  }, [activeGenre, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleGenreChange(genre) {
    setActiveGenre(genre)
    setPage(1)
  }

  function handleSortChange(e) {
    setSort(e.target.value)
    setPage(1)
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 relative z-10">
        {/* Page header */}
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6 text-sm"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Trang chủ
          </button>

          <h1 className="font-display-lg text-headline-xl text-on-surface mb-2">
            Khám Phá <span className="text-gradient">Phim</span>
          </h1>
          <p className="text-on-surface-variant">
            {filtered.length} bộ phim được tìm thấy
          </p>
        </div>

        {/* Filter bar */}
        <div className="sticky top-[72px] z-30 bg-surface/80 backdrop-blur-xl border-b border-white/5 mb-8">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Genre chips */}
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => handleGenreChange(g)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    activeGenre === g
                      ? 'primary-gradient text-white border-transparent'
                      : 'border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant text-base">sort</span>
              <select
                value={sort}
                onChange={handleSortChange}
                className="bg-surface-container-high border border-white/10 text-on-surface text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-container/40 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Movie grid */}
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          {paginated.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-gutter">
              {paginated.map((movie) => (
                <MovieListCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  genres={movie.genres}
                  duration={movie.duration}
                  aiScore={movie.aiScore}
                  posterUrl={movie.posterUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-4 block">movie_filter</span>
              <p className="text-lg">Không tìm thấy phim phù hợp</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-14">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                    page === n
                      ? 'primary-gradient text-white border-transparent'
                      : 'border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface'
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

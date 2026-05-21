import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from './MovieCard'
import { MovieCardSkeleton } from './Skeleton'
import { MOVIES_DATA } from '../data/movies'

const MOVIES = Object.values(MOVIES_DATA)

export default function NowShowingSection() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="font-display-lg text-headline-xl text-primary-container mb-2">
            PHIM ĐANG CHIẾU
          </h2>
          <p className="text-on-surface-variant">Khám phá những siêu phẩm điện ảnh nóng nhất hiện nay</p>
        </div>
        <a
          onClick={() => navigate('/movies')}
          className="text-primary hover:underline underline-offset-8 flex items-center gap-2 transition-colors duration-300 cursor-pointer"
        >
          Xem tất cả <span className="material-symbols-outlined">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-gutter">
        {loading
          ? [...Array(5)].map((_, i) => <MovieCardSkeleton key={i} />)
          : MOVIES.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                genre={movie.genres[0]}
                duration={movie.duration}
                aiScore={movie.aiScore}
                imageUrl={movie.posterUrl}
              />
            ))}
      </div>
    </section>
  )
}

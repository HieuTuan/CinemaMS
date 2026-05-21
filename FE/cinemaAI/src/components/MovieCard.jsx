import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isWishlisted, toggleWishlist } from '../utils/wishlist'

export default function MovieCard({ id, title, genre, duration, ageRating, aiScore, imageUrl }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(() => (id ? isWishlisted(id) : false))

  function handleHeart(e) {
    e.stopPropagation()
    if (!id) return
    toggleWishlist({
      id:       Number(id),
      title,
      posterUrl: imageUrl,
      genres:   genre ? [genre] : [],
      status:   'now_showing',
    })
    setLiked(p => !p)
  }

  return (
    <div className="group cursor-pointer" onClick={() => id && navigate(`/movies/${id}`)}>
      {/* Card image */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden glass-card mb-4">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={imageUrl}
          alt={title}
        />

        {/* Heart button — top right */}
        <button
          onClick={handleHeart}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all hover:scale-110 active:scale-95"
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-colors ${liked ? 'text-primary-container' : 'text-white'}`}
            style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            favorite
          </span>
        </button>

        {/* AI score badge */}
        {aiScore && (
          <div className="absolute top-3 left-3 bg-primary-container px-2 py-1 rounded text-xs font-bold text-white shadow-lg">
            {aiScore} AI
          </div>
        )}

        {/* Age rating fallback (shown only when no aiScore) */}
        {ageRating && !aiScore && (
          <div className="absolute top-3 left-3 bg-surface/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded border border-white/10">
            {ageRating}
          </div>
        )}

        {/* Hover overlay – book button */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <button
            className="w-full py-3 bg-white text-surface rounded-lg font-bold hover:bg-primary-container hover:text-white transition-colors duration-200"
            onClick={(e) => { e.stopPropagation(); id && navigate(`/booking/${id}`) }}
          >
            ĐẶT VÉ
          </button>
        </div>
      </div>

      {/* Below card */}
      <h3 className="font-headline-lg text-on-surface truncate group-hover:text-primary-container transition-colors duration-300">
        {title}
      </h3>
      <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
        {genre && duration ? `${genre} • ${duration}` : genre || duration || ''}
      </p>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'

export default function MovieCard({ id, title, genre, duration, ageRating, aiScore, imageUrl }) {
  const navigate = useNavigate()

  return (
    <div className="group cursor-pointer" onClick={() => id && navigate(`/movies/${id}`)}>
      {/* Card image */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden glass-card mb-4">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={imageUrl}
          alt={title}
        />

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
            onClick={(e) => e.stopPropagation()}
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

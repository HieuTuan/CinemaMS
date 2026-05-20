import { useNavigate } from 'react-router-dom'

export default function MovieCard({ id, title, genre, duration, ageRating, badge, imageUrl, delay = 'stagger-1', className = '' }) {
  const navigate = useNavigate()
  return (
    <div
      className={`group cursor-pointer relative opacity-0 animate-fade-in-up ${delay} ${className}`}
      onClick={() => navigate(`/movies/${id}`)}
    >
      <div
        className={`aspect-[2/3] rounded-xl overflow-hidden relative border border-white/5 transition-all duration-500 poster-hover ${
          badge === 'HOT' ? 'chroma-shadow-secondary' : ''
        }`}
      >
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          src={imageUrl}
          alt={title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Age rating badge */}
        {ageRating && (
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            <span className="bg-surface/80 backdrop-blur-md text-white font-label-sm text-[10px] px-2 py-1 rounded-md border border-white/10 group-hover:bg-primary/20 transition-colors duration-300">
              {ageRating}
            </span>
          </div>
        )}

        {/* HOT badge */}
        {badge && (
          <div className="absolute top-2 right-2">
            <span className="bg-primary/90 text-primary-fixed-dim font-label-sm text-[10px] px-2 py-1 rounded-md animate-pulse">
              {badge}
            </span>
          </div>
        )}

        {/* Title + genre */}
        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-headline-lg text-headline-lg text-white mb-1 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="font-body-md text-body-md text-on-surface/70 text-sm">
            {genre} • {duration}
          </p>
        </div>
      </div>
    </div>
  )
}

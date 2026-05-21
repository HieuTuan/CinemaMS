const KEY = 'cp_wishlist'

export function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function isWishlisted(id) {
  return getWishlist().some(m => m.id === Number(id))
}

/** movie: { id, title, posterUrl, genres, status } */
export function toggleWishlist(movie) {
  const list = getWishlist()
  const idx  = list.findIndex(m => m.id === Number(movie.id))
  if (idx >= 0) {
    list.splice(idx, 1)
  } else {
    list.unshift({ ...movie, id: Number(movie.id) })
  }
  localStorage.setItem(KEY, JSON.stringify(list))
  // Fire a storage event so other tabs (and the Wishlist page) can react
  window.dispatchEvent(new Event('wishlist-change'))
  return list
}

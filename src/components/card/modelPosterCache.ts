const cacheKey = (src: string) => `plot.model-poster.v1:${src}`;

export function loadModelPoster(src: string): string | undefined {
  try {
    const poster = localStorage.getItem(cacheKey(src));
    if (poster && /^data:image\/(webp|png);base64,/.test(poster)) return poster;
  } catch {
    // Storage is optional for the viewer.
  }
  return undefined;
}

export function saveModelPoster(src: string, poster: string) {
  try {
    localStorage.setItem(cacheKey(src), poster);
  } catch {
    // The current view can still use the poster when browser storage is full.
  }
}

// Sort places by date — earliest first
export function sortPlacesByDate(places) {
  return [...places].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });
}

// Build a clear summary of all places for the prompt
export function buildPlacesSummary(sortedPlaces) {
  return sortedPlaces.map((place, index) => {
    return `Place ${index + 1}: ${place.name}
  - Date: ${place.date || 'unknown'}
  - Mood: ${place.mood || 'not specified'}
  - Notes from traveler: ${place.description || 'none'}
  - Photos: ${place.photoCount} photo(s)`;
  }).join('\n\n');
}
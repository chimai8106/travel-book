const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Generate a storybook from trip data + photos
 * @param {Object} tripData - from UploadWizard: { tripName, destination, dates, moods, memories, photos, videos }
 * @returns {Object} storybook JSON from backend
 */
export async function generateStorybook(tripData) {
  const formData = new FormData();

  formData.append("title", tripData.tripName);
  formData.append("place", tripData.destination);
  formData.append("date", tripData.dates || "");
  formData.append("mood", (tripData.moods || []).join(", "));
  formData.append("description", tripData.memories || "");

  // Attach up to 5 photos (backend limit)
  const photos = (tripData.photos || []).slice(0, 5);
  photos.forEach((file) => formData.append("photos", file));

  const res = await fetch(`${BASE_URL}/api/generate-storybook`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Generation failed");
  return data.storybook;
}

/**
 * Regenerate with a fresh tone
 */
export async function regenerateStorybook(tripData) {
  const formData = new FormData();

  formData.append("title", tripData.tripName);
  formData.append("place", tripData.destination);
  formData.append("date", tripData.dates || "");
  formData.append("mood", (tripData.moods || []).join(", "));
  formData.append("description", tripData.memories || "");

  const photos = (tripData.photos || []).slice(0, 5);
  photos.forEach((file) => formData.append("photos", file));

  const res = await fetch(`${BASE_URL}/api/regenerate`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Regeneration failed");
  return data.storybook;
}

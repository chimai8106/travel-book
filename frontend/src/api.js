const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function buildFormData(tripData) {
  const formData = new FormData();
  formData.append("trip_title", tripData.tripName);
  formData.append("memories", tripData.memories || "");

  (tripData.places || []).forEach((place, i) => {
    formData.append(`places[${i}][name]`, place.name || "");
    formData.append(`places[${i}][date]`, place.date || "");
    formData.append(`places[${i}][mood]`, (place.moods || []).join(", "));
    formData.append(`places[${i}][description]`, place.description || "");
    (place.photos || []).slice(0, 5).forEach((file) => {
      formData.append(`photos_${i}`, file);
    });
  });
  // ADD THIS 👇
  console.log('=== FORMDATA DEBUG ===');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
  }
  console.log('=== END FORMDATA DEBUG ===');

  return formData;

  return formData;
}

export async function generateStorybook(tripData) {
  const res = await fetch(`${BASE_URL}/api/generate-storybook`, {
    method: "POST",
    body: buildFormData(tripData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Generation failed");
  return data.storybook;
}

export async function regenerateStorybook(tripData) {
  const res = await fetch(`${BASE_URL}/api/regenerate`, {
    method: "POST",
    body: buildFormData(tripData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Regeneration failed");
  return data.storybook;
}

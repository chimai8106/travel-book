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
  return formData;
}

export async function generateStorybook(tripData) {
  const res = await fetch(`${BASE_URL}/api/generate-storybook`, {
    method: "POST",
    body: buildFormData(tripData),
  });
  if (!res.ok) {
    let errMsg = `Server error ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.error || err.detail || errMsg;
    } catch {
      errMsg = await res.text().catch(() => errMsg);
    }
    throw new Error(errMsg);
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
    let errMsg = `Server error ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.error || err.detail || errMsg;
    } catch {
      errMsg = await res.text().catch(() => errMsg);
    }
    throw new Error(errMsg);
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Regeneration failed");
  return data.storybook;
}
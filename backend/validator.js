export function validateTripInput(req, res, next) {
  const { trip_title } = req.body;

  // Check trip title exists
  if (!trip_title || trip_title.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed',
      detail: 'Trip title is required'
    });
  }

  // Check at least one place was submitted
  const files = req.files;
  if (!files || Object.keys(files).length === 0) {
    return res.status(400).json({
      error: 'Validation failed',
      detail: 'At least one place with photos is required'
    });
  }

  next();
}
export function validateTripInput(req, res, next) {
  const { trip_title } = req.body;

  // Check trip title exists
  if (!trip_title || trip_title.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed',
      detail: 'Trip title is required'
    });
  }
  next();
}
export function validateTripInput(req, res, next) {
  const { trip_title } = req.body;

  if (!trip_title || trip_title.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed',
      detail: 'Trip title is required'
    });
  }

  // req.files from multer .any() is an ARRAY, not an object
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({
      error: 'Validation failed',
      detail: 'At least one place with photos is required'
    });
  }

  next();
}
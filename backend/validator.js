export function validateTripInput(req, res, next) {
  const { title, place } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed',
      detail: 'Trip title is required'
    });
  }

  if (!place || place.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed',
      detail: 'Destination is required'
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      error: 'Validation failed',
      detail: 'At least one photo is required'
    });
  }

  if (req.files.length > 5) {
    return res.status(400).json({
      error: 'Validation failed',
      detail: 'Maximum 5 photos allowed'
    });
  }

  next();
}
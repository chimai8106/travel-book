// This function handles all errors in one place
export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  // If it's a multer error (file upload problem)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error',
      detail: err.message
    });
  }

  // If Gemini couldn't parse the response
  if (err instanceof SyntaxError) {
    return res.status(500).json({
      error: 'AI response was not valid JSON',
      detail: 'Gemini returned an unexpected format. Please try again.'
    });
  }

  // If the Gemini API key is wrong or missing
  if (err.message?.includes('API key')) {
    return res.status(401).json({
      error: 'Invalid Gemini API key',
      detail: 'Check your .env file'
    });
  }

  // If Gemini is overloaded or rate limited
  if (err.message?.includes('429') || err.message?.includes('quota')) {
    return res.status(429).json({
      error: 'Gemini rate limit reached',
      detail: 'Too many requests. Please wait a moment and try again.'
    });
  }

  // If the model name is wrong
  if (err.message?.includes('404') || err.message?.includes('not found')) {
    return res.status(404).json({
      error: 'Gemini model not found',
      detail: 'Check the model name in gemini.js'
    });
  }

  // ElevenLabs API errors
  if (err.message?.includes('ElevenLabs') || err.message?.includes('quota_exceeded')) {
    return res.status(429).json({
      error: 'ElevenLabs limit reached',
      detail: 'Audio generation quota exceeded. Try again later.'
    });
  }

  // Generic fallback for anything else
  res.status(500).json({
    error: 'Something went wrong',
    detail: err.message || 'Unknown error'
  });
}
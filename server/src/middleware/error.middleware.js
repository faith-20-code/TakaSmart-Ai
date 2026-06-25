const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);

  if (err.code === 'P2002') {
    return res.status(409).json({ 
      error: `This ${err.meta?.target?.[0] || 'value'} is already registered.` 
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed.',
      details: err.errors.map(e => ({ 
        field: e.path.join('.'), 
        message: e.message 
      })),
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Something went wrong.' });
};

module.exports = { errorHandler };
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const listingRoutes = require('./routes/listing.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;
const uploadRoutes = require('./routes/upload.routes');
const collectionPointRoutes = require('./routes/collectionPoint.routes');
const dropoffRoutes = require('./routes/dropoff.routes');
const pointsRoutes = require('./routes/points.routes');
const userRoutes = require('./routes/user.routes');
const eprRoutes = require('./routes/epr.routes');
const aiRoutes = require('./routes/ai.routes');


const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/collection-points', collectionPointRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dropoffs', dropoffRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/epr', eprRoutes);
app.use('/api/ai', aiRoutes);

// Error handler must always be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

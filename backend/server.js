require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authMiddleware = require('./middleware/auth');
const seedAdmin = require('./seed/seedAdmin');

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json({ limit: '10mb' }));

// Public routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/generate',  authMiddleware, require('./routes/generate'));
app.use('/api/validate',  authMiddleware, require('./routes/validate'));
app.use('/api/posts',     authMiddleware, require('./routes/posts'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// MongoDB connection + server start
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    app.listen(process.env.PORT || 3000, () => {
      console.log(`✅ Backend running at http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

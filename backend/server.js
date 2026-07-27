require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/generate', require('./routes/generate'));
app.use('/api/posts', require('./routes/posts'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// MongoDB connection + server start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`✅ Backend running at http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('💡 Make sure MongoDB is running: brew services start mongodb-community@7.0');
    process.exit(1);
  });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/property', require('./routes/propertyRoutes'));
app.use('/api/predict', require('./routes/predict'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

// Start server
const PORT = process.env.PORT || 5000;

// Serve React frontend build (only in production or after build)
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(PORT, async () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);

  // Only run ngrok locally
  if (process.env.NODE_ENV !== 'production') {
    const ngrok = require('ngrok');
    const url = await ngrok.connect(PORT);
    console.log(`🌐 Ngrok tunnel: ${url}`);

    // Update BASE_URL in .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      let updatedEnv;
      if (/^BASE_URL=/m.test(envContent)) {
        updatedEnv = envContent.replace(/^BASE_URL=.*/m, `BASE_URL=${url}`);
      } else {
        updatedEnv = envContent + `\nBASE_URL=${url}`;
      }
      fs.writeFileSync(envPath, updatedEnv);
    }
    process.env.BASE_URL = url; // Update runtime env
    console.log(`✅ BASE_URL updated in .env: ${url}`);
  }
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadModel: loadViT } = require('./services/vitInference');
const { loadModel: loadCNN } = require('./services/cnnInference');
const app = express();
const CNNRouter = require('./routes/cnn');
const ViTRouter = require('./routes/vit');

const FRONTEND_DIST = path.join(__dirname, 'views/dist');

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/v1/cnn", CNNRouter);
app.use("/api/v1/vit", ViTRouter);

// Serve the React build
app.use(express.static(FRONTEND_DIST));

// For any non-API route return index.html so React Router handles it client-side
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

app.listen(3000, async () => {
    await Promise.all([loadViT(), loadCNN()]);
    console.log('Server is running on port 3000');
});
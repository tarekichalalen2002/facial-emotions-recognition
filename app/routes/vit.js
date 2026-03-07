const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const vitController = require('../controllers/vit');

// Store uploaded file in memory so the controller receives req.file.buffer
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', (req, res) => {
    res.send('ViT emotion detection endpoint. POST /predict with an image.');
});

router.post('/predict', upload.single('image'), vitController.predict);
router.post("/predict-video", upload.single("video"), vitController.predictVideo);

module.exports = router;

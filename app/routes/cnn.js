const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const cnnController = require('../controllers/cnn');

// Store uploaded file in memory so the controller receives req.file.buffer
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', (req, res) => {
    res.send('CNN emotion detection endpoint. POST /predict with an image.');
});

router.post('/predict', upload.single('image'), cnnController.predict);
router.post("/predict-video", upload.single("video"), cnnController.predictVideo);

module.exports = router;

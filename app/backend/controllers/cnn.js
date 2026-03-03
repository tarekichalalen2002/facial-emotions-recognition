const { runInference } = require('../services/cnnInference');
const { extractImagesFromVideo } = require('../services/extractImagesFromVideo');

const predict = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided. Send the image as multipart/form-data with field name "image".' });
    }

    try {
        const result = await runInference(req.file.buffer);
        res.json(result);
    } catch (err) {
        console.error('CNN inference error:', err);
        res.status(500).json({ error: 'Inference failed.', details: err.message });
    }
};

const predictVideo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video file provided. Send the video as multipart/form-data with field name "video".' });
    }

    try {
        const frames = await extractImagesFromVideo(req.file.buffer);

        if (frames.length === 0) {
            return res.status(422).json({ error: 'No frames could be extracted from the video.' });
        }

        const results = await Promise.all(frames.map((frame) => runInference(frame)));

        const emotionKeys = Object.keys(results[0].probabilities);
        const averaged = {};
        for (const key of emotionKeys) {
            averaged[key] = parseFloat(
                (results.reduce((sum, r) => sum + r.probabilities[key], 0) / results.length).toFixed(2)
            );
        }

        const predictedLabel = Object.entries(averaged).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

        res.json({
            label: predictedLabel,
            confidence: averaged[predictedLabel],
            probabilities: averaged,
            frameCount: frames.length,
        });
    } catch (err) {
        console.error('CNN video inference error:', err);
        res.status(500).json({ error: 'Inference failed.', details: err.message });
    }
};

module.exports = { predict, predictVideo };

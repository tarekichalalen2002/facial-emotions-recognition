const ort = require('onnxruntime-node');
const sharp = require('sharp');
const path = require('path');
const { drawFaceBoxes } = require('./faceDetection');

const MODEL_PATH = path.join(__dirname, '../models/ViT/affectNet-7-emotions.onnx');

const EMOTION_LABELS = ['neutral', 'happy', 'sad', 'surprise', 'fear', 'disgust', 'anger'];

// ImageNet normalization constants
const MEAN = [0.485, 0.456, 0.406];
const STD  = [0.229, 0.224, 0.225];

let session = null;

async function loadModel() {
    if (!session) {
        session = await ort.InferenceSession.create(MODEL_PATH, {
            executionProviders: ['cpu'],
        });
        console.log('ViT ONNX model loaded.');
    }
    return session;
}

/**
 * Preprocess an image buffer into a Float32Array tensor [1, 3, 224, 224].
 * Steps: resize → raw RGB pixels → normalize with ImageNet mean/std.
 */
async function preprocessImage(imageBuffer) {
    const { data } = await sharp(imageBuffer)
        .resize(224, 224)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const pixelCount = 224 * 224;
    const tensor = new Float32Array(3 * pixelCount);

    for (let i = 0; i < pixelCount; i++) {
        const r = data[i * 3]     / 255.0;
        const g = data[i * 3 + 1] / 255.0;
        const b = data[i * 3 + 2] / 255.0;

        tensor[0 * pixelCount + i] = (r - MEAN[0]) / STD[0];
        tensor[1 * pixelCount + i] = (g - MEAN[1]) / STD[1];
        tensor[2 * pixelCount + i] = (b - MEAN[2]) / STD[2];
    }

    return tensor;
}

function softmax(logits) {
    const max = Math.max(...logits);
    const exps = logits.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
}

/**
 * Run inference on an image buffer.
 * Returns { label, confidence, probabilities, annotatedImage, faces }.
 * annotatedImage is a base64 data-URL with Viola-Jones bounding boxes drawn on it.
 */
async function runInference(imageBuffer) {
    const sess = await loadModel();

    // Run inference and face detection in parallel — they both read the same input buffer
    const [tensorData, { annotatedBuffer, faces }] = await Promise.all([
        preprocessImage(imageBuffer),
        drawFaceBoxes(imageBuffer),
    ]);

    const inputTensor = new ort.Tensor('float32', tensorData, [1, 3, 224, 224]);
    const results = await sess.run({ input: inputTensor });
    const logits = Array.from(results.logits.data);
    const probs = softmax(logits);

    const predictedIdx = probs.indexOf(Math.max(...probs));

    return {
        label: EMOTION_LABELS[predictedIdx],
        confidence: parseFloat((probs[predictedIdx] * 100).toFixed(2)),
        probabilities: Object.fromEntries(
            EMOTION_LABELS.map((label, i) => [label, parseFloat((probs[i] * 100).toFixed(2))])
        ),
        faces,
        annotatedImage: `data:image/jpeg;base64,${annotatedBuffer.toString('base64')}`,
    };
}

module.exports = { loadModel, runInference };

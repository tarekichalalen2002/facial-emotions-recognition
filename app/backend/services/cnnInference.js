const ort = require('onnxruntime-node');
const sharp = require('sharp');
const path = require('path');
const { drawFaceBoxes } = require('./faceDetection');

const MODEL_PATH = path.join(__dirname, '../models/CNN/CNN_FER.onnx');

// Original FER-2013 alphabetical order — CNN is evaluated WITHOUT remap_labels (see CNN&ViT_Comparaison.ipynb)
// ImageFolder sorts class folders alphabetically: 0 angry | 1 disgust | 2 fear | 3 happy | 4 neutral | 5 sad | 6 surprise
const EMOTION_LABELS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise'];

// Single-channel normalization: mean=0.5, std=0.5  →  pixel_norm = (pixel/255 - 0.5) / 0.5
const MEAN = 0.5;
const STD  = 0.5;

let session = null;

async function loadModel() {
    if (!session) {
        session = await ort.InferenceSession.create(MODEL_PATH, {
            executionProviders: ['cpu'],
        });
        console.log('CNN ONNX model loaded.');
    }
    return session;
}

/**
 * Preprocess an image buffer into a Float32Array tensor [1, 1, 48, 48].
 * Steps: resize to 48x48 → grayscale → normalize with mean=0.5, std=0.5.
 */
async function preprocessImage(imageBuffer) {
    const { data } = await sharp(imageBuffer)
        .resize(48, 48)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const pixelCount = 48 * 48;
    const tensor = new Float32Array(pixelCount);

    for (let i = 0; i < pixelCount; i++) {
        tensor[i] = (data[i] / 255.0 - MEAN) / STD;
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

    // Single Viola-Jones pass: get annotated image + faces array
    const { annotatedBuffer, faces } = await drawFaceBoxes(imageBuffer);

    // Crop the largest detected face for inference; fall back to full image if none found
    let faceBuffer = imageBuffer;
    if (faces.length > 0) {
        const best = faces.reduce((a, b) => (b.width * b.height > a.width * a.height ? b : a));
        faceBuffer = await sharp(imageBuffer)
            .extract({ left: best.x, top: best.y, width: best.width, height: best.height })
            .toBuffer();
    }

    const tensorData = await preprocessImage(faceBuffer);

    const inputTensor = new ort.Tensor('float32', tensorData, [1, 1, 48, 48]);
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

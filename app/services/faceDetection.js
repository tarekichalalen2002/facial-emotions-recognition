const cv = require('@techstark/opencv-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const CASCADE_PATH = path.join(__dirname, '../haarcascades/haarcascade_frontalface_default.xml');
const CASCADE_FS_PATH = '/haarcascade_frontalface_default.xml';

let cvReady = false;
let classifier = null;
let initPromise = null;  // shared promise — prevents duplicate concurrent initialisation

/**
 * Wait for the OpenCV WASM module to initialise, then load the cascade once.
 * All concurrent callers share the same promise so the WASM FS file is
 * created exactly once even when many frames are processed in parallel.
 */
async function initCV() {
    if (cvReady) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        await new Promise((resolve) => {
            if (cv.Mat) {
                resolve();
            } else {
                cv.onRuntimeInitialized = resolve;
            }
        });

        // Mount the XML into the WASM virtual filesystem so CascadeClassifier can read it
        const xmlData = fs.readFileSync(CASCADE_PATH);
        cv.FS_createDataFile('/', 'haarcascade_frontalface_default.xml', xmlData, true, false, false);

        classifier = new cv.CascadeClassifier();
        classifier.load(CASCADE_FS_PATH);

        cvReady = true;
        console.log('Viola-Jones face detector loaded.');
    })();

    return initPromise;
}

/**
 * Detect the largest face in an image buffer using Viola-Jones (Haar cascades).
 *
 * @param {Buffer} imageBuffer  - Raw image (any format sharp can decode)
 * @returns {Buffer}            - Cropped face buffer, or the original buffer if no face is found
 */
async function detectAndCropFace(imageBuffer) {
    await initCV();

    // Decode and convert to grayscale for detection
    const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height } = info;

    // Build an OpenCV grayscale Mat from raw pixel data
    const grayMat = cv.matFromArray(height, width, cv.CV_8UC1, data);

    // Viola-Jones detection — signature: (Mat, RectVector, scaleFactor, minNeighbors, flags, minSize, maxSize)
    const faces = new cv.RectVector();
    classifier.detectMultiScale(grayMat, faces, 1.1, 3, 0, new cv.Size(30, 30), new cv.Size(0, 0));

    grayMat.delete();

    if (faces.size() === 0) {
        faces.delete();
        // No face detected — return the original image unchanged
        return imageBuffer;
    }

    // Pick the largest detected face
    let best = faces.get(0);
    for (let i = 1; i < faces.size(); i++) {
        const r = faces.get(i);
        if (r.width * r.height > best.width * best.height) best = r;
    }

    const { x, y, width: w, height: h } = best;
    faces.delete();

    // Crop with sharp (no OpenCV Mat needed for the output)
    return sharp(imageBuffer)
        .extract({ left: x, top: y, width: w, height: h })
        .toBuffer();
}

/**
 * Detect all faces and draw bounding boxes on the original image.
 * Uses SVG composite overlay via sharp — no extra OpenCV Mats for output.
 *
 * @param {Buffer} imageBuffer  - Raw image (any format sharp can decode)
 * @returns {{ annotatedBuffer: Buffer, faces: Array<{x,y,width,height}> }}
 */
async function drawFaceBoxes(imageBuffer) {
    await initCV();

    const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height } = info;

    const grayMat = cv.matFromArray(height, width, cv.CV_8UC1, data);
    const faceVec = new cv.RectVector();
    classifier.detectMultiScale(grayMat, faceVec, 1.1, 3, 0, new cv.Size(30, 30), new cv.Size(0, 0));
    grayMat.delete();

    const faces = [];
    for (let i = 0; i < faceVec.size(); i++) {
        const { x, y, width: w, height: h } = faceVec.get(i);
        faces.push({ x, y, width: w, height: h });
    }
    faceVec.delete();

    if (faces.length === 0) {
        return { annotatedBuffer: imageBuffer, faces };
    }

    // Build an SVG layer with one rectangle per detected face
    const rects = faces
        .map(({ x, y, width: w, height: h }) =>
            `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#00FF00" stroke-width="3"/>`
        )
        .join('');

    const svg = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${rects}</svg>`
    );

    const annotatedBuffer = await sharp(imageBuffer)
        .composite([{ input: svg, top: 0, left: 0 }])
        .jpeg()
        .toBuffer();

    return { annotatedBuffer, faces };
}

module.exports = { detectAndCropFace, drawFaceBoxes };

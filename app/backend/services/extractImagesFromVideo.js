const { Readable } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Use the bundled ffmpeg binary — no system install required
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Detect the container format from the first bytes of the buffer (magic bytes).
 * Required for piped stdin input where ffmpeg cannot seek to probe the format.
 */
function detectFormat(buffer) {
    // WebM: 1A 45 DF A3
    if (buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3)
        return 'webm'
    // MP4 / MOV: 'ftyp' box at offset 4  (66 74 79 70)
    if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70)
        return 'mp4'
    // AVI: RIFF header  52 49 46 46
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46)
        return 'avi'
    // MKV: same EBML header as WebM but different DocType — treat as matroska
    return 'mp4' // safe default
}

// JPEG frame boundary markers
const SOI = Buffer.from([0xff, 0xd8, 0xff]); // Start Of Image
const EOI = Buffer.from([0xff, 0xd9]);        // End Of Image

/**
 * Split a concatenated JPEG stream (image2pipe output) into individual frame buffers.
 */
function splitJpegFrames(data) {
    const frames = [];
    let pos = 0;
    while (pos < data.length) {
        const start = data.indexOf(SOI, pos);
        if (start === -1) break;
        const end = data.indexOf(EOI, start + 2);
        if (end === -1) break;
        frames.push(data.slice(start, end + 2));
        pos = end + 2;
    }
    return frames;
}

/**
 * Extract frames from a video buffer entirely in RAM at the given FPS.
 * Nothing is written to disk.
 *
 * @param {Buffer} videoBuffer
 * @param {number} fps         - Frames to extract per second of video (default: 5)
 * @returns {Promise<Buffer[]>} - Array of JPEG frame buffers
 */
const extractImagesFromVideo = (videoBuffer, fps = 5) => {
    return new Promise((resolve, reject) => {
        // Feed the video buffer into ffmpeg via stdin stream
        const inputStream = new Readable({
            read() {
                this.push(videoBuffer);
                this.push(null);
            },
        });

        const chunks = [];

        const proc = ffmpeg(inputStream)
            .inputFormat(detectFormat(videoBuffer))
            .fps(fps)
            .format('image2pipe')
            .videoCodec('mjpeg')
            .on('error', reject)
            .pipe();

        proc.on('data', (chunk) => chunks.push(chunk));
        proc.on('end', () => resolve(splitJpegFrames(Buffer.concat(chunks))));
        proc.on('error', reject);
    });
};

module.exports = { extractImagesFromVideo };

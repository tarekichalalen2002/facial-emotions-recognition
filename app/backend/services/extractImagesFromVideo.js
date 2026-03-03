const { Readable } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Use the bundled ffmpeg binary — no system install required
ffmpeg.setFfmpegPath(ffmpegStatic);

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
            .inputFormat('mp4')
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
